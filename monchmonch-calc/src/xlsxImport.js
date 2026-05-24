/**
 * Parse a monchmonch_model_vN.xlsx file (Ben's INPUTS-tab schema) into calc state.
 *
 * Mirrors scripts/xlsx_to_scenario.py — cell map must stay in sync per AUDIT_SYNC.md.
 *
 * Usage:
 *   import * as XLSX from "xlsx";
 *   const wb = XLSX.read(arrayBuffer, { type: "array" });
 *   const state = parseSpreadsheetToState(wb);
 *   setState(state);
 */

const cellVal = (sheet, addr, defaultVal) => {
  const c = sheet[addr];
  return c && c.v !== undefined ? c.v : defaultVal;
};

const cellNum = (sheet, addr, defaultVal = 0) => {
  const v = cellVal(sheet, addr, defaultVal);
  return typeof v === "number" ? v : (Number(v) || defaultVal);
};

const cellInt = (sheet, addr, defaultVal = 0) => Math.round(cellNum(sheet, addr, defaultVal));

const rangeHoriz = (sheet, row, startCol, count) => {
  // SheetJS uses A=col 1; we'll build addresses like B62, C62, ...
  const out = [];
  for (let i = 0; i < count; i++) {
    const colLetter = String.fromCharCode("A".charCodeAt(0) + startCol - 1 + i);
    out.push(cellNum(sheet, `${colLetter}${row}`));
  }
  return out;
};

export function parseSpreadsheetToState(workbook) {
  if (!workbook?.Sheets?.INPUTS) {
    throw new Error("Spreadsheet must contain an 'INPUTS' sheet (monchmonch_model_vN.xlsx format)");
  }
  const ws = workbook.Sheets.INPUTS;
  const state = {};

  // GLOBAL ASSUMPTIONS (R5-R14)
  state.returnsPct = cellNum(ws, "B5");
  state.targetDOI = cellNum(ws, "B6");
  state.safetyStockPct = cellNum(ws, "B7");
  state.warehousingPerUnit = cellNum(ws, "B8");
  state.insurancePct = cellNum(ws, "B9");
  state.costOfCapitalPct = cellNum(ws, "B10");
  state.spoilageBar = cellNum(ws, "B11");
  state.spoilageElec = cellNum(ws, "B12");
  state.spoilageCostMult = cellNum(ws, "B13", 3);
  state.carryingCostRate = cellNum(ws, "B14", 0.1);

  // LABOR ROLES (R18-R21)
  state.laborRoles = [];
  for (let r = 18; r <= 21; r++) {
    const role = cellVal(ws, `A${r}`);
    if (role) {
      state.laborRoles.push({
        role,
        headcount: cellNum(ws, `B${r}`),
        rate: cellNum(ws, `C${r}`),
        hoursPerRun: cellNum(ws, `D${r}`),
        isVariable: cellVal(ws, `E${r}`) === "Yes",
      });
    }
  }
  state.laborPerUnit = cellNum(ws, "B24");
  state.fixedOverhead = cellNum(ws, "B25");
  state.equipAmort = cellNum(ws, "B26");
  state.gna = cellNum(ws, "B27");

  // LEGACY PRICING (R30-R37)
  state.barMSRP = cellNum(ws, "B30");
  state.barTrade = cellNum(ws, "B31");
  state.elecMSRP = cellNum(ws, "B32");
  state.elecTrade = cellNum(ws, "B33");
  state.fulfillCost = cellNum(ws, "B34");
  state.freightCost = cellNum(ws, "B35");
  state.marketingPct = cellNum(ws, "B36");
  state.marketingAnnual = cellNum(ws, "B37");

  // CHANNELS (R41-R46)
  state.channels = [];
  for (let r = 41; r <= 46; r++) {
    const name = cellVal(ws, `A${r}`);
    if (name) {
      state.channels.push({
        name,
        active: cellVal(ws, `B${r}`) === "Yes",
        pctAlloc: cellNum(ws, `C${r}`),
        barPrice: cellNum(ws, `D${r}`),
        elecPrice: cellNum(ws, `E${r}`),
        costPerUnit: cellNum(ws, `F${r}`),
        rampMonths: cellInt(ws, `G${r}`),
        maxMonthlyUnits: cellInt(ws, `H${r}`),
      });
    }
  }

  // CO-MAN PRICING (R51-R57)
  state.coManThresholds = [];
  state.coManLabels = [];
  state.coManBars = [];
  state.coManElec = [];
  for (let r = 51; r <= 57; r++) {
    state.coManLabels.push(cellVal(ws, `B${r}`));
    state.coManThresholds.push(cellNum(ws, `C${r}`));
    state.coManBars.push(cellNum(ws, `E${r}`));
    state.coManElec.push(cellNum(ws, `F${r}`));
  }

  // GROWTH + ANNUAL OPEX ARRAYS (R61-R67)
  const growth = rangeHoriz(ws, 61, 2, 5); // B-F
  state.growthY2 = growth[1];
  state.growthY3 = growth[2];
  state.growthY4 = growth[3];
  state.growthY5 = growth[4];
  state.marketingByYear = rangeHoriz(ws, 62, 2, 5);
  state.payrollByYear = rangeHoriz(ws, 63, 2, 5);
  state.bdSalesByYear = rangeHoriz(ws, 64, 2, 5);
  state.clinicalByYear = rangeHoriz(ws, 65, 2, 5);
  state.overheadMult = rangeHoriz(ws, 66, 2, 5);
  state.licensingByYear = rangeHoriz(ws, 67, 2, 5);
  state.licensingCogsPct = cellNum(ws, "B68", 0.25);
  state.payrollY1 = cellNum(ws, "B69");
  state.payrollStartMonth = cellInt(ws, "B70", 1);

  // BAR RM (R74-R87)
  state.barRM = [];
  for (let r = 74; r <= 87; r++) {
    const name = cellVal(ws, `A${r}`);
    if (name) {
      state.barRM.push({
        name,
        qty: cellNum(ws, `B${r}`),
        t1: cellNum(ws, `C${r}`),
        t2: cellNum(ws, `D${r}`),
        t3: cellNum(ws, `E${r}`),
        moq: cellInt(ws, `F${r}`),
      });
    }
  }

  // ELEC RM (R91-R99)
  state.elecRM = [];
  for (let r = 91; r <= 99; r++) {
    const name = cellVal(ws, `A${r}`);
    if (name) {
      state.elecRM.push({
        name,
        qty: cellNum(ws, `B${r}`),
        t1: cellNum(ws, `C${r}`),
        t2: cellNum(ws, `D${r}`),
        t3: cellNum(ws, `E${r}`),
        moq: cellInt(ws, `F${r}`),
      });
    }
  }

  // Y1 DEMAND + SEASONALITY (R103-R114)
  state.barDemand = [];
  state.elecDemand = [];
  state.barSeason = [];
  state.elecSeason = [];
  for (let r = 103; r <= 114; r++) {
    state.barDemand.push(cellInt(ws, `B${r}`));
    state.elecDemand.push(cellInt(ws, `C${r}`));
    state.barSeason.push(cellNum(ws, `D${r}`, 1));
    state.elecSeason.push(cellNum(ws, `E${r}`, 1));
  }

  // LAUNCH EXPENSES (R119-R124)
  state.launchExpenses = [];
  for (let r = 119; r <= 124; r++) {
    const name = cellVal(ws, `A${r}`);
    if (name) {
      state.launchExpenses.push({
        name,
        cost: cellNum(ws, `B${r}`),
        month: cellInt(ws, `C${r}`),
        notes: cellVal(ws, `D${r}`, ""),
      });
    }
  }

  // FUNDING (R128-R132)
  state.startingCash = cellNum(ws, "B128");
  state.equityRaised = cellNum(ws, "B129");
  state.debtAmount = cellNum(ws, "B130");
  state.debtRate = cellNum(ws, "B131");
  state.debtTerm = cellInt(ws, "B132");

  // COMMITMENTS (R136-R138)
  state.commitments = [];
  for (let r = 136; r <= 138; r++) {
    const name = cellVal(ws, `A${r}`);
    if (name) {
      state.commitments.push({
        name,
        type: cellVal(ws, `B${r}`, ""),
        monthlyCost: cellNum(ws, `C${r}`),
        termMonths: cellInt(ws, `D${r}`),
        notes: cellVal(ws, `E${r}`, ""),
      });
    }
  }

  // MIN RUNS (R142-R143)
  state.minBarRun = cellInt(ws, "B142");
  state.minElecRun = cellInt(ws, "B143");

  // WORKING CAPITAL (R147-R149, added in v6 sync)
  state.arDays = cellNum(ws, "B147", 35);
  state.inventoryDays = cellNum(ws, "B148", 60);
  state.apDays = cellNum(ws, "B149", 30);

  // Sensible defaults for fields the spreadsheet doesn't carry
  state.payrollAnnualIncrease = state.payrollAnnualIncrease ?? 200000;
  state.rmLeadWeeks = state.rmLeadWeeks ?? 4;
  state.coManLeadWeeks = state.coManLeadWeeks ?? 3;
  state.rmPaymentTerms = state.rmPaymentTerms ?? 30;
  state.coManPaymentTerms = state.coManPaymentTerms ?? 30;
  state.coManDeposit = state.coManDeposit ?? 0.25;

  // Packaging arrays — not in spreadsheet INPUTS, use $0 default
  state.barPackaging = state.barPackaging ?? [
    { name: "Wrapper/Film", costPerUnit: 0, moq: 50000, leadWeeks: 6 },
    { name: "Display Box (12ct)", costPerUnit: 0, moq: 5000, leadWeeks: 4 },
    { name: "Labels", costPerUnit: 0, moq: 25000, leadWeeks: 3 },
    { name: "Inserts", costPerUnit: 0, moq: 25000, leadWeeks: 3 },
  ];
  state.elecPackaging = state.elecPackaging ?? [
    { name: "Foil Sachet", costPerUnit: 0, moq: 100000, leadWeeks: 8 },
    { name: "Display Box (20ct)", costPerUnit: 0, moq: 5000, leadWeeks: 4 },
    { name: "Labels", costPerUnit: 0, moq: 25000, leadWeeks: 3 },
  ];

  state.fundingSources = state.fundingSources ?? [
    { name: "Founder Equity (sweat + cash)", amount: 100000, type: "equity" },
    { name: "Seed Round (current ask)", amount: 2500000, type: "equity" },
  ];

  return state;
}
