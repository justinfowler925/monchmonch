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
    { name: "DTC (Website)", active: true, pctAlloc: 0.40, barPrice: 3.50, elecPrice: 2.25, costPerUnit: 0.85, rampMonths: 0, maxMonthlyUnits: 30000 },
    { name: "Amazon", active: true, pctAlloc: 0.20, barPrice: 2.80, elecPrice: 1.80, costPerUnit: 0.55, rampMonths: 2, maxMonthlyUnits: 18000 },
    { name: "Big Box Retail", active: false, pctAlloc: 0.0, barPrice: 1.75, elecPrice: 1.13, costPerUnit: 0.45, rampMonths: 24, maxMonthlyUnits: 40000 },
    { name: "Natural/Specialty", active: true, pctAlloc: 0.15, barPrice: 2.10, elecPrice: 1.35, costPerUnit: 0.42, rampMonths: 4, maxMonthlyUnits: 9000 },
    { name: "Vitamin Shops", active: true, pctAlloc: 0.08, barPrice: 1.95, elecPrice: 1.25, costPerUnit: 0.30, rampMonths: 3, maxMonthlyUnits: 4500 },
    { name: "Distributors", active: true, pctAlloc: 0.17, barPrice: 1.50, elecPrice: 0.95, costPerUnit: 0.45, rampMonths: 4, maxMonthlyUnits: 14000 },
  ],

  // Bar + elec RM: BOM + $/lb (or $/each for Wrapper/Sachet) from live unit-economics screen (May 2026)
  barRM: [
    { name: "Flavoring Orig", qty: 0.01, t1: 4, t2: 3.5, t3: 3, moq: 25 },
    { name: "Flavoring Berry", qty: 0.012, t1: 5, t2: 4.33, t3: 3.75, moq: 25 },
    { name: "Wrapper", qty: 1, t1: 0.08, t2: 0.061, t3: 0.05, moq: 5000 },
    { name: "Outer Box", qty: 0.083, t1: 0.36, t2: 0.3, t3: 0.24, moq: 1000 },
    { name: "Whey Protein", qty: 0.044, t1: 10, t2: 9, t3: 8, moq: 200 },
    { name: "Milk Protein Isolate", qty: 0, t1: 10, t2: 9, t3: 8, moq: 200 },
    { name: "Tapioca Fiber", qty: 0, t1: 0, t2: 0, t3: 0, moq: 0 },
    { name: "IMO", qty: 0, t1: 0, t2: 0, t3: 0, moq: 0 },
    { name: "Vegetable Glycerin", qty: 0, t1: 0, t2: 0, t3: 0, moq: 0 },
    { name: "Cocoa Butter", qty: 0, t1: 0, t2: 0, t3: 0, moq: 0 },
    { name: "Sunflower Lecithin", qty: 0, t1: 0, t2: 0, t3: 0, moq: 0 },
    { name: "Stevia Reb M", qty: 0.025, t1: 2.4, t2: 2, t3: 1.6, moq: 100 },
    { name: "Salt", qty: 0, t1: 0, t2: 0, t3: 0, moq: 0 },
    { name: "Cocoa Soy Crisp", qty: 0, t1: 0, t2: 0, t3: 0, moq: 0 },
  ],
  elecRM: [
    { name: "Ascorbic Acid", qty: 0.015, t1: 6.67, t2: 5.5, t3: 4.5, moq: 50 },
    { name: "Monch Fiber", qty: 0.008, t1: 5, t2: 4, t3: 3.25, moq: 100 },
    { name: "Citric Acid", qty: 0.005, t1: 6, t2: 5, t3: 4, moq: 50 },
    { name: "Salt", qty: 0.003, t1: 0.5, t2: 0.4, t3: 0.33, moq: 50 },
    { name: "Potassium Cl", qty: 0.005, t1: 4, t2: 3.5, t3: 3, moq: 50 },
    { name: "Magnesium Malate", qty: 0.008, t1: 5, t2: 4.25, t3: 3.5, moq: 25 },
    { name: "Purified Stevia", qty: 0.003, t1: 1.33, t2: 1, t3: 0.83, moq: 50 },
    { name: "Flavoring", qty: 0.01, t1: 4, t2: 3.5, t3: 3, moq: 25 },
    { name: "Sachet Pkg", qty: 1, t1: 0.05, t2: 0.04, t3: 0.03, moq: 10000 },
  ],

  coManBars: [1.35, 1.20, 1.10, 1.00, 0.92, 0.85, 0.80],
  coManElec: [0.45, 0.40, 0.35, 0.30, 0.27, 0.25, 0.22],
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
  barDemand: [5000, 7000, 9000, 11000, 12000, 13000, 13500, 14000, 14500, 15000, 15500, 16500],
  elecDemand: [4000, 5500, 7000, 8500, 9500, 10500, 11000, 11500, 12000, 12500, 13000, 13500],

  growthY2: 2.57, growthY3: 1.40, growthY4: 1.50, growthY5: 1.20,
  gna: 15000, marketingPct: 0.10, marketingAnnual: 300000,
  marketingByYear: [600000, 1000000, 1750000, 2400000, 3500000],
  payrollY1: 200000, payrollAnnualIncrease: 100000, payrollStartMonth: 4,
  payrollByYear: [571000, 972000, 1590000, 2370000, 3120000],
  overheadMult: [1.0, 1.5, 2.5, 3.5, 4.5],
  spoilageCostMult: 3,
  carryingCostRate: 0.10,

  minBarRun: 5000, minElecRun: 10000,

  // Primary film/sachet/carton costs live in barRM/elecRM (BOM screenshot); keep lines for optional add-ons without double counting
  barPackaging: [
    { name: "Wrapper/Film", costPerUnit: 0, moq: 50000, leadWeeks: 6 },
    { name: "Display Box (12ct)", costPerUnit: 0, moq: 5000, leadWeeks: 4 },
    { name: "Labels", costPerUnit: 0, moq: 25000, leadWeeks: 3 },
    { name: "Inserts", costPerUnit: 0, moq: 25000, leadWeeks: 3 },
  ],
  elecPackaging: [
    { name: "Foil Sachet", costPerUnit: 0, moq: 100000, leadWeeks: 8 },
    { name: "Display Box (20ct)", costPerUnit: 0, moq: 5000, leadWeeks: 4 },
    { name: "Labels", costPerUnit: 0, moq: 25000, leadWeeks: 3 },
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
    { name: "Seed Round (current ask)", amount: 5000000, type: "equity" },
    { name: "Series A (Y2 milestone)", amount: 10000000, type: "equity" },
  ],

  rmLeadWeeks: 4, coManLeadWeeks: 3,
  rmPaymentTerms: 30, coManPaymentTerms: 30, coManDeposit: 0.25,

  startingCash: 200000, equityRaised: 15000000,
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
    note: "Strategic cost reduction focus is SOLELY on Monch fiber. Protein cost is accepted as market-given context, not a reduction target. $0.10/serving is the gate for both bar/packet 5x economics AND B2B ingredient licensing (5x supplier markup = $0.50/serving, viable vs current $1.85 implied).",
  },
  productLineDecisionApr2026: {
    flagshipY1: "Protein + Fiber Bar + Electrolyte Packet (bundled system)",
    bundleRationale: "Packet addresses dehydration (#2 GLP-1 side effect); attach-rate driver, not standalone margin SKU. Bar + Packet ship together Year 1.",
    phase2_H1Y2: "Functional Drink (H1 Year 2, margin-expansion SKU)",
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
