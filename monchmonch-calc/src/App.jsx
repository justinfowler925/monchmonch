import { useState, useRef } from "react";
import { C, DEFAULT } from "./constants.js";
import LaunchTab from "./tabs/LaunchTab.jsx";
import UnitEconTab from "./tabs/UnitEconTab.jsx";
import RevenueTab from "./tabs/RevenueTab.jsx";
import ProductionTab from "./tabs/ProductionTab.jsx";
import PLTab from "./tabs/PLTab.jsx";
import FinancingTab from "./tabs/FinancingTab.jsx";
import GuideTab from "./tabs/GuideTab.jsx";

export default function MonchMonchCalculator() {
  const [state, setState] = useState({ ...DEFAULT });
  const [tab, setTab] = useState(0);
  const tabs = [
    { label: "Launch & Startup", icon: "\uD83D\uDE80" },
    { label: "Unit Economics", icon: "\u2699\uFE0F" },
    { label: "Revenue & Channel", icon: "\uD83D\uDCB0" },
    { label: "Production & Inventory", icon: "\uD83C\uDFED" },
    { label: "5-Year P&L", icon: "\uD83D\uDCCA" },
    { label: "Financing & Capital", icon: "\uD83C\uDFE6" },
    { label: "Guide", icon: "\u2753" },
  ];

  const fileRef = useRef(null);
  const reset = () => setState({ ...DEFAULT });

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
        setState({ ...DEFAULT, ...loaded });
      } catch { /* ignore malformed files */ }
    };
    reader.readAsText(file);
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
              Interactive Operations & Revenue Calculator — v3.0
            </p>
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
            }}>Load Scenario</button>
            <input ref={fileRef} type="file" accept=".json" onChange={importScenario} style={{ display: "none" }} />
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
          MonchMonch Financial Model Calculator — KH Framework v3.0 — All calculations run client-side
        </span>
      </div>
    </div>
  );
}
