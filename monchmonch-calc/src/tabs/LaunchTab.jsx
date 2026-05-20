import { useState, useMemo } from "react";
import { C, fmt, fmtN } from "../constants.js";
import { runModel } from "../model.js";
import { glassCard, inputStyle, labelStyle, h3Style, MetricCard, InputRow } from "../components.jsx";

export default function LaunchTab({ state, setState }) {
  const model = useMemo(() => runModel(state), [state]);
  const totalStartup = model.startupCapex;
  const totalFunding = state.fundingSources.reduce((s, f) => s + f.amount, 0);
  const gap = totalStartup - totalFunding;

  const updateExpense = (idx, field, val) => {
    setState((p) => {
      const arr = [...p.launchExpenses];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...p, launchExpenses: arr };
    });
  };
  const addExpense = () => {
    setState((p) => ({ ...p, launchExpenses: [...p.launchExpenses, { name: "New Item", cost: 0, month: -1, notes: "" }] }));
  };
  const removeExpense = (idx) => {
    setState((p) => ({ ...p, launchExpenses: p.launchExpenses.filter((_, i) => i !== idx) }));
  };
  const updateFunding = (idx, field, val) => {
    setState((p) => {
      const arr = [...p.fundingSources];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...p, fundingSources: arr };
    });
  };
  const addFunding = () => {
    setState((p) => ({ ...p, fundingSources: [...p.fundingSources, { name: "New Source", amount: 0, type: "equity" }] }));
  };
  const removeFunding = (idx) => {
    setState((p) => ({ ...p, fundingSources: p.fundingSources.filter((_, i) => i !== idx) }));
  };

  const sorted = [...state.launchExpenses].sort((a, b) => a.month - b.month);
  const minMonth = Math.min(...state.launchExpenses.map((e) => e.month));
  const maxMonth = 0;
  const range = maxMonth - minMonth || 1;

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <MetricCard label="Total Startup Capital" value={fmt(totalStartup)} color={C.red} icon="\uD83D\uDCB0" />
        <MetricCard label="Total Funding" value={fmt(totalFunding)} color={C.green} icon="\uD83C\uDFE6" />
        <MetricCard label={gap > 0 ? "Funding Gap" : "Surplus"} value={fmt(Math.abs(gap))} color={gap > 0 ? C.red : C.green} icon={gap > 0 ? "\u26A0\uFE0F" : "\u2705"} />
        <MetricCard label="Monthly Commitments" value={fmt(model.commitmentMonthly)} color={C.amber} icon="\uD83D\uDCCB" sub="/month fixed" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={glassCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ ...h3Style, margin: 0 }}>PRE-LAUNCH CAPITAL EXPENSES</h3>
            <button onClick={addExpense} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.purple}40`, background: C.purpleGlow, color: C.purple, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Add</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Item", "Cost", "Month", "Notes", ""].map((h) => (
                  <th key={h} style={{ ...labelStyle, padding: "6px 4px", textAlign: h === "Item" || h === "Notes" ? "left" : "right", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.launchExpenses.map((e, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}22` }}>
                  <td style={{ padding: "4px" }}>
                    <input value={e.name} onChange={(ev) => updateExpense(i, "name", ev.target.value)}
                      style={{ ...inputStyle, width: 140, textAlign: "left", color: C.text }} />
                  </td>
                  <td style={{ padding: "4px", textAlign: "right" }}>
                    <input type="number" value={e.cost} step={1000} onChange={(ev) => updateExpense(i, "cost", parseFloat(ev.target.value) || 0)}
                      style={{ ...inputStyle, width: 90 }} />
                  </td>
                  <td style={{ padding: "4px", textAlign: "right" }}>
                    <input type="number" value={e.month} step={1} max={0} onChange={(ev) => updateExpense(i, "month", parseInt(ev.target.value) || 0)}
                      style={{ ...inputStyle, width: 50 }} />
                  </td>
                  <td style={{ padding: "4px" }}>
                    <input value={e.notes} onChange={(ev) => updateExpense(i, "notes", ev.target.value)}
                      style={{ ...inputStyle, width: 120, textAlign: "left", color: C.textMuted }} />
                  </td>
                  <td style={{ padding: "4px" }}>
                    <button onClick={() => removeExpense(i)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 14 }}>\u2715</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${C.purple}44` }}>
                <td style={{ padding: "8px 4px", color: C.text, fontWeight: 700 }}>TOTAL</td>
                <td style={{ padding: "8px 4px", textAlign: "right", color: C.purple, fontWeight: 800, fontSize: 14 }}>{fmt(totalStartup)}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>

        <div style={glassCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ ...h3Style, margin: 0 }}>FUNDING SOURCES</h3>
            <button onClick={addFunding} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.green}40`, background: C.greenGlow, color: C.green, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Add</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Source", "Amount", "Type", ""].map((h) => (
                  <th key={h} style={{ ...labelStyle, padding: "6px 4px", textAlign: h === "Source" ? "left" : "right", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.fundingSources.map((f, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}22` }}>
                  <td style={{ padding: "4px" }}>
                    <input value={f.name} onChange={(ev) => updateFunding(i, "name", ev.target.value)}
                      style={{ ...inputStyle, width: 140, textAlign: "left", color: C.text }} />
                  </td>
                  <td style={{ padding: "4px", textAlign: "right" }}>
                    <input type="number" value={f.amount} step={10000} onChange={(ev) => updateFunding(i, "amount", parseFloat(ev.target.value) || 0)}
                      style={{ ...inputStyle, width: 100 }} />
                  </td>
                  <td style={{ padding: "4px", textAlign: "right" }}>
                    <select value={f.type} onChange={(ev) => updateFunding(i, "type", ev.target.value)}
                      style={{ ...inputStyle, width: 80, textAlign: "center", appearance: "auto" }}>
                      <option value="equity">Equity</option>
                      <option value="debt">Debt</option>
                      <option value="grant">Grant</option>
                    </select>
                  </td>
                  <td style={{ padding: "4px" }}>
                    <button onClick={() => removeFunding(i)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 14 }}>\u2715</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${C.green}44` }}>
                <td style={{ padding: "8px 4px", color: C.text, fontWeight: 700 }}>TOTAL</td>
                <td style={{ padding: "8px 4px", textAlign: "right", color: C.green, fontWeight: 800, fontSize: 14 }}>{fmt(totalFunding)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>

          <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: gap > 0 ? C.redGlow : C.greenGlow, border: `1px solid ${gap > 0 ? C.red : C.green}30` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: gap > 0 ? C.red : C.green, marginBottom: 4 }}>
              {gap > 0 ? `\u26A0\uFE0F Funding Gap: ${fmt(gap)}` : `\u2705 Funded with ${fmt(Math.abs(gap))} surplus`}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted }}>
              Total capital required vs. available funding sources
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...glassCard, marginTop: 16 }}>
        <h3 style={h3Style}>PRE-LAUNCH TIMELINE</h3>
        <div style={{ position: "relative", height: sorted.length * 36 + 40, padding: "20px 0" }}>
          <div style={{ position: "absolute", top: 10, left: 60, right: 20, height: 1, background: C.border }} />
          {sorted.map((e, i) => {
            const left = ((e.month - minMonth) / range) * 100;
            return (
              <div key={i} style={{ position: "relative", height: 32, display: "flex", alignItems: "center", marginBottom: 4 }}>
                <span style={{ width: 50, fontSize: 10, color: C.textMuted, textAlign: "right", paddingRight: 8 }}>M{e.month}</span>
                <div style={{ flex: 1, position: "relative", height: 20 }}>
                  <div style={{
                    position: "absolute", left: `${left}%`, height: 20, minWidth: 8,
                    width: `${Math.max((1 / range) * 100, 5)}%`,
                    background: `linear-gradient(90deg, ${C.purple}, ${C.violet})`,
                    borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 6,
                  }}>
                    <span style={{ fontSize: 10, color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {e.name} \u2014 {fmt(e.cost)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...glassCard, marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ ...h3Style, margin: 0 }}>FIXED COMMITMENTS</h3>
          <button onClick={() => setState((p) => ({ ...p, commitments: [...p.commitments, { name: "New Commitment", type: "other", monthlyCost: 0, termMonths: 12, notes: "" }] }))}
            style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.amber}40`, background: C.amberGlow, color: C.amber, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Add</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {["Counterparty", "Type", "Monthly $", "Term (mo)", "Notes", ""].map((h) => (
                <th key={h} style={{ ...labelStyle, padding: "6px 4px", textAlign: h === "Counterparty" || h === "Notes" ? "left" : "right", borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.commitments.map((c, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}22` }}>
                <td style={{ padding: "4px" }}>
                  <input value={c.name} onChange={(ev) => setState((p) => { const a = [...p.commitments]; a[i] = { ...a[i], name: ev.target.value }; return { ...p, commitments: a }; })}
                    style={{ ...inputStyle, width: 120, textAlign: "left", color: C.text }} />
                </td>
                <td style={{ padding: "4px", textAlign: "right" }}>
                  <select value={c.type} onChange={(ev) => setState((p) => { const a = [...p.commitments]; a[i] = { ...a[i], type: ev.target.value }; return { ...p, commitments: a }; })}
                    style={{ ...inputStyle, width: 80, textAlign: "center", appearance: "auto" }}>
                    {["production", "facility", "equipment", "marketing", "other"].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </td>
                <td style={{ padding: "4px", textAlign: "right" }}>
                  <input type="number" value={c.monthlyCost} step={100} onChange={(ev) => setState((p) => { const a = [...p.commitments]; a[i] = { ...a[i], monthlyCost: parseFloat(ev.target.value) || 0 }; return { ...p, commitments: a }; })}
                    style={{ ...inputStyle, width: 70 }} />
                </td>
                <td style={{ padding: "4px", textAlign: "right" }}>
                  <input type="number" value={c.termMonths} step={6} onChange={(ev) => setState((p) => { const a = [...p.commitments]; a[i] = { ...a[i], termMonths: parseInt(ev.target.value) || 0 }; return { ...p, commitments: a }; })}
                    style={{ ...inputStyle, width: 50 }} />
                </td>
                <td style={{ padding: "4px" }}>
                  <input value={c.notes} onChange={(ev) => setState((p) => { const a = [...p.commitments]; a[i] = { ...a[i], notes: ev.target.value }; return { ...p, commitments: a }; })}
                    style={{ ...inputStyle, width: 100, textAlign: "left", color: C.textMuted }} />
                </td>
                <td style={{ padding: "4px" }}>
                  <button onClick={() => setState((p) => ({ ...p, commitments: p.commitments.filter((_, j) => j !== i) }))}
                    style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 14 }}>{"\u2715"}</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${C.amber}44` }}>
              <td colSpan={2} style={{ padding: "8px 4px", color: C.text, fontWeight: 700 }}>TOTAL MONTHLY</td>
              <td style={{ padding: "8px 4px", textAlign: "right", color: C.amber, fontWeight: 800 }}>{fmt(model.commitmentMonthly)}</td>
              <td colSpan={2} style={{ padding: "8px 4px", color: C.textDim, fontSize: 11 }}>{fmt(model.commitmentMonthly * 12)}/year</td>
            </tr>
          </tfoot>
        </table>
        <div style={{ marginTop: 12, fontSize: 11, color: C.textDim }}>
          Even at zero revenue, monthly fixed commitments are {fmt(model.commitmentMonthly)}
        </div>
      </div>
    </div>
  );
}
