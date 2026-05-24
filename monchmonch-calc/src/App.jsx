import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { C, DEFAULT } from "./constants.js";
import { parseSpreadsheetToState } from "./xlsxImport.js";
import LaunchTab from "./tabs/LaunchTab.jsx";
import UnitEconTab from "./tabs/UnitEconTab.jsx";
import RevenueTab from "./tabs/RevenueTab.jsx";
import ProductionTab from "./tabs/ProductionTab.jsx";
import PLTab from "./tabs/PLTab.jsx";
import FinancingTab from "./tabs/FinancingTab.jsx";
import GuideTab from "./tabs/GuideTab.jsx";

/** Persisted workspace (this browser only). Bump if stored shape changes incompatibly.
 * v5: added licensingByYear, bdSalesByYear, clinicalByYear, marketingByYear, payrollByYear arrays;
 *     channel costPerUnit + alloc + ramps rebuilt; equityRaised dropped from $15M to $2.5M;
 *     bumping key invalidates all prior cached workspaces so investors land on v5.0 defaults.
 * v6: bar BOM completed (was 8 of 14 ingredients qty=0; now all 14 populated + Monch Fiber added
 *     as 15th); fixed 5 engineering bugs from Ben's audit (overhead double-count, dimensional COGS,
 *     channel ramp in annual P&L, no working capital cash flow, channel caps in annual); added
 *     arDays/inventoryDays/apDays for proper WC modeling; cumulative breakeven now computed
 *     separately from single-year EBITDA+ year.
 */
const PERSIST_KEY = "monchmonch-calc-workspace-v6";

function readWorkspace() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    return data;
  } catch {
    return null;
  }
}

function writeWorkspace(payload) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PERSIST_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("MonchMonch autosave failed (storage full or disabled)", e);
  }
}

const initialWorkspace = readWorkspace();

export default function MonchMonchCalculator() {
  const [state, setState] = useState(() => ({ ...DEFAULT, ...(initialWorkspace?.state || {}) }));
  const [tab, setTab] = useState(() => (typeof initialWorkspace?.tab === "number" ? initialWorkspace.tab : 0));
  const [autosaveAt, setAutosaveAt] = useState(() => (initialWorkspace?.savedAt ?? null));
  const tabs = [
    { label: "Launch & Startup", icon: "🚀" },
    { label: "Unit Economics", icon: "⚙️" },
    { label: "Revenue & Channel", icon: "💰" },
    { label: "Production & Inventory", icon: "🏭" },
    { label: "5-Year P&L", icon: "📊" },
    { label: "Financing & Capital", icon: "🏦" },
    { label: "Guide", icon: "❓" },
  ];

  const fileRef = useRef(null);
  const xlsxRef = useRef(null);
  const [xlsxStatus, setXlsxStatus] = useState(null); // {ok: bool, msg: string} | null

  useEffect(() => {
    const id = window.setTimeout(() => {
      const savedAt = Date.now();
      writeWorkspace({ v: 1, state, tab, savedAt });
      setAutosaveAt(savedAt);
    }, 450);
    return () => window.clearTimeout(id);
  }, [state, tab]);

  const reset = () => {
    try {
      localStorage.removeItem(PERSIST_KEY);
    } catch { /* ignore */ }
    setState({ ...DEFAULT });
    setTab(0);
    setAutosaveAt(null);
  };

  const exportScenario = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monchmonch-scenario-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importScenario = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const loaded = JSON.parse(ev.target.result);
        const next = { ...DEFAULT, ...loaded };
        setState(next);
        const savedAt = Date.now();
        writeWorkspace({ v: 1, state: next, tab, savedAt });
        setAutosaveAt(savedAt);
      } catch { /* ignore malformed files */ }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const importSpreadsheet = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setXlsxStatus(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(new Uint8Array(ev.target.result), { type: "array" });
        const loaded = parseSpreadsheetToState(wb);
        const next = { ...DEFAULT, ...loaded };
        setState(next);
        const savedAt = Date.now();
        writeWorkspace({ v: 1, state: next, tab, savedAt });
        setAutosaveAt(savedAt);
        const ingredientCount = loaded.barRM?.filter(m => m.qty > 0).length ?? 0;
        setXlsxStatus({
          ok: true,
          msg: `Loaded "${file.name}" — ${loaded.channels?.length ?? 0} channels, ${ingredientCount} bar ingredients, $${(loaded.equityRaised || 0).toLocaleString()} raise`,
        });
        window.setTimeout(() => setXlsxStatus(null), 8000);
      } catch (err) {
        setXlsxStatus({ ok: false, msg: `Import failed: ${err.message}. File must be monchmonch_model_vN.xlsx (Ben's INPUTS schema).` });
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(180deg, ${C.bg} 0%, #100D1A 100%)`,
      color: C.text,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      padding: "0 0 40px 0",
    }}>
      <div style={{
        padding: "24px 32px 0",
        background: `linear-gradient(180deg, rgba(139,92,246,0.08) 0%, transparent 100%)`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{
              fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: -1,
              background: `linear-gradient(135deg, ${C.purple} 0%, ${C.violet} 50%, ${C.red} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              MonchMonch Financial Model
            </h1>
            <p style={{ color: C.textMuted, fontSize: 13, margin: "4px 0 0", fontWeight: 500 }}>
              Interactive Operations & Revenue Calculator — v6.0 (bars + ingredient licensing + working-capital cash flow)
            </p>
            <p style={{ color: C.textDim, fontSize: 11, margin: "6px 0 0", fontWeight: 500 }}>
              {autosaveAt
                ? `Autosaved in this browser — ${new Date(autosaveAt).toLocaleString()}`
                : "Edits autosave in this browser (localStorage). Reset clears the saved workspace."}
            </p>
            {xlsxStatus && (
              <p style={{
                color: xlsxStatus.ok ? C.green : C.red,
                fontSize: 11, margin: "8px 0 0", fontWeight: 600,
                padding: "6px 10px", borderRadius: 6,
                background: xlsxStatus.ok ? C.greenGlow : C.redGlow,
                border: `1px solid ${xlsxStatus.ok ? C.green : C.red}40`,
                display: "inline-block",
              }}>
                {xlsxStatus.ok ? "✓" : "⚠"} {xlsxStatus.msg}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={exportScenario} style={{
              padding: "8px 18px", borderRadius: 8, border: `1px solid ${C.purple}40`,
              background: C.purpleGlow, color: C.purple, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
            }}>Save Scenario</button>
            <button onClick={() => fileRef.current?.click()} style={{
              padding: "8px 18px", borderRadius: 8, border: `1px solid ${C.green}40`,
              background: C.greenGlow, color: C.green, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
            }}>Load Scenario (JSON)</button>
            <input ref={fileRef} type="file" accept=".json" onChange={importScenario} style={{ display: "none" }} />
            <button onClick={() => xlsxRef.current?.click()} style={{
              padding: "8px 18px", borderRadius: 8, border: `1px solid ${C.cyan}40`,
              background: `${C.cyan}1A`, color: C.cyan, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
            }}>Import from Excel</button>
            <input ref={xlsxRef} type="file" accept=".xlsx" onChange={importSpreadsheet} style={{ display: "none" }} />
            <button onClick={reset} style={{
              padding: "8px 18px", borderRadius: 8, border: `1px solid ${C.border}`,
              background: "transparent", color: C.textMuted, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
            }}
              onMouseOver={(e) => { e.target.style.borderColor = C.red; e.target.style.color = C.red; }}
              onMouseOut={(e) => { e.target.style.borderColor = C.border; e.target.style.color = C.textMuted; }}
            >
              Reset
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              padding: "10px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: "none", borderBottom: tab === i ? `2px solid ${C.purple}` : "2px solid transparent",
              background: tab === i ? "rgba(139,92,246,0.08)" : "transparent",
              color: tab === i ? C.purple : C.textMuted,
              borderRadius: "8px 8px 0 0", fontFamily: "inherit", transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
            }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 32px" }}>
        {tab === 0 && <LaunchTab state={state} setState={setState} />}
        {tab === 1 && <UnitEconTab state={state} setState={setState} />}
        {tab === 2 && <RevenueTab state={state} setState={setState} />}
        {tab === 3 && <ProductionTab state={state} setState={setState} />}
        {tab === 4 && <PLTab state={state} />}
        {tab === 5 && <FinancingTab state={state} setState={setState} />}
        {tab === 6 && <GuideTab />}
      </div>

      <div style={{ textAlign: "center", padding: "20px 32px 0", borderTop: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 11, color: C.textDim }}>
          MonchMonch Financial Model v6.0 — runs client-side — import scenarios from Ben's auditable spreadsheet or save your own as JSON
        </span>
      </div>
    </div>
  );
}
