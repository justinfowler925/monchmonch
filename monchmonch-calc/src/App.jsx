import { useState, useMemo, useCallback } from "react";

// ─── COLOR PALETTE ───
const C = {
  bg: "#0C0A14",
  card: "#13111C",
  cardHover: "#1A1726",
  border: "#2A2540",
  borderBright: "#3D3660",
  text: "#E8E4F0",
  textMuted: "#8B85A0",
  textDim: "#5C5670",
  purple: "#8B5CF6",
  purpleGlow: "rgba(139,92,246,0.25)",
  red: "#FF3B5C",
  redGlow: "rgba(255,59,92,0.2)",
  violet: "#6366F1",
  violetGlow: "rgba(99,102,241,0.25)",
  amber: "#FFAA00",
  amberGlow: "rgba(255,170,0,0.2)",
  orange: "#FF6B35",
  green: "#34D399",
  greenGlow: "rgba(52,211,153,0.2)",
};

// ─── UTILITY FUNCTIONS ───
const fmt = (n, dec = 0) => {
  if (n === undefined || n === null || isNaN(n)) return "—";
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3 && dec === 0) return `$${(n / 1e3).toFixed(1)}K`;
  return n < 0
    ? `($${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })})`
    : `$${n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;
};
const fmtN = (n, dec = 0) =>
  n === undefined || isNaN(n) ? "—" : n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtPct = (n) => (isNaN(n) ? "—" : `${(n * 100).toFixed(1)}%`);

// ─── DEFAULT MODEL DATA ───
const DEFAULT = {
  // SKU Pricing
  barMSRP: 3.5, barTrade: 1.75,
  elecMSRP: 2.25, elecTrade: 1.13,
  // Channel
  dtcPct: 0.7, fulfillCost: 2.5, freightCost: 1.0, returnsPct: 0.02,
  // Raw Materials - Bars (qty/unit, tier1, tier2, tier3, moq)
  barRM: [
    { name: "Konjac Gum", qty: 0.015, t1: 6.67, t2: 5.5, t3: 4.5, moq: 50 },
    { name: "Cellulose", qty: 0.008, t1: 5.0, t2: 4.0, t3: 3.25, moq: 100 },
    { name: "Carrageenan", qty: 0.005, t1: 6.0, t2: 5.0, t3: 4.0, moq: 50 },
    { name: "Protein Base", qty: 0.04, t1: 3.75, t2: 3.25, t3: 2.75, moq: 200 },
    { name: "Sweetener/Binder", qty: 0.025, t1: 2.4, t2: 2.0, t3: 1.6, moq: 100 },
    { name: "Flavoring Orig", qty: 0.01, t1: 4.0, t2: 3.5, t3: 3.0, moq: 25 },
    { name: "Flavoring Berry", qty: 0.012, t1: 5.0, t2: 4.33, t3: 3.75, moq: 25 },
    { name: "Wrapper", qty: 1, t1: 0.08, t2: 0.065, t3: 0.05, moq: 5000 },
    { name: "Outer Box", qty: 0.083, t1: 0.36, t2: 0.3, t3: 0.24, moq: 1000 },
  ],
  // Raw Materials - Electrolytes
  elecRM: [
    { name: "Konjac Gum", qty: 0.015, t1: 6.67, t2: 5.5, t3: 4.5, moq: 50 },
    { name: "Cellulose", qty: 0.008, t1: 5.0, t2: 4.0, t3: 3.25, moq: 100 },
    { name: "Carrageenan", qty: 0.005, t1: 6.0, t2: 5.0, t3: 4.0, moq: 50 },
    { name: "Sodium", qty: 0.003, t1: 0.5, t2: 0.4, t3: 0.33, moq: 50 },
    { name: "Potassium Cl", qty: 0.005, t1: 4.0, t2: 3.5, t3: 3.0, moq: 50 },
    { name: "Magnesium Cit", qty: 0.008, t1: 5.0, t2: 4.25, t3: 3.5, moq: 25 },
    { name: "Calcium Carb", qty: 0.003, t1: 1.33, t2: 1.0, t3: 0.83, moq: 50 },
    { name: "Flavoring", qty: 0.01, t1: 4.0, t2: 3.5, t3: 3.0, moq: 25 },
    { name: "Sachet Pkg", qty: 1, t1: 0.05, t2: 0.042, t3: 0.035, moq: 10000 },
  ],
  // Co-Man Pricing
  coManBars: [1.0, 0.75, 0.55, 0.38, 0.27, 0.18, 0.12],
  coManElec: [0.75, 0.55, 0.40, 0.28, 0.20, 0.14, 0.09],
  coManThresholds: [0, 1000, 10000, 100000, 500000, 1000000, 5000000],
  coManLabels: ["1–999", "1K–10K", "10K–100K", "100K–500K", "500K–1M", "1M–5M", "5M+"],
  // Production
  laborPerUnit: 0.3, fixedOverhead: 5000, equipAmort: 2000,
  prodMode: "BLENDED", inHousePct: 0.5,
  // Inventory
  targetDOI: 30, safetyStockPct: 0.15,
  warehousingPerUnit: 0.05, insurancePct: 0.02, costOfCapitalPct: 0.08,
  spoilageBar: 0.005, spoilageElec: 0.002,
  // Seasonality
  barSeason: [1.15, 1.1, 1.05, 0.95, 0.9, 0.95, 1.0, 1.0, 0.95, 0.95, 1.0, 1.0],
  elecSeason: [0.85, 0.85, 0.9, 1.0, 1.1, 1.2, 1.25, 1.2, 1.05, 0.9, 0.85, 0.85],
  // Year 1 Monthly Demand
  barDemand: [500, 700, 900, 1200, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000],
  elecDemand: [300, 400, 600, 800, 1000, 1300, 1600, 2000, 2400, 2800, 3200, 3600],
  // Growth
  growthY2: 1.5, growthY3: 1.0, growthY4: 0.5, growthY5: 0.3,
  // OpEx
  gna: 3000, marketingPct: 0.10,
  // Investment
  entryEquity: 1000000, entryVal: 5000000, holdPeriod: 5,
  exitMultLow: 6, exitMultBase: 8, exitMultHigh: 12,
};

// ─── CALCULATION ENGINE ───
function runModel(s) {
  // RM cost per unit at each tier
  const rmCost = (materials, tier) =>
    materials.reduce((sum, m) => sum + m.qty * m[`t${tier}`], 0);

  const barRMT1 = rmCost(s.barRM, 1), barRMT2 = rmCost(s.barRM, 2), barRMT3 = rmCost(s.barRM, 3);
  const elecRMT1 = rmCost(s.elecRM, 1), elecRMT2 = rmCost(s.elecRM, 2), elecRMT3 = rmCost(s.elecRM, 3);

  // Co-man tier lookup
  const getCoManTier = (vol) => {
    for (let i = s.coManThresholds.length - 1; i >= 0; i--) {
      if (vol >= s.coManThresholds[i]) return i;
    }
    return 0;
  };

  // Labor scales with volume
  const laborAtTier = (tier) => {
    const scales = [1.0, 0.75, 0.5, 0.35, 0.25, 0.18, 0.12];
    return s.laborPerUnit * scales[tier];
  };

  // Overhead per unit at midpoint volume
  const ohAtTier = (tier) => {
    const midVols = [500, 5000, 50000, 250000, 750000, 2500000, 7500000];
    return s.fixedOverhead / midVols[tier];
  };

  // COGS waterfall by tier
  const cogsWaterfall = (rmT1, coManPrices, type) => {
    return s.coManLabels.map((label, i) => {
      const rm = type === "bar" ? [barRMT1, barRMT2, barRMT3] : [elecRMT1, elecRMT2, elecRMT3];
      const rmTier = i < 2 ? rm[0] : i < 4 ? rm[1] : rm[2];
      const labor = laborAtTier(i);
      const oh = ohAtTier(i);
      const coMan = coManPrices[i];
      return { tier: label, rm: rmTier, labor, overhead: oh, coMan, total: rmTier + labor + oh + coMan };
    });
  };

  const barCOGS = cogsWaterfall(barRMT1, s.coManBars, "bar");
  const elecCOGS = cogsWaterfall(elecRMT1, s.coManElec, "elec");

  // Year 1 monthly production schedule
  const wholesalePct = 1 - s.dtcPct;
  const computeY1Monthly = (baseDemand, season, spoilageRate, msrp, trade) => {
    let begInv = 0;
    const months = [];
    for (let m = 0; m < 12; m++) {
      const adjDemand = Math.round(baseDemand[m] * season[m]);
      const safetyStock = Math.ceil(adjDemand * s.safetyStockPct);
      const needed = adjDemand + safetyStock - begInv;
      const prodOrder = Math.max(needed, 0);
      const spoilage = Math.round(begInv * spoilageRate);
      const unitsSold = adjDemand;
      const endInv = begInv + prodOrder - unitsSold - spoilage;
      const dtcUnits = Math.round(unitsSold * s.dtcPct);
      const whUnits = unitsSold - dtcUnits;
      const dtcRev = dtcUnits * msrp;
      const whRev = whUnits * trade;
      const grossRev = dtcRev + whRev;
      const returns = grossRev * s.returnsPct;
      const netRev = grossRev - returns;
      months.push({
        month: m + 1, baseDemand: baseDemand[m], seasonIdx: season[m],
        adjDemand, safetyStock, begInv, prodOrder, spoilage,
        unitsSold, endInv, dtcUnits, whUnits, dtcRev, whRev, grossRev, returns, netRev,
      });
      begInv = endInv;
    }
    return months;
  };

  const barMonthly = computeY1Monthly(s.barDemand, s.barSeason, s.spoilageBar, s.barMSRP, s.barTrade);
  const elecMonthly = computeY1Monthly(s.elecDemand, s.elecSeason, s.spoilageElec, s.elecMSRP, s.elecTrade);

  // Annual totals
  const sumField = (arr, f) => arr.reduce((a, r) => a + r[f], 0);
  const y1BarUnits = sumField(barMonthly, "unitsSold");
  const y1ElecUnits = sumField(elecMonthly, "unitsSold");
  const y1TotalUnits = y1BarUnits + y1ElecUnits;

  // Determine operating COGS tier based on Y1 volume
  const opTier = getCoManTier(y1TotalUnits);
  const barUnitCOGS = barCOGS[opTier].total;
  const elecUnitCOGS = elecCOGS[opTier].total;

  // 5-year projections
  const growthRates = [1, s.growthY2, s.growthY3, s.growthY4, s.growthY5];
  const cumGrowth = [1];
  for (let i = 1; i < 5; i++) cumGrowth[i] = cumGrowth[i - 1] * (1 + growthRates[i]);

  const years = [];
  for (let y = 0; y < 5; y++) {
    const barUnits = Math.round(y1BarUnits * cumGrowth[y]);
    const elecUnits = Math.round(y1ElecUnits * cumGrowth[y]);
    const totalUnits = barUnits + elecUnits;
    const tier = getCoManTier(totalUnits);
    const bCOGSUnit = barCOGS[tier].total;
    const eCOGSUnit = elecCOGS[tier].total;

    const barDTC = Math.round(barUnits * s.dtcPct);
    const barWH = barUnits - barDTC;
    const elecDTC = Math.round(elecUnits * s.dtcPct);
    const elecWH = elecUnits - elecDTC;

    const barGrossRev = barDTC * s.barMSRP + barWH * s.barTrade;
    const elecGrossRev = elecDTC * s.elecMSRP + elecWH * s.elecTrade;
    const totalGrossRev = barGrossRev + elecGrossRev;
    const returnsAmt = totalGrossRev * s.returnsPct;
    const netRev = totalGrossRev - returnsAmt;
    const barNetRev = barGrossRev * (1 - s.returnsPct);
    const elecNetRev = elecGrossRev * (1 - s.returnsPct);

    const totalCOGS = barUnits * bCOGSUnit + elecUnits * eCOGSUnit;
    const grossProfit = netRev - totalCOGS;
    const grossMargin = netRev > 0 ? grossProfit / netRev : 0;

    const fulfillment = barDTC * s.fulfillCost + barWH * s.freightCost +
      elecDTC * s.fulfillCost + elecWH * s.freightCost;
    const fixedOH = (s.fixedOverhead + s.equipAmort) * 12 * (y >= 3 ? 1.5 : 1);
    const marketing = netRev * s.marketingPct;
    const gna = s.gna * 12 * (y >= 3 ? 1.5 : 1);
    const carryingCost = totalUnits * s.warehousingPerUnit * 0.1;
    const spoilageCost = barUnits * s.spoilageBar * bCOGSUnit * 3 + elecUnits * s.spoilageElec * eCOGSUnit * 3;

    const totalOpex = fulfillment + fixedOH + marketing + gna + carryingCost + spoilageCost;
    const ebitda = grossProfit - totalOpex;
    const ebitdaMargin = netRev > 0 ? ebitda / netRev : 0;

    years.push({
      year: y + 1, barUnits, elecUnits, totalUnits, tier, bCOGSUnit, eCOGSUnit,
      barNetRev, elecNetRev, netRev, totalCOGS, grossProfit, grossMargin,
      fulfillment, fixedOH, marketing, gna, carryingCost, spoilageCost,
      totalOpex, ebitda, ebitdaMargin,
    });
  }

  let cumEBITDA = 0;
  years.forEach((y) => { cumEBITDA += y.ebitda; y.cumEBITDA = cumEBITDA; });

  return { barCOGS, elecCOGS, barMonthly, elecMonthly, years, barRMT1, barRMT2, barRMT3, elecRMT1, elecRMT2, elecRMT3, opTier, y1BarUnits, y1ElecUnits, y1TotalUnits };
}

// ─── STYLE HELPERS ───
const glassCard = {
  background: `linear-gradient(135deg, ${C.card} 0%, rgba(19,17,28,0.8) 100%)`,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: "20px 24px",
  backdropFilter: "blur(12px)",
};
const inputStyle = {
  background: "rgba(139,92,246,0.08)",
  border: `1px solid ${C.borderBright}`,
  borderRadius: 8,
  color: C.purple,
  padding: "6px 10px",
  fontSize: 14,
  fontWeight: 600,
  width: 90,
  textAlign: "right",
  outline: "none",
  fontFamily: "inherit",
};
const labelStyle = { color: C.textMuted, fontSize: 12, fontWeight: 500, letterSpacing: 0.3 };
const h2Style = { color: C.text, fontSize: 18, fontWeight: 700, margin: "0 0 16px 0", letterSpacing: -0.3 };
const h3Style = { color: C.textMuted, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.2, margin: "0 0 12px 0" };

// ─── MINI BAR CHART ───
function MiniBar({ data, maxVal, color, label, height = 18 }) {
  const w = maxVal > 0 ? Math.max((data / maxVal) * 100, 1) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <span style={{ fontSize: 11, color: C.textMuted, width: 100, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 4, height, overflow: "hidden" }}>
        <div style={{ width: `${w}%`, height: "100%", background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 4, transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 600, width: 60, textAlign: "right", flexShrink: 0 }}>{fmt(data, 2)}</span>
    </div>
  );
}

// ─── SPARKLINE ───
function Sparkline({ data, width = 200, height = 50, color = C.violet, showArea = true }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height - 8) - 4,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {showArea && <path d={area} fill={`${color}18`} />}
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => i === pts.length - 1 && (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} stroke={C.card} strokeWidth={2} />
      ))}
    </svg>
  );
}

// ─── STACKED BAR CHART FOR P&L ───
function PLChart({ years }) {
  const maxRev = Math.max(...years.map((y) => y.netRev));
  const maxLoss = Math.max(...years.map((y) => Math.abs(y.ebitda)));
  const maxVal = Math.max(maxRev, maxLoss);
  const chartH = 200;
  const barW = 48;
  const gap = 32;
  const totalW = years.length * (barW + gap);
  return (
    <div style={{ overflowX: "auto", padding: "10px 0" }}>
      <svg width={totalW + 40} height={chartH + 50} style={{ display: "block" }}>
        <line x1={20} y1={chartH / 2 + 10} x2={totalW + 30} y2={chartH / 2 + 10} stroke={C.border} strokeWidth={1} strokeDasharray="4,4" />
        {years.map((y, i) => {
          const x = 20 + i * (barW + gap);
          const revH = (y.netRev / maxVal) * (chartH / 2 - 10);
          const ebitdaH = (Math.abs(y.ebitda) / maxVal) * (chartH / 2 - 10);
          const isPos = y.ebitda >= 0;
          return (
            <g key={i}>
              <rect x={x} y={chartH / 2 + 10 - revH} width={barW / 2 - 2} height={revH}
                fill={C.violet} rx={4} opacity={0.85} />
              <rect x={x + barW / 2 + 2} y={isPos ? chartH / 2 + 10 - ebitdaH : chartH / 2 + 10}
                width={barW / 2 - 2} height={ebitdaH}
                fill={isPos ? C.green : C.red} rx={4} opacity={0.85} />
              <text x={x + barW / 2} y={chartH + 30} textAnchor="middle"
                fill={C.textMuted} fontSize={11} fontFamily="inherit">Y{y.year}</text>
            </g>
          );
        })}
        <text x={totalW + 35} y={chartH / 2 - 15} textAnchor="end" fill={C.violet} fontSize={10} fontFamily="inherit">Revenue</text>
        <text x={totalW + 35} y={chartH / 2 + 35} textAnchor="end" fill={C.red} fontSize={10} fontFamily="inherit">EBITDA</text>
      </svg>
    </div>
  );
}

// ─── HERO METRIC CARD ───
function MetricCard({ label, value, sub, color = C.violet, icon }) {
  return (
    <div style={{
      ...glassCard,
      padding: "18px 20px",
      minWidth: 160,
      flex: "1 1 0",
      borderColor: `${color}30`,
      background: `linear-gradient(135deg, ${C.card} 0%, ${color}08 100%)`,
    }}>
      <div style={{ ...labelStyle, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
        {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── INPUT ROW ───
function InputRow({ label, value, onChange, prefix = "$", suffix, step = 0.01, min = 0, max, tip }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}22` }}>
      <div style={{ flex: 1 }}>
        <span style={{ ...labelStyle }}>{label}</span>
        {tip && <span style={{ fontSize: 10, color: C.textDim, marginLeft: 6 }}>{tip}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {prefix && <span style={{ color: C.textDim, fontSize: 12 }}>{prefix}</span>}
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          style={inputStyle}
        />
        {suffix && <span style={{ color: C.textDim, fontSize: 12 }}>{suffix}</span>}
      </div>
    </div>
  );
}

// ─── SLIDER INPUT ───
function SliderInput({ label, value, onChange, min = 0, max = 1, step = 0.01, format = "pct" }) {
  const display = format === "pct" ? `${(value * 100).toFixed(0)}%` : format === "dollar" ? fmt(value, 2) : fmtN(value);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={labelStyle}>{label}</span>
        <span style={{ color: C.purple, fontSize: 13, fontWeight: 700 }}>{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: C.purple, height: 4 }}
      />
    </div>
  );
}

// ─── TAB COMPONENTS ───

// TAB 1: UNIT ECONOMICS
function UnitEconTab({ state, setState }) {
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
            {["Material", "Qty/Unit", "$/lb T1", "$/lb T2", "$/lb T3", "Cost/Unit"].map((h) => (
              <th key={h} style={{ ...labelStyle, padding: "8px 6px", textAlign: h === "Material" ? "left" : "right", borderBottom: `1px solid ${C.border}` }}>{h}</th>
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
                  style={{ ...inputStyle, width: 70, fontSize: 12 }} />
              </td>
              {["t1", "t2", "t3"].map((t) => (
                <td key={t} style={{ textAlign: "right", padding: "6px" }}>
                  <input type="number" value={m[t]} step={0.01} min={0}
                    onChange={(e) => updateRM(type, i, t, parseFloat(e.target.value) || 0)}
                    style={{ ...inputStyle, width: 65, fontSize: 12 }} />
                </td>
              ))}
              <td style={{ textAlign: "right", padding: "6px", color: C.amber, fontWeight: 700 }}>
                {fmt(m.qty * m[`t${selectedTier}`], 4)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: `2px solid ${C.purple}44` }}>
            <td colSpan={5} style={{ padding: "8px 6px", color: C.text, fontWeight: 700 }}>TOTAL RM COST / UNIT</td>
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
        <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
          {[{ c: C.purple, l: "Raw Materials" }, { c: C.violet, l: "Labor" }, { c: C.amber, l: "Overhead" }, { c: C.orange, l: "Co-Man" }].map((x) => (
            <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: x.c }} />
              <span style={{ fontSize: 10, color: C.textMuted }}>{x.l}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <MetricCard label="Bar RM Cost (T1)" value={fmt(model.barRMT1, 3)} sub="/unit" color={C.purple} icon="🍫" />
        <MetricCard label="Elec RM Cost (T1)" value={fmt(model.elecRMT1, 3)} sub="/unit" color={C.violet} icon="⚡" />
        <MetricCard label="Bar COGS @ Operating" value={fmt(model.barCOGS[model.opTier]?.total, 3)} sub={`Tier ${model.opTier + 1} • ${fmtN(model.y1TotalUnits)} units`} color={C.amber} icon="📦" />
        <MetricCard label="Elec COGS @ Operating" value={fmt(model.elecCOGS[model.opTier]?.total, 3)} sub={`Tier ${model.opTier + 1}`} color={C.orange} icon="📦" />
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
        <h3 style={h3Style}>PRODUCTION COSTS</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <InputRow label="Direct Labor $/unit" value={state.laborPerUnit} onChange={(v) => setState((p) => ({ ...p, laborPerUnit: v }))} />
          <InputRow label="Fixed Overhead $/mo" value={state.fixedOverhead} step={100}
            onChange={(v) => setState((p) => ({ ...p, fixedOverhead: v }))} />
          <InputRow label="Equipment Amort $/mo" value={state.equipAmort} step={100}
            onChange={(v) => setState((p) => ({ ...p, equipAmort: v }))} />
        </div>
      </div>
    </div>
  );
}

// TAB 2: REVENUE & CHANNEL
function RevenueTab({ state, setState }) {
  const model = useMemo(() => runModel(state), [state]);
  const y1 = model.years[0];
  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <MetricCard label="Y1 Net Revenue" value={fmt(y1.netRev)} color={C.violet} icon="💰" sub={`${fmtN(y1.totalUnits)} units`} />
        <MetricCard label="Y5 Net Revenue" value={fmt(model.years[4].netRev)} color={C.purple} icon="🚀" sub={`${fmtN(model.years[4].totalUnits)} units`} />
        <MetricCard label="Blended ASP" value={fmt(y1.netRev / y1.totalUnits, 2)} color={C.amber} icon="📊" sub="net revenue / unit" />
        <MetricCard label="Gross Margin" value={fmtPct(y1.grossMargin)} color={C.green} icon="📈" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={glassCard}>
          <h3 style={h3Style}>SKU PRICING</h3>
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: C.text, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>🍫 Bars</div>
            <InputRow label="DTC MSRP" value={state.barMSRP} onChange={(v) => setState((p) => ({ ...p, barMSRP: v }))} />
            <InputRow label="Trade / Wholesale" value={state.barTrade} onChange={(v) => setState((p) => ({ ...p, barTrade: v }))} />
          </div>
          <div>
            <div style={{ color: C.text, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>⚡ Electrolytes</div>
            <InputRow label="DTC MSRP" value={state.elecMSRP} onChange={(v) => setState((p) => ({ ...p, elecMSRP: v }))} />
            <InputRow label="Trade / Wholesale" value={state.elecTrade} onChange={(v) => setState((p) => ({ ...p, elecTrade: v }))} />
          </div>
        </div>

        <div style={glassCard}>
          <h3 style={h3Style}>CHANNEL MIX</h3>
          <SliderInput label="DTC %" value={state.dtcPct} onChange={(v) => setState((p) => ({ ...p, dtcPct: v }))} />
          <div style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}22`, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ ...labelStyle }}>Wholesale %</span>
              <span style={{ color: C.violet, fontWeight: 700, fontSize: 13 }}>{((1 - state.dtcPct) * 100).toFixed(0)}%</span>
            </div>
          </div>
          <InputRow label="DTC Fulfillment $/unit" value={state.fulfillCost} onChange={(v) => setState((p) => ({ ...p, fulfillCost: v }))} />
          <InputRow label="Wholesale Freight $/unit" value={state.freightCost} onChange={(v) => setState((p) => ({ ...p, freightCost: v }))} />
          <InputRow label="Returns / Allowances" value={state.returnsPct} suffix="%" step={0.005}
            prefix="" onChange={(v) => setState((p) => ({ ...p, returnsPct: v }))} />
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
          {model.barMonthly.map((bm, i) => {
            const em = model.elecMonthly[i];
            const total = bm.netRev + em.netRev;
            const maxRev = Math.max(...model.barMonthly.map((b, j) => b.netRev + model.elecMonthly[j].netRev));
            const h = (total / maxRev) * 100;
            const bH = (bm.netRev / total) * h;
            const eH = h - bH;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ height: eH, background: C.violet, borderRadius: "4px 4px 0 0", minHeight: eH > 0 ? 2 : 0 }} />
                  <div style={{ height: bH, background: C.purple, borderRadius: eH > 0 ? 0 : "4px 4px 0 0", minHeight: 2 }} />
                </div>
                <span style={{ fontSize: 9, color: C.textDim, marginTop: 4 }}>M{i + 1}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: C.purple }} />
            <span style={{ fontSize: 10, color: C.textMuted }}>Bars</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: C.violet }} />
            <span style={{ fontSize: 10, color: C.textMuted }}>Electrolytes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// TAB 3: PRODUCTION & INVENTORY
function ProductionTab({ state, setState }) {
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
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <MetricCard label="Y1 Bar Units" value={fmtN(model.y1BarUnits)} color={C.purple} icon="🍫" />
        <MetricCard label="Y1 Elec Units" value={fmtN(model.y1ElecUnits)} color={C.violet} icon="⚡" />
        <MetricCard label="Y1 Total Units" value={fmtN(model.y1TotalUnits)} color={C.amber} icon="📦" />
        <MetricCard label="Operating Vol Tier" value={`Tier ${model.opTier + 1}`} color={C.green} icon="🏭" sub={state.coManLabels[model.opTier]} />
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
            <div style={{ color: C.text, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>🍫 Bars</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              {state.barDemand.map((v, i) => (
                <InputRow key={i} label={months[i]} value={v} prefix="" step={100}
                  onChange={(val) => updateDemand("bar", i, val)} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ color: C.text, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>⚡ Electrolytes</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              {state.elecDemand.map((v, i) => (
                <InputRow key={i} label={months[i]} value={v} prefix="" step={100}
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
            <div style={{ color: C.text, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>🍫 Bars (avg: {(state.barSeason.reduce((a, b) => a + b, 0) / 12).toFixed(2)})</div>
            {state.barSeason.map((v, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ ...labelStyle, width: 32 }}>{months[i]}</span>
                <input type="range" min={0.5} max={1.5} step={0.05} value={v}
                  onChange={(e) => updateSeason("bar", i, parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: C.purple, height: 3 }} />
                <span style={{ color: v >= 1 ? C.green : C.red, fontSize: 12, fontWeight: 700, width: 36, textAlign: "right" }}>{v.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ color: C.text, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>⚡ Electrolytes (avg: {(state.elecSeason.reduce((a, b) => a + b, 0) / 12).toFixed(2)})</div>
            {state.elecSeason.map((v, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ ...labelStyle, width: 32 }}>{months[i]}</span>
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
        <h3 style={h3Style}>Y1 PRODUCTION SCHEDULE — BARS</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr>
                {["", ...months].map((h) => (
                  <th key={h} style={{ ...labelStyle, padding: "6px 4px", textAlign: h ? "right" : "left", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Adj Demand", field: "adjDemand", color: C.text },
                { label: "Production", field: "prodOrder", color: C.purple },
                { label: "Units Sold", field: "unitsSold", color: C.violet },
                { label: "End Inventory", field: "endInv", color: C.amber },
                { label: "Spoilage", field: "spoilage", color: C.red },
              ].map((row) => (
                <tr key={row.field} style={{ borderBottom: `1px solid ${C.border}22` }}>
                  <td style={{ padding: "5px 4px", color: row.color, fontWeight: 600, whiteSpace: "nowrap" }}>{row.label}</td>
                  {model.barMonthly.map((m, i) => (
                    <td key={i} style={{ padding: "5px 4px", textAlign: "right", color: row.color }}>{fmtN(m[row.field])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// TAB 4: 5-YEAR P&L
function PLTab({ state }) {
  const model = useMemo(() => runModel(state), [state]);
  const yrs = model.years;
  const y5 = yrs[4];

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <MetricCard label="Y5 Revenue" value={fmt(y5.netRev)} color={C.violet} icon="💰" sub={`${fmtN(y5.totalUnits)} units`} />
        <MetricCard label="Y5 Gross Margin" value={fmtPct(y5.grossMargin)} color={C.green} icon="📈" />
        <MetricCard label="Y5 EBITDA" value={fmt(y5.ebitda)} color={y5.ebitda >= 0 ? C.green : C.red} icon={y5.ebitda >= 0 ? "✅" : "⚠️"} />
        <MetricCard label="Cumulative EBITDA" value={fmt(y5.cumEBITDA)} color={y5.cumEBITDA >= 0 ? C.green : C.red} icon="📊" sub="5-year total" />
      </div>

      <div style={{ ...glassCard, marginBottom: 16 }}>
        <h3 style={h3Style}>REVENUE vs EBITDA — 5 YEAR</h3>
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
                { label: "Net Revenue — Bars", field: "barNetRev", color: C.violet, bold: false },
                { label: "Net Revenue — Electrolytes", field: "elecNetRev", color: C.violet, bold: false },
                { label: "TOTAL NET REVENUE", field: "netRev", color: C.violet, bold: true },
                { label: "", field: null },
                { label: "Total COGS", field: "totalCOGS", color: C.red, bold: false },
                { label: "GROSS PROFIT", field: "grossProfit", color: C.green, bold: true },
                { label: "Gross Margin %", field: "grossMargin", color: C.green, bold: false, pct: true },
                { label: "", field: null },
                { label: "Fulfillment & Freight", field: "fulfillment", color: C.textMuted, bold: false },
                { label: "Fixed Overhead", field: "fixedOH", color: C.textMuted, bold: false },
                { label: "Marketing", field: "marketing", color: C.textMuted, bold: false },
                { label: "G&A", field: "gna", color: C.textMuted, bold: false },
                { label: "Carrying Costs", field: "carryingCost", color: C.textMuted, bold: false },
                { label: "Spoilage", field: "spoilageCost", color: C.textMuted, bold: false },
                { label: "TOTAL OPEX", field: "totalOpex", color: C.orange, bold: true },
                { label: "", field: null },
                { label: "EBITDA", field: "ebitda", color: null, bold: true, dynamic: true },
                { label: "EBITDA Margin %", field: "ebitdaMargin", color: null, bold: false, pct: true, dynamic: true },
                { label: "Cumulative EBITDA", field: "cumEBITDA", color: null, bold: true, dynamic: true },
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
                          color: cellColor, fontSize: row.bold ? 13 : 12,
                          fontFamily: "inherit",
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
        <h3 style={h3Style}>UNIT VOLUME — 5 YEAR</h3>
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

// ─── MAIN APP ───
export default function MonchMonchCalculator() {
  const [state, setState] = useState({ ...DEFAULT });
  const [tab, setTab] = useState(0);
  const tabs = [
    { label: "Unit Economics", icon: "⚙️" },
    { label: "Revenue & Channel", icon: "💰" },
    { label: "Production & Inventory", icon: "🏭" },
    { label: "5-Year P&L", icon: "📊" },
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
      {/* Header */}
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
              Interactive Operations & Revenue Calculator — v2.0
            </p>
          </div>
          <button onClick={reset} style={{
            padding: "8px 18px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: "transparent", color: C.textMuted, fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.2s",
          }}
            onMouseOver={(e) => { e.target.style.borderColor = C.red; e.target.style.color = C.red; }}
            onMouseOut={(e) => { e.target.style.borderColor = C.border; e.target.style.color = C.textMuted; }}
          >
            Reset to Defaults
          </button>
        </div>

        {/* Tab Bar */}
        <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.border}` }}>
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: "none", borderBottom: tab === i ? `2px solid ${C.purple}` : "2px solid transparent",
              background: tab === i ? "rgba(139,92,246,0.08)" : "transparent",
              color: tab === i ? C.purple : C.textMuted,
              borderRadius: "8px 8px 0 0",
              fontFamily: "inherit",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: "20px 32px" }}>
        {tab === 0 && <UnitEconTab state={state} setState={setState} />}
        {tab === 1 && <RevenueTab state={state} setState={setState} />}
        {tab === 2 && <ProductionTab state={state} setState={setState} />}
        {tab === 3 && <PLTab state={state} />}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "20px 32px 0", borderTop: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 11, color: C.textDim }}>
          MonchMonch Financial Model Calculator — KH Framework v2.0 — All calculations run client-side
        </span>
      </div>
    </div>
  );
}
