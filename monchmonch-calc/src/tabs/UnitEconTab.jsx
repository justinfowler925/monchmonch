import { useState, useMemo } from "react";
import { C, fmt, fmtN } from "../constants.js";
import { runModel } from "../model.js";
import { glassCard, inputStyle, labelStyle, h3Style, MetricCard, InputRow } from "../components.jsx";

export default function UnitEconTab({ state, setState }) {
  const model = useMemo(() => runModel(state), [state]);
  const updateRM = (type, idx, field, val) => {
    setState((p) => {
      const key = type === "bar" ? "barRM" : "elecRM";
      const arr = [...p[key]];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...p, [key]: arr };
    });
  };
  const [selectedTier, setSelectedTier] = useState(2);

  const renderRMTable = (materials, type, rmTotals) => (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            {["Material", "Qty/Unit", "$/lb T1", "$/lb T2", "$/lb T3", "MOQ (lbs)", "MOQ $", "Cost/Unit"].map((h) => (
              <th key={h} style={{ ...labelStyle, padding: "8px 4px", textAlign: h === "Material" ? "left" : "right", borderBottom: `1px solid ${C.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {materials.map((m, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.border}22` }}>
              <td style={{ padding: "6px", color: C.text, fontWeight: 500 }}>{m.name}</td>
              <td style={{ textAlign: "right", padding: "6px" }}>
                <input type="number" value={m.qty} step={0.001} min={0}
                  onChange={(e) => updateRM(type, i, "qty", parseFloat(e.target.value) || 0)}
                  style={{ ...inputStyle, width: 60, fontSize: 12 }} />
              </td>
              {["t1", "t2", "t3"].map((t) => (
                <td key={t} style={{ textAlign: "right", padding: "6px" }}>
                  <input type="number" value={m[t]} step={0.01} min={0}
                    onChange={(e) => updateRM(type, i, t, parseFloat(e.target.value) || 0)}
                    style={{ ...inputStyle, width: 55, fontSize: 12 }} />
                </td>
              ))}
              <td style={{ textAlign: "right", padding: "6px" }}>
                <input type="number" value={m.moq} step={10} min={0}
                  onChange={(e) => updateRM(type, i, "moq", parseFloat(e.target.value) || 0)}
                  style={{ ...inputStyle, width: 60, fontSize: 12, color: C.cyan }} />
              </td>
              <td style={{ textAlign: "right", padding: "6px", color: C.cyan, fontWeight: 600, fontSize: 11 }}>
                {fmt(m.moq * m.t1, 0)}
              </td>
              <td style={{ textAlign: "right", padding: "6px", color: C.amber, fontWeight: 700 }}>
                {fmt(m.qty * m[`t${selectedTier}`], 4)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: `2px solid ${C.purple}44` }}>
            <td colSpan={5} style={{ padding: "8px 6px", color: C.text, fontWeight: 700 }}>TOTAL RM COST / UNIT</td>
            <td style={{ textAlign: "right", padding: "8px 6px", color: C.cyan, fontWeight: 700, fontSize: 12 }}>
              {fmt(materials.reduce((s, m) => s + m.moq * m.t1, 0))}
            </td>
            <td />
            <td style={{ textAlign: "right", padding: "8px 6px", color: C.purple, fontWeight: 800, fontSize: 14 }}>
              {fmt(rmTotals[selectedTier - 1], 4)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  const renderWaterfall = (cogsData, color) => {
    const maxTotal = Math.max(...cogsData.map((d) => d.total));
    return (
      <div>
        {cogsData.map((d, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ fontSize: 11, color: C.textMuted }}>{d.tier}</span>
              <span style={{ fontSize: 11, color, fontWeight: 700 }}>{fmt(d.total, 4)}/unit</span>
            </div>
            <div style={{ display: "flex", height: 14, borderRadius: 4, overflow: "hidden", background: "rgba(255,255,255,0.03)" }}>
              {[
                { val: d.rm, col: C.purple, label: "RM" },
                { val: d.packaging, col: C.cyan, label: "Pkg" },
                { val: d.labor, col: C.violet, label: "Labor" },
                { val: d.overhead, col: C.amber, label: "OH" },
                { val: d.coMan, col: C.orange, label: "CoMan" },
              ].map((seg, j) => {
                const w = (seg.val / (maxTotal || 1)) * 100;
                return w > 0.5 ? (
                  <div key={j} title={`${seg.label}: ${fmt(seg.val, 4)}`}
                    style={{ width: `${w}%`, background: seg.col, transition: "width 0.3s" }} />
                ) : null;
              })}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
          {[{ c: C.purple, l: "Raw Materials" }, { c: C.cyan, l: "Packaging" }, { c: C.violet, l: "Labor" }, { c: C.amber, l: "Overhead" }, { c: C.orange, l: "Co-Man" }].map((x) => (
            <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: x.c }} />
              <span style={{ fontSize: 10, color: C.textMuted }}>{x.l}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const updatePkg = (type, idx, field, val) => {
    setState((p) => {
      const key = type === "bar" ? "barPackaging" : "elecPackaging";
      const arr = [...p[key]];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...p, [key]: arr };
    });
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <MetricCard label="Bar RM Cost (T1)" value={fmt(model.barRMT1, 3)} sub="/unit" color={C.purple} icon="\uD83C\uDF6B" />
        <MetricCard label="Elec RM Cost (T1)" value={fmt(model.elecRMT1, 3)} sub="/unit" color={C.violet} icon="\u26A1" />
        <MetricCard label="Bar COGS @ Operating" value={fmt(model.barCOGS[model.opTier]?.total, 3)} sub={`Tier ${model.opTier + 1} \u2022 ${fmtN(model.y1TotalUnits)} units`} color={C.amber} icon="\uD83D\uDCE6" />
        <MetricCard label="Elec COGS @ Operating" value={fmt(model.elecCOGS[model.opTier]?.total, 3)} sub={`incl. ${fmt(model.elecPkgPerUnit, 3)} pkg`} color={C.orange} icon="\uD83D\uDCE6" />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[1, 2, 3].map((t) => (
          <button key={t} onClick={() => setSelectedTier(t)}
            style={{
              padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
              border: selectedTier === t ? `1px solid ${C.purple}` : `1px solid ${C.border}`,
              background: selectedTier === t ? C.purpleGlow : "transparent",
              color: selectedTier === t ? C.purple : C.textMuted,
              fontFamily: "inherit",
            }}>
            Tier {t} Pricing
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={glassCard}>
          <h3 style={h3Style}>🍫 BAR RAW MATERIALS</h3>
          {renderRMTable(state.barRM, "bar", [model.barRMT1, model.barRMT2, model.barRMT3])}
        </div>
        <div style={glassCard}>
          <h3 style={h3Style}>⚡ ELECTROLYTE RAW MATERIALS</h3>
          {renderRMTable(state.elecRM, "elec", [model.elecRMT1, model.elecRMT2, model.elecRMT3])}
        </div>
      </div>

      <div style={{ ...glassCard, marginTop: 16 }}>
        <h3 style={h3Style}>📦 PACKAGING COSTS</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {[{ label: "\uD83C\uDF6B Bars", type: "bar", data: state.barPackaging, moqTotal: model.barPkgMoqCost, perUnit: model.barPkgPerUnit },
            { label: "\u26A1 Electrolytes", type: "elec", data: state.elecPackaging, moqTotal: model.elecPkgMoqCost, perUnit: model.elecPkgPerUnit }].map((grp) => (
            <div key={grp.type}>
              <div style={{ color: C.text, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{grp.label}</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    {["Item", "$/Unit", "MOQ", "Lead (wk)", "MOQ $"].map((h) => (
                      <th key={h} style={{ ...labelStyle, padding: "6px 4px", textAlign: h === "Item" ? "left" : "right", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grp.data.map((p, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}22` }}>
                      <td style={{ padding: "4px", color: C.text }}>{p.name}</td>
                      <td style={{ textAlign: "right", padding: "4px" }}>
                        <input type="number" value={p.costPerUnit} step={0.005} min={0}
                          onChange={(e) => updatePkg(grp.type, i, "costPerUnit", parseFloat(e.target.value) || 0)}
                          style={{ ...inputStyle, width: 60, fontSize: 11 }} />
                      </td>
                      <td style={{ textAlign: "right", padding: "4px" }}>
                        <input type="number" value={p.moq} step={1000} min={0}
                          onChange={(e) => updatePkg(grp.type, i, "moq", parseFloat(e.target.value) || 0)}
                          style={{ ...inputStyle, width: 65, fontSize: 11, color: C.cyan }} />
                      </td>
                      <td style={{ textAlign: "right", padding: "4px" }}>
                        <input type="number" value={p.leadWeeks} step={1} min={0}
                          onChange={(e) => updatePkg(grp.type, i, "leadWeeks", parseFloat(e.target.value) || 0)}
                          style={{ ...inputStyle, width: 40, fontSize: 11 }} />
                      </td>
                      <td style={{ textAlign: "right", padding: "4px", color: C.cyan, fontWeight: 600 }}>{fmt(p.moq * p.costPerUnit)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `2px solid ${C.cyan}44` }}>
                    <td style={{ padding: "6px 4px", color: C.text, fontWeight: 700 }}>TOTAL</td>
                    <td style={{ textAlign: "right", padding: "6px 4px", color: C.cyan, fontWeight: 800 }}>{fmt(grp.perUnit, 3)}</td>
                    <td colSpan={2} />
                    <td style={{ textAlign: "right", padding: "6px 4px", color: C.cyan, fontWeight: 700 }}>{fmt(grp.moqTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...glassCard, marginTop: 16 }}>
        <h3 style={h3Style}>MINIMUM PRODUCTION RUNS</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <InputRow label="Min Bar Run (units)" value={state.minBarRun} prefix="" step={1000}
              onChange={(v) => setState((p) => ({ ...p, minBarRun: v }))} />
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>
              RM needed: {fmt(state.minBarRun * model.barRMT1)} | Pkg: {fmt(state.minBarRun * model.barPkgPerUnit)} | Total: {fmt(state.minBarRun * (model.barRMT1 + model.barPkgPerUnit))}
            </div>
          </div>
          <div>
            <InputRow label="Min Electrolyte Run (units)" value={state.minElecRun} prefix="" step={1000}
              onChange={(v) => setState((p) => ({ ...p, minElecRun: v }))} />
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>
              RM needed: {fmt(state.minElecRun * model.elecRMT1)} | Pkg: {fmt(state.minElecRun * model.elecPkgPerUnit)} | Total: {fmt(state.minElecRun * (model.elecRMT1 + model.elecPkgPerUnit))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div style={glassCard}>
          <h3 style={h3Style}>BAR COGS WATERFALL BY TIER</h3>
          {renderWaterfall(model.barCOGS, C.purple)}
        </div>
        <div style={glassCard}>
          <h3 style={h3Style}>ELECTROLYTE COGS WATERFALL BY TIER</h3>
          {renderWaterfall(model.elecCOGS, C.violet)}
        </div>
      </div>

      <div style={{ ...glassCard, marginTop: 16 }}>
        <h3 style={h3Style}>CO-MANUFACTURER PRICING</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ ...labelStyle, marginBottom: 8 }}>Bars $/unit by tier</div>
            {state.coManBars.map((v, i) => (
              <InputRow key={i} label={state.coManLabels[i]} value={v}
                onChange={(val) => setState((p) => { const a = [...p.coManBars]; a[i] = val; return { ...p, coManBars: a }; })} />
            ))}
          </div>
          <div>
            <div style={{ ...labelStyle, marginBottom: 8 }}>Electrolytes $/unit by tier</div>
            {state.coManElec.map((v, i) => (
              <InputRow key={i} label={state.coManLabels[i]} value={v}
                onChange={(val) => setState((p) => { const a = [...p.coManElec]; a[i] = val; return { ...p, coManElec: a }; })} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...glassCard, marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ ...h3Style, margin: 0 }}>LABOR & STAFFING</h3>
          <button onClick={() => setState((p) => ({ ...p, laborRoles: [...p.laborRoles, { role: "New Role", headcount: 1, rate: 20, hoursPerRun: 8, isVariable: true }] }))}
            style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.violet}40`, background: C.violetGlow, color: C.violet, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Add</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {["Role", "Headcount", "$/hr", "Hrs/Run", "Variable?", "Cost/Run", ""].map((h) => (
                <th key={h} style={{ ...labelStyle, padding: "6px 4px", textAlign: h === "Role" ? "left" : "right", borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.laborRoles.map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}22` }}>
                <td style={{ padding: "4px" }}>
                  <input value={r.role} onChange={(e) => setState((p) => { const a = [...p.laborRoles]; a[i] = { ...a[i], role: e.target.value }; return { ...p, laborRoles: a }; })}
                    style={{ ...inputStyle, width: 140, textAlign: "left", color: C.text }} />
                </td>
                <td style={{ textAlign: "right", padding: "4px" }}>
                  <input type="number" value={r.headcount} step={1} min={0}
                    onChange={(e) => setState((p) => { const a = [...p.laborRoles]; a[i] = { ...a[i], headcount: parseInt(e.target.value) || 0 }; return { ...p, laborRoles: a }; })}
                    style={{ ...inputStyle, width: 45, fontSize: 11 }} />
                </td>
                <td style={{ textAlign: "right", padding: "4px" }}>
                  <input type="number" value={r.rate} step={1} min={0}
                    onChange={(e) => setState((p) => { const a = [...p.laborRoles]; a[i] = { ...a[i], rate: parseFloat(e.target.value) || 0 }; return { ...p, laborRoles: a }; })}
                    style={{ ...inputStyle, width: 55, fontSize: 11 }} />
                </td>
                <td style={{ textAlign: "right", padding: "4px" }}>
                  <input type="number" value={r.hoursPerRun} step={1} min={0}
                    onChange={(e) => setState((p) => { const a = [...p.laborRoles]; a[i] = { ...a[i], hoursPerRun: parseFloat(e.target.value) || 0 }; return { ...p, laborRoles: a }; })}
                    style={{ ...inputStyle, width: 45, fontSize: 11 }} />
                </td>
                <td style={{ textAlign: "center", padding: "4px" }}>
                  <input type="checkbox" checked={r.isVariable}
                    onChange={(e) => setState((p) => { const a = [...p.laborRoles]; a[i] = { ...a[i], isVariable: e.target.checked }; return { ...p, laborRoles: a }; })}
                    style={{ accentColor: C.green }} />
                </td>
                <td style={{ textAlign: "right", padding: "4px", color: C.violet, fontWeight: 700 }}>
                  {fmt(r.headcount * r.rate * r.hoursPerRun)}
                </td>
                <td style={{ padding: "4px" }}>
                  <button onClick={() => setState((p) => ({ ...p, laborRoles: p.laborRoles.filter((_, j) => j !== i) }))}
                    style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 14 }}>{"\u2715"}</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${C.violet}44` }}>
              <td colSpan={6} style={{ padding: "8px 4px", color: C.text, fontWeight: 700 }}>TOTAL LABOR / RUN</td>
              <td style={{ textAlign: "right", padding: "8px 4px", color: C.violet, fontWeight: 800 }}>
                {fmt(state.laborRoles.reduce((s, r) => s + r.headcount * r.rate * r.hoursPerRun, 0))}
              </td>
            </tr>
          </tfoot>
        </table>
        <div style={{ marginTop: 8 }}>
          <InputRow label="Fixed Overhead $/mo" value={state.fixedOverhead} step={100}
            onChange={(v) => setState((p) => ({ ...p, fixedOverhead: v }))} />
          <InputRow label="Equipment Amort $/mo" value={state.equipAmort} step={100}
            onChange={(v) => setState((p) => ({ ...p, equipAmort: v }))} />
        </div>
      </div>
    </div>
  );
}
