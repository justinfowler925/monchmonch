import { useState } from "react";
import { C, DEFAULT } from "./constants.js";
import LaunchTab from "./tabs/LaunchTab.jsx";
import UnitEconTab from "./tabs/UnitEconTab.jsx";
import RevenueTab from "./tabs/RevenueTab.jsx";
import ProductionTab from "./tabs/ProductionTab.jsx";
import PLTab from "./tabs/PLTab.jsx";
import FinancingTab from "./tabs/FinancingTab.jsx";

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
  ];

  const reset = () => setState({ ...DEFAULT });

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
          <button onClick={reset} style={{
            padding: "8px 18px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: "transparent", color: C.textMuted, fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
          }}
            onMouseOver={(e) => { e.target.style.borderColor = C.red; e.target.style.color = C.red; }}
            onMouseOut={(e) => { e.target.style.borderColor = C.border; e.target.style.color = C.textMuted; }}
          >
            Reset to Defaults
          </button>
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
      </div>

      <div style={{ textAlign: "center", padding: "20px 32px 0", borderTop: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 11, color: C.textDim }}>
          MonchMonch Financial Model Calculator — KH Framework v3.0 — All calculations run client-side
        </span>
      </div>
    </div>
  );
}
