import { useMemo } from "react";
import { C, fmt, fmtN, fmtPct } from "../constants.js";
import { runModel } from "../model.js";
import { glassCard, inputStyle, labelStyle, h3Style, MetricCard, InputRow, SliderInput } from "../components.jsx";

const CHANNEL_PROS_CONS = {
  "DTC (Website)": { pros: "Highest margin, own customer data, brand control, fast feedback loop", cons: "CAC expensive, limited scale, shipping costs, returns handling" },
  "Amazon": { pros: "Massive reach, FBA logistics, trust factor, discovery", cons: "15% referral fee, FBA costs, no customer ownership, price pressure" },
  "Big Box Retail": { pros: "Volume, brand credibility, foot traffic, national reach", cons: "Slotting fees ($25K-$100K), velocity requirements, 60-90 day terms, chargebacks" },
  "Natural/Specialty": { pros: "Brand-aligned shoppers, premium positioning, demo opportunities", cons: "Broker fees (5-7%), slower velocity, regional fragmentation" },
  "Vitamin Shops": { pros: "Targeted audience, supplement buyers, repeat purchase", cons: "Smaller stores, fragmented ownership, shelf competition" },
  "Distributors": { pros: "Access to thousands of stores, logistics handled, one invoice", cons: "20-25% margin cut, slow payment, min velocity requirements, warehouse fees" },
};

export default function RevenueTab({ state, setState }) {
  const model = useMemo(() => runModel(state), [state]);
  const y1 = model.years[0];

  const updateChannel = (idx, field, val) => {
    setState((p) => {
      const arr = [...p.channels];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...p, channels: arr };
    });
  };

  const totalAlloc = state.channels.filter((c) => c.active).reduce((s, c) => s + c.pctAlloc, 0);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <MetricCard label="Y1 Net Revenue" value={fmt(y1.netRev)} color={C.violet} icon="\uD83D\uDCB0" sub={`${fmtN(y1.totalUnits)} units`} />
        <MetricCard label="Y5 Net Revenue" value={fmt(model.years[4].netRev)} color={C.purple} icon="\uD83D\uDE80" sub={`${fmtN(model.years[4].totalUnits)} units`} />
        <MetricCard label="Blended ASP" value={fmt(y1.netRev / y1.totalUnits, 2)} color={C.amber} icon="\uD83D\uDCCA" sub="net revenue / unit" />
        <MetricCard label="Gross Margin" value={fmtPct(y1.grossMargin)} color={C.green} icon="\uD83D\uDCC8" />
      </div>

      <div style={{ ...glassCard, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ ...h3Style, margin: 0 }}>CHANNEL MIX</h3>
          <button onClick={() => setState((p) => ({ ...p, channels: [...p.channels, { name: "New Channel", active: true, pctAlloc: 0.10, barPrice: 2.00, elecPrice: 1.25, costPerUnit: 0.50, rampMonths: 0, maxMonthlyUnits: 5000 }] }))}
            style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.purple}40`, background: C.purpleGlow, color: C.purple, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Add Channel</button>
        </div>
        {totalAlloc > 0 && Math.abs(totalAlloc - 1) > 0.01 && (
          <div style={{ padding: "8px 12px", borderRadius: 6, background: C.amberGlow, border: `1px solid ${C.amber}30`, marginBottom: 12, fontSize: 11, color: C.amber }}>
            Active channel allocations sum to {(totalAlloc * 100).toFixed(0)}% \u2014 should be 100%. Model normalizes automatically.
          </div>
        )}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["Channel", "Active", "% Alloc", "Bar $/unit", "Elec $/unit", "Cost/unit", "Ramp (mo)", "Max/mo", "Y1 Rev", ""].map((h) => (
                  <th key={h} style={{ ...labelStyle, padding: "8px 4px", textAlign: h === "Channel" ? "left" : "center", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.channels.map((ch, i) => {
                const chDetail = y1.channelDetail?.find((d) => d.name === ch.name);
                const chRev = chDetail ? chDetail.rev : 0;
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}22`, opacity: ch.active ? 1 : 0.5 }}>
                    <td style={{ padding: "6px" }}>
                      <input value={ch.name} onChange={(e) => updateChannel(i, "name", e.target.value)}
                        style={{ ...inputStyle, width: 130, textAlign: "left", color: C.text, fontWeight: 600 }} />
                    </td>
                    <td style={{ textAlign: "center", padding: "6px" }}>
                      <input type="checkbox" checked={ch.active}
                        onChange={(e) => updateChannel(i, "active", e.target.checked)}
                        style={{ accentColor: C.purple }} />
                    </td>
                    <td style={{ textAlign: "center", padding: "6px" }}>
                      <input type="number" value={ch.pctAlloc} step={0.05} min={0} max={1}
                        onChange={(e) => updateChannel(i, "pctAlloc", parseFloat(e.target.value) || 0)}
                        style={{ ...inputStyle, width: 55, fontSize: 11, textAlign: "center" }} />
                    </td>
                    <td style={{ textAlign: "center", padding: "6px" }}>
                      <input type="number" value={ch.barPrice} step={0.05} min={0}
                        onChange={(e) => updateChannel(i, "barPrice", parseFloat(e.target.value) || 0)}
                        style={{ ...inputStyle, width: 55, fontSize: 11, textAlign: "center" }} />
                    </td>
                    <td style={{ textAlign: "center", padding: "6px" }}>
                      <input type="number" value={ch.elecPrice} step={0.05} min={0}
                        onChange={(e) => updateChannel(i, "elecPrice", parseFloat(e.target.value) || 0)}
                        style={{ ...inputStyle, width: 55, fontSize: 11, textAlign: "center" }} />
                    </td>
                    <td style={{ textAlign: "center", padding: "6px" }}>
                      <input type="number" value={ch.costPerUnit} step={0.05} min={0}
                        onChange={(e) => updateChannel(i, "costPerUnit", parseFloat(e.target.value) || 0)}
                        style={{ ...inputStyle, width: 55, fontSize: 11, textAlign: "center" }} />
                    </td>
                    <td style={{ textAlign: "center", padding: "6px" }}>
                      <input type="number" value={ch.rampMonths} step={1} min={0}
                        onChange={(e) => updateChannel(i, "rampMonths", parseInt(e.target.value) || 0)}
                        style={{ ...inputStyle, width: 45, fontSize: 11, textAlign: "center" }} />
                    </td>
                    <td style={{ textAlign: "center", padding: "6px" }}>
                      <input type="number" value={ch.maxMonthlyUnits} step={500} min={0}
                        onChange={(e) => updateChannel(i, "maxMonthlyUnits", parseInt(e.target.value) || 0)}
                        style={{ ...inputStyle, width: 60, fontSize: 11, textAlign: "center" }} />
                    </td>
                    <td style={{ textAlign: "center", padding: "6px", color: C.green, fontWeight: 700 }}>{fmt(chRev)}</td>
                    <td style={{ padding: "6px" }}>
                      <button onClick={() => setState((p) => ({ ...p, channels: p.channels.filter((_, j) => j !== i) }))}
                        style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 14 }}>{"\u2715"}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ ...glassCard, marginBottom: 16 }}>
        <h3 style={h3Style}>CHANNEL MARGIN COMPARISON</h3>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${model.activeChannels.length}, 1fr)`, gap: 10 }}>
          {model.activeChannels.map((ch) => {
            const barCOGS = model.barCOGS[model.opTier]?.total || 0;
            const elecCOGS = model.elecCOGS[model.opTier]?.total || 0;
            const blendedPrice = (ch.barPrice + ch.elecPrice) / 2;
            const blendedCOGS = (barCOGS + elecCOGS) / 2;
            const contribution = blendedPrice - ch.costPerUnit - blendedCOGS;
            const margin = blendedPrice > 0 ? contribution / blendedPrice : 0;
            const info = CHANNEL_PROS_CONS[ch.name] || {};
            return (
              <div key={ch.name} style={{ padding: 14, borderRadius: 10, background: `${C.card}`, border: `1px solid ${C.border}`, fontSize: 11 }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: 12, marginBottom: 8 }}>{ch.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ color: C.textMuted }}>Avg Price</span>
                  <span style={{ color: C.green, fontWeight: 600 }}>{fmt(blendedPrice, 2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ color: C.textMuted }}>Channel Cost</span>
                  <span style={{ color: C.orange, fontWeight: 600 }}>({fmt(ch.costPerUnit, 2)})</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ color: C.textMuted }}>COGS</span>
                  <span style={{ color: C.red, fontWeight: 600 }}>({fmt(blendedCOGS, 2)})</span>
                </div>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 4, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.text, fontWeight: 700 }}>Margin</span>
                  <span style={{ color: margin >= 0 ? C.green : C.red, fontWeight: 800 }}>{fmtPct(margin)}</span>
                </div>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 4, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.text, fontWeight: 700 }}>Contribution</span>
                  <span style={{ color: contribution >= 0 ? C.green : C.red, fontWeight: 800 }}>{fmt(contribution, 2)}</span>
                </div>
                {info.pros && (
                  <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: C.greenGlow }}>
                    <div style={{ color: C.green, fontWeight: 600, marginBottom: 2 }}>Pros</div>
                    <div style={{ color: C.textMuted, fontSize: 10 }}>{info.pros}</div>
                  </div>
                )}
                {info.cons && (
                  <div style={{ marginTop: 4, padding: 8, borderRadius: 6, background: C.redGlow }}>
                    <div style={{ color: C.red, fontWeight: 600, marginBottom: 2 }}>Cons</div>
                    <div style={{ color: C.textMuted, fontSize: 10 }}>{info.cons}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={glassCard}>
          <h3 style={h3Style}>SKU PRICING (MSRP Reference)</h3>
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: C.text, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>\uD83C\uDF6B Bars</div>
            <InputRow label="DTC MSRP" value={state.barMSRP} onChange={(v) => setState((p) => ({ ...p, barMSRP: v }))} />
            <InputRow label="Trade / Wholesale" value={state.barTrade} onChange={(v) => setState((p) => ({ ...p, barTrade: v }))} />
          </div>
          <div>
            <div style={{ color: C.text, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>\u26A1 Electrolytes</div>
            <InputRow label="DTC MSRP" value={state.elecMSRP} onChange={(v) => setState((p) => ({ ...p, elecMSRP: v }))} />
            <InputRow label="Trade / Wholesale" value={state.elecTrade} onChange={(v) => setState((p) => ({ ...p, elecTrade: v }))} />
          </div>
        </div>

        <div style={glassCard}>
          <h3 style={h3Style}>CHANNEL RAMP TIMELINE</h3>
          <div style={{ position: "relative", padding: "10px 0" }}>
            {state.channels.filter((c) => c.active).map((ch, i) => (
              <div key={ch.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 100, fontSize: 10, color: C.textMuted, textAlign: "right" }}>{ch.name}</span>
                <div style={{ flex: 1, height: 18, background: "rgba(255,255,255,0.03)", borderRadius: 4, position: "relative" }}>
                  <div style={{
                    position: "absolute", left: `${(ch.rampMonths / 12) * 100}%`, right: 0,
                    height: "100%", borderRadius: 4,
                    background: `linear-gradient(90deg, ${[C.purple, C.violet, C.amber, C.green, C.cyan, C.orange][i % 6]}, ${[C.purple, C.violet, C.amber, C.green, C.cyan, C.orange][i % 6]}66)`,
                  }} />
                  {ch.rampMonths > 0 && (
                    <span style={{ position: "absolute", left: `${(ch.rampMonths / 12) * 100}%`, top: -1, fontSize: 9, color: C.text, fontWeight: 700, transform: "translateX(-50%)" }}>
                      M{ch.rampMonths}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {[0, 3, 6, 9, 12].map((m) => (
                <span key={m} style={{ fontSize: 9, color: C.textDim }}>M{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...glassCard, marginTop: 16 }}>
        <h3 style={h3Style}>GROWTH RATES (Year-over-Year)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
          {[
            { label: "Year 2", key: "growthY2", val: state.growthY2 },
            { label: "Year 3", key: "growthY3", val: state.growthY3 },
            { label: "Year 4", key: "growthY4", val: state.growthY4 },
            { label: "Year 5", key: "growthY5", val: state.growthY5 },
          ].map((g) => (
            <SliderInput key={g.key} label={g.label} value={g.val} min={0} max={3} step={0.05}
              onChange={(v) => setState((p) => ({ ...p, [g.key]: v }))} />
          ))}
        </div>
      </div>

      <div style={{ ...glassCard, marginTop: 16 }}>
        <h3 style={h3Style}>Y1 MONTHLY NET REVENUE</h3>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 120, padding: "0 4px" }}>
          {model.monthly.map((m, i) => {
            const maxRev = Math.max(...model.monthly.map((x) => x.netRev));
            const h = maxRev > 0 ? (m.netRev / maxRev) * 100 : 0;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ width: "100%", height: h, background: `linear-gradient(180deg, ${C.violet}, ${C.purple})`, borderRadius: "4px 4px 0 0", minHeight: 2 }} />
                <span style={{ fontSize: 9, color: C.textDim, marginTop: 4 }}>M{i + 1}</span>
                <span style={{ fontSize: 8, color: C.textDim }}>{fmt(m.netRev)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
