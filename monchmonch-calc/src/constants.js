export const C = {
  bg: "#0C0A14", card: "#13111C", cardHover: "#1A1726",
  border: "#2A2540", borderBright: "#3D3660",
  text: "#E8E4F0", textMuted: "#8B85A0", textDim: "#5C5670",
  purple: "#8B5CF6", purpleGlow: "rgba(139,92,246,0.25)",
  red: "#FF3B5C", redGlow: "rgba(255,59,92,0.2)",
  violet: "#6366F1", violetGlow: "rgba(99,102,241,0.25)",
  amber: "#FFAA00", amberGlow: "rgba(255,170,0,0.2)",
  orange: "#FF6B35", green: "#34D399", greenGlow: "rgba(52,211,153,0.2)",
  cyan: "#22D3EE",
};

export const fmt = (n, dec = 0) => {
  if (n === undefined || n === null || isNaN(n)) return "\u2014";
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3 && dec === 0) return `$${(n / 1e3).toFixed(1)}K`;
  return n < 0
    ? `($${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })})`
    : `$${n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;
};
export const fmtN = (n, dec = 0) =>
  n === undefined || isNaN(n) ? "\u2014" : n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
export const fmtPct = (n) => (isNaN(n) ? "\u2014" : `${(n * 100).toFixed(1)}%`);

export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const DEFAULT = {
  barMSRP: 3.5, barTrade: 1.75,
  elecMSRP: 2.25, elecTrade: 1.13,
  fulfillCost: 2.5, freightCost: 1.0, returnsPct: 0.02,

  channels: [
    { name: "DTC (Website)", active: true, pctAlloc: 0.35, barPrice: 3.50, elecPrice: 2.25, costPerUnit: 2.50, rampMonths: 0, maxMonthlyUnits: 5000 },
    { name: "Amazon", active: true, pctAlloc: 0.20, barPrice: 2.80, elecPrice: 1.80, costPerUnit: 1.50, rampMonths: 2, maxMonthlyUnits: 3000 },
    { name: "Big Box Retail", active: false, pctAlloc: 0.0, barPrice: 1.75, elecPrice: 1.13, costPerUnit: 0.80, rampMonths: 12, maxMonthlyUnits: 20000 },
    { name: "Natural/Specialty", active: true, pctAlloc: 0.20, barPrice: 2.10, elecPrice: 1.35, costPerUnit: 0.60, rampMonths: 6, maxMonthlyUnits: 4000 },
    { name: "Vitamin Shops", active: true, pctAlloc: 0.10, barPrice: 1.95, elecPrice: 1.25, costPerUnit: 0.40, rampMonths: 3, maxMonthlyUnits: 2000 },
    { name: "Distributors", active: true, pctAlloc: 0.15, barPrice: 1.50, elecPrice: 0.95, costPerUnit: 0.30, rampMonths: 4, maxMonthlyUnits: 8000 },
  ],

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

  coManBars: [1.0, 0.75, 0.55, 0.38, 0.27, 0.18, 0.12],
  coManElec: [0.75, 0.55, 0.40, 0.28, 0.20, 0.14, 0.09],
  coManThresholds: [0, 1000, 10000, 100000, 500000, 1000000, 5000000],
  coManLabels: ["1\u2013999", "1K\u201310K", "10K\u2013100K", "100K\u2013500K", "500K\u20131M", "1M\u20135M", "5M+"],

  laborPerUnit: 0.3, fixedOverhead: 5000, equipAmort: 2000,
  laborRoles: [
    { role: "Production Operator", headcount: 2, rate: 22, hoursPerRun: 8, isVariable: true },
    { role: "QA Inspector", headcount: 1, rate: 28, hoursPerRun: 4, isVariable: true },
    { role: "Warehouse", headcount: 1, rate: 18, hoursPerRun: 6, isVariable: true },
    { role: "Production Manager", headcount: 1, rate: 45, hoursPerRun: 8, isVariable: false },
  ],

  targetDOI: 30, safetyStockPct: 0.15,
  warehousingPerUnit: 0.05, insurancePct: 0.02, costOfCapitalPct: 0.08,
  spoilageBar: 0.005, spoilageElec: 0.002,

  barSeason: [1.15, 1.1, 1.05, 0.95, 0.9, 0.95, 1.0, 1.0, 0.95, 0.95, 1.0, 1.0],
  elecSeason: [0.85, 0.85, 0.9, 1.0, 1.1, 1.2, 1.25, 1.2, 1.05, 0.9, 0.85, 0.85],
  barDemand: [500, 700, 900, 1200, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000],
  elecDemand: [300, 400, 600, 800, 1000, 1300, 1600, 2000, 2400, 2800, 3200, 3600],

  growthY2: 1.5, growthY3: 1.0, growthY4: 0.5, growthY5: 0.3,
  gna: 3000, marketingPct: 0.10,
  overheadMult: [1.0, 1.0, 1.5, 1.5, 1.5],
  spoilageCostMult: 3,
  carryingCostRate: 0.10,

  minBarRun: 5000, minElecRun: 10000,

  barPackaging: [
    { name: "Wrapper/Film", costPerUnit: 0.08, moq: 50000, leadWeeks: 6 },
    { name: "Display Box (12ct)", costPerUnit: 0.03, moq: 5000, leadWeeks: 4 },
    { name: "Labels", costPerUnit: 0.02, moq: 25000, leadWeeks: 3 },
    { name: "Inserts", costPerUnit: 0.01, moq: 25000, leadWeeks: 3 },
  ],
  elecPackaging: [
    { name: "Foil Sachet", costPerUnit: 0.05, moq: 100000, leadWeeks: 8 },
    { name: "Display Box (20ct)", costPerUnit: 0.025, moq: 5000, leadWeeks: 4 },
    { name: "Labels", costPerUnit: 0.015, moq: 25000, leadWeeks: 3 },
  ],

  launchExpenses: [
    { name: "Kosher Certification", cost: 10000, month: -3, notes: "Factory certification" },
    { name: "Clean Room Buildout", cost: 150000, month: -6, notes: "GMP clean rooms" },
    { name: "Factory Inventory Min", cost: 15000, month: -1, notes: "5 tons minimum" },
    { name: "Bar Recipe Dev (3 flavors)", cost: 17500, month: -4, notes: "3 flavor formulations" },
    { name: "Branding & Design", cost: 25000, month: -4, notes: "Package design, brand identity" },
    { name: "Legal & Regulatory", cost: 15000, month: -5, notes: "FDA, labeling compliance" },
  ],
  fundingSources: [
    { name: "Founder Equity", amount: 200000, type: "equity" },
    { name: "Angel Investment", amount: 300000, type: "equity" },
  ],

  rmLeadWeeks: 4, coManLeadWeeks: 3,
  rmPaymentTerms: 30, coManPaymentTerms: 30, coManDeposit: 0.25,

  startingCash: 500000, equityRaised: 500000,
  debtAmount: 0, debtRate: 0.08, debtTerm: 36,

  commitments: [
    { name: "Co-Manufacturer", type: "production", monthlyCost: 0, termMonths: 24, notes: "Min 10K units/mo" },
    { name: "Warehouse Lease", type: "facility", monthlyCost: 3500, termMonths: 12, notes: "3,000 sq ft" },
    { name: "Equipment Lease", type: "equipment", monthlyCost: 2000, termMonths: 36, notes: "Packaging line" },
  ],

  entryEquity: 1000000, entryVal: 5000000, holdPeriod: 5,
  exitMultLow: 6, exitMultBase: 8, exitMultHigh: 12,

  monchFiberCostScenarios: {
    current: 0.37,
    reformulateBlend: 0.20,
    inhouseScale: 0.18,
    strategicCoDev: 0.11,
    combined: 0.08,
    target: 0.10,
    competitiveFloor: 0.025,
  },
  proteinCostBenchmarks2026: {
    wheyIsolatePerKg: 25,
    wheyIsolatePer15gServing: 0.375,
    peaIsolatePerKg: 10,
    peaIsolatePer15gServing: 0.15,
    dualBlendPer15gServing: 0.18,
    note: "WPI up 50-110% since 2024; new capacity late 2026-27 (Glanbia, Tirlan, Idaho Milk Products). Pea isolate 80% at $8-12/kg bulk.",
  },
  productLineDecisionApr2026: {
    flagship: "Protein + Fiber Bar (Phase 1 - Year 1)",
    phase2: "Functional Drink (H1 Year 2)",
    deprecated: "Electrolyte Packets (removed from GTM)",
    retailCogsMultiple: 5,
    barMaxCogsAt349Retail: 0.70,
    productionPartner: "Flavor Insights (creators of Muscle Milk)",
  },
  coDevelopmentCandidates: [
    { name: "Cargill", platform: "Oliggo-Fiber inulin", role: "Scale anchor; Food System Design co-dev model" },
    { name: "Tate & Lyle", platform: "Promitor Soluble Corn Fiber", role: "Most flexible co-dev terms historically" },
    { name: "ADM", platform: "Fibersol-2 RS maltodextrin", role: "Digestion-resistant expertise" },
    { name: "IFF", platform: "ex-DuPont Nutrition portfolio", role: "Premium formulation IP, nimble" },
    { name: "DSM-Firmenich", platform: "Premium nutrition", role: "Willing to pay for differentiated IP" },
  ],
};
