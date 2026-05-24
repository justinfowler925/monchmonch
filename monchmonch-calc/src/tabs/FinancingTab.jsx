import { useMemo } from "react";
import { C, fmt, fmtN, fmtPct } from "../constants.js";
import { runModel } from "../model.js";
import { glassCard, labelStyle, h3Style, MetricCard, InputRow, SliderInput, Sparkline } from "../components.jsx";

export default function FinancingTab({ state, setState }) {
  const model = useMemo(() => runModel(state), [state]);
  const yrs = model.years;
  const y1 = yrs[0];

  const totalCapitalNeeded = model.startupCapex +
    Math.max(...model.workingCapitalMonthly.map((w) => w.total)) +
    (y1.monthlyBurn > 0 ? y1.monthlyBurn * 6 : 0);

  const totalCapitalAvailable = state.startingCash + state.equityRaised + state.debtAmount;
  const capitalGap = totalCapitalNeeded - totalCapitalAvailable;

  const cashProjection = [];
  let runCash = totalCapitalAvailable - model.startupCapex;
  for (let m = 0; m < 60; m++) {
    const yIdx = Math.min(Math.floor(m / 12), 4);
    const yr = yrs[yIdx];
    runCash += yr.ebitda / 12;
    cashProjection.push(runCash);
  }

  const cfPositiveMonth = cashProjection.findIndex((c, i) => i > 0 && c > cashProjection[i - 1] && yrs[Math.min(Math.floor(i / 12), 4)].ebitda > 0);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <MetricCard label="Total Capital Needed" value={fmt(totalCapitalNeeded)} color={C.red} icon="💸" sub="startup + WC + runway" />
        <MetricCard label="Capital Available" value={fmt(totalCapitalAvailable)} color={C.green} icon="🏦" />
        <MetricCard label={capitalGap > 0 ? "Funding Gap" : "Surplus"} value={fmt(Math.abs(capitalGap))} color={capitalGap > 0 ? C.red : C.green} icon={capitalGap > 0 ? "⚠️" : "✅"} />
        <MetricCard label="Break-Even" value={model.breakEvenMonth ? `Month ${model.breakEvenMonth}` : "N/A"} color={C.amber} icon="🎯" sub={model.breakEvenMonth ? `~Year ${Math.ceil(model.breakEvenMonth / 12)}` : "Not within 5 years"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={glassCard}>
          <h3 style={h3Style}>CAPITAL SOURCES</h3>
          <InputRow label="Starting Cash" value={state.startingCash} step={10000}
            onChange={(v) => setState((p) => ({ ...p, startingCash: v }))} />
          <InputRow label="Equity Raised" value={state.equityRaised} step={10000}
            onChange={(v) => setState((p) => ({ ...p, equityRaised: v }))} />
          <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 12, paddingTop: 12 }}>
            <div style={{ ...labelStyle, marginBottom: 8, color: C.text, fontWeight: 600 }}>Debt Financing</div>
            <InputRow label="Loan Amount" value={state.debtAmount} step={10000}
              onChange={(v) => setState((p) => ({ ...p, debtAmount: v }))} />
            <SliderInput label="Interest Rate" value={state.debtRate} min={0} max={0.25} step={0.005}
              onChange={(v) => setState((p) => ({ ...p, debtRate: v }))} />
            <InputRow label="Term (months)" value={state.debtTerm} prefix="" suffix="mo" step={6}
              onChange={(v) => setState((p) => ({ ...p, debtTerm: v }))} />
            {state.debtAmount > 0 && (
              <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: C.amberGlow }}>
                <div style={{ fontSize: 11, color: C.amber }}>
                  Monthly Payment: {fmt(model.debtMonthlyPayment, 2)} | Total Interest: {fmt(model.debtMonthlyPayment * state.debtTerm - state.debtAmount)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={glassCard}>
          <h3 style={h3Style}>CAPITAL REQUIREMENTS BREAKDOWN</h3>
          {[
            { label: "Startup Capex", val: model.startupCapex, color: C.red },
            { label: "Peak Working Capital", val: Math.max(...model.workingCapitalMonthly.map((w) => w.total)), color: C.amber },
            { label: "Initial Inventory Build", val: model.workingCapitalMonthly[0]?.total || 0, color: C.orange },
            { label: "6-Month Op Runway", val: y1.monthlyBurn > 0 ? y1.monthlyBurn * 6 : 0, color: C.violet },
            { label: "Monthly Commitments (Y1)", val: model.commitmentMonthly * 12, color: C.purple },
          ].map((item) => {
            const maxVal = totalCapitalNeeded;
            const w = maxVal > 0 ? (item.val / maxVal) * 100 : 0;
            return (
              <div key={item.label} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 11, color: C.textMuted }}>{item.label}</span>
                  <span style={{ fontSize: 11, color: item.color, fontWeight: 700 }}>{fmt(item.val)}</span>
                </div>
                <div style={{ height: 10, background: "rgba(255,255,255,0.04)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${w}%`, height: "100%", background: item.color, borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
          <div style={{ borderTop: `2px solid ${C.purple}44`, paddingTop: 8, marginTop: 8, display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>TOTAL NEEDED</span>
            <span style={{ color: C.purple, fontWeight: 800, fontSize: 14 }}>{fmt(totalCapitalNeeded)}</span>
          </div>
        </div>
      </div>

      <div style={{ ...glassCard, marginTop: 16 }}>
        <h3 style={h3Style}>CASH BALANCE PROJECTION (60 MONTHS)</h3>
        <Sparkline data={cashProjection} width={800} height={120} color={cashProjection[59] >= 0 ? C.green : C.red} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 10, color: C.textDim }}>Month 1</span>
          <span style={{ fontSize: 10, color: C.textDim }}>Month 60</span>
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
          <span style={{ fontSize: 11, color: C.textMuted }}>Start: {fmt(cashProjection[0])}</span>
          <span style={{ fontSize: 11, color: C.textMuted }}>Low: {fmt(Math.min(...cashProjection))}</span>
          <span style={{ fontSize: 11, color: cashProjection[59] >= 0 ? C.green : C.red, fontWeight: 700 }}>End: {fmt(cashProjection[59])}</span>
        </div>
      </div>

      <div style={{ ...glassCard, marginTop: 16 }}>
        <h3 style={h3Style}>RUNWAY & BURN</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ ...labelStyle, padding: "8px", textAlign: "left", borderBottom: `1px solid ${C.border}` }}>Metric</th>
                {yrs.map((y) => (
                  <th key={y.year} style={{ ...labelStyle, padding: "8px", textAlign: "right", borderBottom: `1px solid ${C.border}` }}>Year {y.year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Monthly Burn", field: "monthlyBurn", color: C.red },
                { label: "Cash Balance (EOY)", field: "cashBalance", dynamic: true },
                { label: "Runway (months)", field: "runwayMonths", color: C.amber, isNum: true },
              ].map((row) => (
                <tr key={row.label} style={{ borderBottom: `1px solid ${C.border}22` }}>
                  <td style={{ padding: "8px", color: C.textMuted, fontWeight: 500 }}>{row.label}</td>
                  {yrs.map((y) => {
                    const val = y[row.field];
                    const c = row.dynamic ? (val >= 0 ? C.green : C.red) : row.color;
                    return (
                      <td key={y.year} style={{ padding: "8px", textAlign: "right", color: c, fontWeight: 600 }}>
                        {row.isNum ? (val >= 999 ? "∞" : fmtN(val)) : fmt(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ ...glassCard, marginTop: 16 }}>
        <h3 style={h3Style}>SENSITIVITY ANALYSIS</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { label: "Base Case", revAdj: 1.0, cogsAdj: 1.0, color: C.violet },
            { label: "Revenue -20%", revAdj: 0.8, cogsAdj: 1.0, color: C.amber },
            { label: "COGS +10%", revAdj: 1.0, cogsAdj: 1.1, color: C.red },
          ].map((scenario) => {
            const adjY5 = yrs[4];
            const adjRev = adjY5.netRev * scenario.revAdj;
            const adjCOGS = adjY5.totalCOGS * scenario.cogsAdj;
            const adjGP = adjRev - adjCOGS;
            const adjEBITDA = adjGP - adjY5.totalOpex;
            return (
              <div key={scenario.label} style={{ padding: 14, borderRadius: 10, border: `1px solid ${scenario.color}30`, background: `${scenario.color}08` }}>
                <div style={{ color: scenario.color, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{scenario.label}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: C.textMuted }}>Y5 Revenue</span>
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 600 }}>{fmt(adjRev)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: C.textMuted }}>Y5 EBITDA</span>
                  <span style={{ fontSize: 11, color: adjEBITDA >= 0 ? C.green : C.red, fontWeight: 700 }}>{fmt(adjEBITDA)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: C.textMuted }}>EBITDA Margin</span>
                  <span style={{ fontSize: 11, color: adjEBITDA >= 0 ? C.green : C.red, fontWeight: 700 }}>{fmtPct(adjRev > 0 ? adjEBITDA / adjRev : 0)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
