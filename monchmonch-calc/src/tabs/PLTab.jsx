import { useMemo } from "react";
import { C, fmt, fmtN, fmtPct } from "../constants.js";
import { runModel } from "../model.js";
import { glassCard, labelStyle, h3Style, MetricCard, PLChart } from "../components.jsx";

export default function PLTab({ state }) {
  const model = useMemo(() => runModel(state), [state]);
  const yrs = model.years;
  const y5 = yrs[4];

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <MetricCard label="Y5 Revenue" value={fmt(y5.netRev)} color={C.violet} icon="\uD83D\uDCB0" sub={`${fmtN(y5.totalUnits)} units`} />
        <MetricCard label="Y5 Gross Margin" value={fmtPct(y5.grossMargin)} color={C.green} icon="\uD83D\uDCC8" />
        <MetricCard label="Y5 EBITDA" value={fmt(y5.ebitda)} color={y5.ebitda >= 0 ? C.green : C.red} icon={y5.ebitda >= 0 ? "\u2705" : "\u26A0\uFE0F"} />
        <MetricCard label="Cumulative EBITDA" value={fmt(y5.cumEBITDA)} color={y5.cumEBITDA >= 0 ? C.green : C.red} icon="\uD83D\uDCCA" sub="5-year total" />
      </div>

      <div style={{ ...glassCard, marginBottom: 16 }}>
        <h3 style={h3Style}>REVENUE vs EBITDA \u2014 5 YEAR</h3>
        <PLChart years={yrs} />
      </div>

      <div style={{ ...glassCard, marginBottom: 16 }}>
        <h3 style={h3Style}>5-YEAR P&L SUMMARY</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ ...labelStyle, padding: "10px 8px", textAlign: "left", borderBottom: `2px solid ${C.border}` }}>Line Item</th>
                {yrs.map((y) => (
                  <th key={y.year} style={{ ...labelStyle, padding: "10px 8px", textAlign: "right", borderBottom: `2px solid ${C.border}` }}>Year {y.year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Bars + Electrolytes Revenue", field: "barsRev", color: C.textMuted, bold: false },
                { label: "Ingredient Licensing Revenue (B2B)", field: "licensingRev", color: C.cyan, bold: false },
                { label: "TOTAL NET REVENUE", field: "netRev", color: C.violet, bold: true },
                { label: "", field: null },
                { label: "Total COGS (bars + licensing)", field: "totalCOGS", color: C.red, bold: false },
                { label: "GROSS PROFIT", field: "grossProfit", color: C.green, bold: true },
                { label: "Gross Margin %", field: "grossMargin", color: C.green, bold: false, pct: true },
                { label: "", field: null },
                { label: "Channel Costs (bars fulfillment + trade)", field: "channelCosts", color: C.textMuted, bold: false },
                { label: "Fixed Overhead", field: "fixedOH", color: C.textMuted, bold: false },
                { label: "Marketing", field: "marketing", color: C.textMuted, bold: false },
                { label: "Payroll", field: "payroll", color: C.textMuted, bold: false },
                { label: "BD / Sales (licensing channel)", field: "bdSales", color: C.textMuted, bold: false },
                { label: "Clinical & IP", field: "clinical", color: C.textMuted, bold: false },
                { label: "G&A", field: "gna", color: C.textMuted, bold: false },
                { label: "Carrying Costs", field: "carryingCost", color: C.textMuted, bold: false },
                { label: "Spoilage", field: "spoilageCost", color: C.textMuted, bold: false },
                { label: "Commitments", field: "commitmentCost", color: C.textMuted, bold: false },
                { label: "Debt Service", field: "debtService", color: C.textMuted, bold: false },
                { label: "TOTAL OPEX", field: "totalOpex", color: C.orange, bold: true },
                { label: "", field: null },
                { label: "EBITDA", field: "ebitda", color: null, bold: true, dynamic: true },
                { label: "EBITDA Margin %", field: "ebitdaMargin", color: null, bold: false, pct: true, dynamic: true },
                { label: "Cumulative EBITDA", field: "cumEBITDA", color: null, bold: true, dynamic: true },
                { label: "", field: null },
                { label: "Cash Balance", field: "cashBalance", color: null, bold: true, dynamic: true },
              ].map((row, idx) => {
                if (!row.field) return <tr key={idx}><td colSpan={6} style={{ height: 8 }} /></tr>;
                return (
                  <tr key={idx} style={{
                    borderBottom: `1px solid ${C.border}22`,
                    background: row.bold ? "rgba(139,92,246,0.04)" : "transparent",
                  }}>
                    <td style={{
                      padding: "8px", color: row.bold ? C.text : C.textMuted,
                      fontWeight: row.bold ? 700 : 400, fontSize: row.bold ? 13 : 12,
                    }}>{row.label}</td>
                    {yrs.map((y) => {
                      const val = y[row.field];
                      const cellColor = row.dynamic ? (val >= 0 ? C.green : C.red) : row.color;
                      return (
                        <td key={y.year} style={{
                          padding: "8px", textAlign: "right", fontWeight: row.bold ? 700 : 400,
                          color: cellColor, fontSize: row.bold ? 13 : 12, fontFamily: "inherit",
                        }}>
                          {row.pct ? fmtPct(val) : fmt(val, val < 100 ? 2 : 0)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ ...glassCard }}>
        <h3 style={h3Style}>UNIT VOLUME \u2014 5 YEAR</h3>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 100 }}>
          {yrs.map((y) => {
            const maxU = Math.max(...yrs.map((yr) => yr.totalUnits));
            const h = (y.totalUnits / maxU) * 90;
            const bH = (y.barUnits / y.totalUnits) * h;
            const eH = h - bH;
            return (
              <div key={y.year} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ width: "80%", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: eH, background: C.violet, borderRadius: "4px 4px 0 0" }} />
                  <div style={{ height: bH, background: C.purple }} />
                </div>
                <span style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>Y{y.year}</span>
                <span style={{ fontSize: 9, color: C.textDim }}>{fmtN(y.totalUnits)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
