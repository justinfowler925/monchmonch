import { useMemo } from "react";
import { C, fmt, fmtN, MONTHS } from "../constants.js";
import { runModel } from "../model.js";
import { glassCard, inputStyle, labelStyle, h3Style, MetricCard, InputRow, SliderInput } from "../components.jsx";

export default function ProductionTab({ state, setState }) {
  const model = useMemo(() => runModel(state), [state]);
  const updateDemand = (type, idx, val) => {
    setState((p) => {
      const key = type === "bar" ? "barDemand" : "elecDemand";
      const arr = [...p[key]];
      arr[idx] = val;
      return { ...p, [key]: arr };
    });
  };
  const updateSeason = (type, idx, val) => {
    setState((p) => {
      const key = type === "bar" ? "barSeason" : "elecSeason";
      const arr = [...p[key]];
      arr[idx] = val;
      return { ...p, [key]: arr };
    });
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <MetricCard label="Y1 Bar Units" value={fmtN(model.y1BarUnits)} color={C.purple} icon="\uD83C\uDF6B" />
        <MetricCard label="Y1 Elec Units" value={fmtN(model.y1ElecUnits)} color={C.violet} icon="\u26A1" />
        <MetricCard label="Y1 Total Units" value={fmtN(model.y1TotalUnits)} color={C.amber} icon="\uD83D\uDCE6" />
        <MetricCard label="Operating Vol Tier" value={`Tier ${model.opTier + 1}`} color={C.green} icon="\uD83C\uDFED" sub={state.coManLabels[model.opTier]} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={glassCard}>
          <h3 style={h3Style}>INVENTORY PARAMETERS</h3>
          <InputRow label="Target Days of Inventory" value={state.targetDOI} prefix="" suffix="days" step={1}
            onChange={(v) => setState((p) => ({ ...p, targetDOI: v }))} />
          <SliderInput label="Safety Stock %" value={state.safetyStockPct} min={0} max={0.5} step={0.01}
            onChange={(v) => setState((p) => ({ ...p, safetyStockPct: v }))} />
          <InputRow label="Warehousing $/unit/mo" value={state.warehousingPerUnit}
            onChange={(v) => setState((p) => ({ ...p, warehousingPerUnit: v }))} />
          <SliderInput label="Insurance % of Inv Value" value={state.insurancePct} min={0} max={0.1} step={0.005}
            onChange={(v) => setState((p) => ({ ...p, insurancePct: v }))} />
          <SliderInput label="Cost of Capital %" value={state.costOfCapitalPct} min={0} max={0.2} step={0.01}
            onChange={(v) => setState((p) => ({ ...p, costOfCapitalPct: v }))} />
        </div>
        <div style={glassCard}>
          <h3 style={h3Style}>SPOILAGE RATES</h3>
          <SliderInput label="Bars (% / month)" value={state.spoilageBar} min={0} max={0.05} step={0.001}
            onChange={(v) => setState((p) => ({ ...p, spoilageBar: v }))} />
          <SliderInput label="Electrolytes (% / month)" value={state.spoilageElec} min={0} max={0.05} step={0.001}
            onChange={(v) => setState((p) => ({ ...p, spoilageElec: v }))} />
          <div style={{ marginTop: 16 }}>
            <h3 style={h3Style}>OPERATING EXPENSES</h3>
            <InputRow label="G&A $/month" value={state.gna} step={100} onChange={(v) => setState((p) => ({ ...p, gna: v }))} />
            <SliderInput label="Marketing (% of Revenue)" value={state.marketingPct} min={0} max={0.3} step={0.01}
              onChange={(v) => setState((p) => ({ ...p, marketingPct: v }))} />
          </div>
        </div>
      </div>

      <div style={{ ...glassCard, marginTop: 16 }}>
        <h3 style={h3Style}>YEAR 1 MONTHLY BASE DEMAND (before seasonality)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ color: C.text, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>\uD83C\uDF6B Bars</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              {state.barDemand.map((v, i) => (
                <InputRow key={i} label={MONTHS[i]} value={v} prefix="" step={100}
                  onChange={(val) => updateDemand("bar", i, val)} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ color: C.text, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>\u26A1 Electrolytes</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              {state.elecDemand.map((v, i) => (
                <InputRow key={i} label={MONTHS[i]} value={v} prefix="" step={100}
                  onChange={(val) => updateDemand("elec", i, val)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...glassCard, marginTop: 16 }}>
        <h3 style={h3Style}>SEASONALITY INDICES</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ color: C.text, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>\uD83C\uDF6B Bars (avg: {(state.barSeason.reduce((a, b) => a + b, 0) / 12).toFixed(2)})</div>
            {state.barSeason.map((v, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ ...labelStyle, width: 32 }}>{MONTHS[i]}</span>
                <input type="range" min={0.5} max={1.5} step={0.05} value={v}
                  onChange={(e) => updateSeason("bar", i, parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: C.purple, height: 3 }} />
                <span style={{ color: v >= 1 ? C.green : C.red, fontSize: 12, fontWeight: 700, width: 36, textAlign: "right" }}>{v.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ color: C.text, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>\u26A1 Electrolytes (avg: {(state.elecSeason.reduce((a, b) => a + b, 0) / 12).toFixed(2)})</div>
            {state.elecSeason.map((v, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ ...labelStyle, width: 32 }}>{MONTHS[i]}</span>
                <input type="range" min={0.5} max={1.5} step={0.05} value={v}
                  onChange={(e) => updateSeason("elec", i, parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: C.violet, height: 3 }} />
                <span style={{ color: v >= 1 ? C.green : C.red, fontSize: 12, fontWeight: 700, width: 36, textAlign: "right" }}>{v.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...glassCard, marginTop: 16 }}>
        <h3 style={h3Style}>Y1 PRODUCTION SCHEDULE \u2014 BARS</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr>
                {["", ...MONTHS].map((h) => (
                  <th key={h} style={{ ...labelStyle, padding: "6px 4px", textAlign: h ? "right" : "left", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Adj Demand", field: "barAdjDemand", color: C.text },
                { label: "Production", field: "barProdOrder", color: C.purple },
                { label: "Units Sold", field: "barUnitsSold", color: C.violet },
                { label: "End Inventory", field: "barEndInv", color: C.amber },
                { label: "Spoilage", field: "barSpoilage", color: C.red },
              ].map((row) => (
                <tr key={row.field} style={{ borderBottom: `1px solid ${C.border}22` }}>
                  <td style={{ padding: "5px 4px", color: row.color, fontWeight: 600, whiteSpace: "nowrap" }}>{row.label}</td>
                  {model.monthly.map((m, i) => {
                    const val = m[row.field];
                    const belowMOQ = row.field === "barProdOrder" && m.barBelowMOQ;
                    return (
                      <td key={i} style={{
                        padding: "5px 4px", textAlign: "right", color: row.color,
                        background: belowMOQ ? C.redGlow : "transparent",
                      }}>
                        {fmtN(val)}
                        {belowMOQ && <span style={{ color: C.red, fontSize: 9 }}> \u26A0</span>}
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
        <h3 style={h3Style}>Y1 PRODUCTION SCHEDULE \u2014 ELECTROLYTES</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr>
                {["", ...MONTHS].map((h) => (
                  <th key={h} style={{ ...labelStyle, padding: "6px 4px", textAlign: h ? "right" : "left", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Adj Demand", field: "elecAdjDemand", color: C.text },
                { label: "Production", field: "elecProdOrder", color: C.violet },
                { label: "Units Sold", field: "elecUnitsSold", color: C.purple },
                { label: "End Inventory", field: "elecEndInv", color: C.amber },
                { label: "Spoilage", field: "elecSpoilage", color: C.red },
              ].map((row) => (
                <tr key={row.field} style={{ borderBottom: `1px solid ${C.border}22` }}>
                  <td style={{ padding: "5px 4px", color: row.color, fontWeight: 600, whiteSpace: "nowrap" }}>{row.label}</td>
                  {model.monthly.map((m, i) => {
                    const val = m[row.field];
                    const belowMOQ = row.field === "elecProdOrder" && m.elecBelowMOQ;
                    return (
                      <td key={i} style={{
                        padding: "5px 4px", textAlign: "right", color: row.color,
                        background: belowMOQ ? C.redGlow : "transparent",
                      }}>
                        {fmtN(val)}
                        {belowMOQ && <span style={{ color: C.red, fontSize: 9 }}> \u26A0</span>}
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
        <h3 style={h3Style}>PROCUREMENT PIPELINE</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
          <InputRow label="RM Lead Time" value={state.rmLeadWeeks} prefix="" suffix="weeks" step={1}
            onChange={(v) => setState((p) => ({ ...p, rmLeadWeeks: v }))} />
          <InputRow label="Co-Man Lead Time" value={state.coManLeadWeeks} prefix="" suffix="weeks" step={1}
            onChange={(v) => setState((p) => ({ ...p, coManLeadWeeks: v }))} />
          <SliderInput label="Co-Man Deposit %" value={state.coManDeposit} min={0} max={0.5} step={0.05}
            onChange={(v) => setState((p) => ({ ...p, coManDeposit: v }))} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ ...labelStyle, marginBottom: 6 }}>RM Supplier Payment Terms</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[30, 60, 90].map((t) => (
                <button key={t} onClick={() => setState((p) => ({ ...p, rmPaymentTerms: t }))}
                  style={{
                    padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    border: state.rmPaymentTerms === t ? `1px solid ${C.purple}` : `1px solid ${C.border}`,
                    background: state.rmPaymentTerms === t ? C.purpleGlow : "transparent",
                    color: state.rmPaymentTerms === t ? C.purple : C.textMuted, fontFamily: "inherit",
                  }}>Net {t}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ ...labelStyle, marginBottom: 6 }}>Co-Man Payment Terms</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[30, 60, 90].map((t) => (
                <button key={t} onClick={() => setState((p) => ({ ...p, coManPaymentTerms: t }))}
                  style={{
                    padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    border: state.coManPaymentTerms === t ? `1px solid ${C.violet}` : `1px solid ${C.border}`,
                    background: state.coManPaymentTerms === t ? C.violetGlow : "transparent",
                    color: state.coManPaymentTerms === t ? C.violet : C.textMuted, fontFamily: "inherit",
                  }}>Net {t}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ ...labelStyle, marginBottom: 8 }}>INVENTORY STAGE PIPELINE</div>
          <div style={{ display: "flex", gap: 4, height: 60 }}>
            {[
              { label: "RM On Order", sub: `${state.rmLeadWeeks}wk lead`, color: C.purple },
              { label: "RM In Warehouse", sub: "Holding cost accruing", color: C.violet },
              { label: "In Production", sub: `${state.coManLeadWeeks}wk at co-man`, color: C.amber },
              { label: "Finished Goods", sub: "Ready to ship", color: C.green },
            ].map((stage, i) => (
              <div key={i} style={{
                flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                background: `${stage.color}15`, border: `1px solid ${stage.color}30`, borderRadius: 8, padding: "6px 4px",
                position: "relative",
              }}>
                <div style={{ fontSize: 11, color: stage.color, fontWeight: 700 }}>{stage.label}</div>
                <div style={{ fontSize: 9, color: C.textDim }}>{stage.sub}</div>
                {i < 3 && <div style={{ position: "absolute", right: -8, fontSize: 14, color: C.textDim }}>\u2192</div>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ ...labelStyle, marginBottom: 8 }}>MONTHLY WORKING CAPITAL REQUIREMENT</div>
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 80 }}>
            {model.workingCapitalMonthly.map((wc, i) => {
              const maxWC = Math.max(...model.workingCapitalMonthly.map((w) => w.total));
              const h = maxWC > 0 ? (wc.total / maxWC) * 70 : 0;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                  <div style={{ width: "80%", height: h, background: `linear-gradient(180deg, ${C.amber}, ${C.orange})`, borderRadius: "3px 3px 0 0", minHeight: 2 }} />
                  <span style={{ fontSize: 8, color: C.textDim, marginTop: 2 }}>M{i + 1}</span>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: C.amber, fontWeight: 600, marginTop: 4 }}>
            Peak: {fmt(Math.max(...model.workingCapitalMonthly.map((w) => w.total)))}
          </div>
        </div>
      </div>
    </div>
  );
}
