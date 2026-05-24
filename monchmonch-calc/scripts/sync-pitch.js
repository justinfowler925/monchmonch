/**
 * sync-pitch.js — drive pitch HTML financial values from calc model output.
 *
 * Usage:
 *   node scripts/sync-pitch.js              # writes pitch HTML in place
 *   node scripts/sync-pitch.js --dry-run    # print diff summary, don't write
 *   node scripts/sync-pitch.js --check      # exit 1 if pitch out of sync
 *
 * How it works:
 *   1. Imports runModel + DEFAULT from the live calc
 *   2. Computes a dictionary of {MARKER_KEY: formatted_value}
 *   3. Reads pitch HTML, walks every <!--M:KEY-->...<!--/M--> marker
 *   4. Replaces marker contents with current value
 *   5. Writes pitch HTML back
 *
 * The pitch HTML must have marker comments wrapping every dynamic value:
 *   <!--M:Y1_TOT_REV-->$281K<!--/M-->
 *   <!--M:Y5_EBITDA-->+$9.85M<!--/M-->
 *
 * Unknown markers (key not in the dictionary) are logged as warnings but
 * left untouched, so this script is safe to run against partially-instrumented
 * HTML.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { runModel } from "../src/model.js";
import { DEFAULT } from "../src/constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PITCH_HTML = path.resolve(__dirname, "../../../Monch Bars/matchbox7-pitch-site/index.html");

// === FORMATTERS ===

// Format millions: 2 decimals, but strip trailing zeros.
// $1.5M (not $1.50M), $22M (not $22.0M), $9.85M (keep both decimals when meaningful).
const formatM = (abs) => {
  const s = (abs / 1e6).toFixed(2);
  return s.replace(/\.?0+$/, ""); // "22.00" → "22", "1.50" → "1.5", "9.85" → "9.85"
};

const $ = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e6) return `${sign}$${formatM(abs)}M`;
  if (abs >= 1000) return `${sign}$${Math.round(abs / 1000)}K`;
  return `${sign}$${Math.round(abs)}`;
};

// Signed: explicit + or - prefix (for EBITDA, cash flow)
const $signed = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  const sign = n < 0 ? "-" : "+";
  const abs = Math.abs(n);
  if (abs >= 1e6) return `${sign}$${formatM(abs)}M`;
  if (abs >= 1000) return `${sign}$${Math.round(abs / 1000)}K`;
  return `${sign}$${Math.round(abs)}`;
};

// Composite formatter: "Year N, Month M" or "Year N (Month M)"
const yearMonth = (yearN, monthN) => `Year ${yearN}, Month ${monthN}`;
const yearMonthParen = (yearN, monthN) => `Year ${yearN} (Month ${monthN})`;

const pct = (n, decimals = 0) => `${(n * 100).toFixed(decimals)}%`;
const intN = (n) => Math.round(n).toLocaleString();
const moN = (n) => (n == null ? "n/a" : `Month ${n}`);

// === BUILD MARKER DICTIONARY ===

function buildMarkers(model) {
  const m = {};
  const y = model.years;

  // Per-year financials (Y1-Y5)
  y.forEach((yr, i) => {
    const n = i + 1;
    m[`Y${n}_BARS_REV`] = $(yr.barsRev);
    m[`Y${n}_LIC_REV`] = i === 0 ? "—" : $(yr.licensingRev);
    m[`Y${n}_TOT_REV`] = $(yr.netRev);
    m[`Y${n}_COGS`] = $(yr.totalCOGS);
    m[`Y${n}_GP`] = $(yr.grossProfit);
    m[`Y${n}_GM`] = pct(yr.grossMargin);
    m[`Y${n}_EBITDA`] = $signed(yr.ebitda);
    m[`Y${n}_EBITDA_MARGIN`] = pct(yr.ebitdaMargin);
    m[`Y${n}_CFO`] = $signed(yr.cashFromOps);
    m[`Y${n}_CASH`] = $(yr.cashBalance);
    m[`Y${n}_CUM_EBITDA`] = $signed(yr.cumEBITDA);
    m[`Y${n}_CHANNEL_COSTS`] = $(yr.channelCosts);
    m[`Y${n}_MARKETING`] = $(yr.marketing);
    m[`Y${n}_PAYROLL`] = $(yr.payroll);
    m[`Y${n}_BDSALES`] = i === 0 ? "—" : $(yr.bdSales);
    m[`Y${n}_CLINICAL`] = $(yr.clinical);
    m[`Y${n}_GNA`] = $(yr.gna);
    m[`Y${n}_FIXED_OH`] = $(yr.fixedOH);
    m[`Y${n}_TOT_OPEX`] = $(yr.totalOpex);
    m[`Y${n}_BAR_UNITS`] = intN(yr.barUnits);
    m[`Y${n}_ELEC_UNITS`] = intN(yr.elecUnits);
    m[`Y${n}_TOT_UNITS`] = intN(yr.totalUnits);
  });

  // Headline metrics
  const minCash = Math.min(...y.map((yr) => yr.cashBalance));
  const troughYear = y.findIndex((yr) => yr.cashBalance === minCash) + 1;
  m.MIN_CASH = $(minCash);
  m.TROUGH_YEAR = `Y${troughYear}`;
  m.Y5_CASH = $(y[4].cashBalance);
  m.Y5_EBITDA_MARGIN = pct(y[4].ebitdaMargin);

  // Breakeven
  m.SY_BREAKEVEN_MO = moN(model.breakEvenMonth);
  m.CUM_BREAKEVEN_MO = moN(model.cumulativeBreakEvenMonth);
  // Cum loss to breakeven = the DEEPEST cumulative loss (lowest cumEBITDA before recovery).
  // For current model: Y1 -$616K → Y2 -$1.4M (trough) → Y3 -$800K (recovering) → Y4 +$2.7M.
  // Answer is $1.4M, not Y3's -$800K.
  const deepestCumLoss = Math.abs(Math.min(...y.map((yr) => yr.cumEBITDA)));
  m.CUM_LOSS_BREAKEVEN = $(deepestCumLoss);

  // Capital
  m.TOTAL_RAISE = $(DEFAULT.startingCash + DEFAULT.equityRaised);
  m.SEED_AMOUNT = $(DEFAULT.equityRaised);
  m.FOUNDER_EQUITY = $(DEFAULT.startingCash);

  // COGS waterfall (bar tiers 0-6)
  model.barCOGS.forEach((c, i) => {
    m[`BAR_COGS_T${i + 1}`] = `$${c.total.toFixed(2)}`;
  });
  model.elecCOGS.forEach((c, i) => {
    m[`ELEC_COGS_T${i + 1}`] = `$${c.total.toFixed(2)}`;
  });

  // Working capital
  m.AR_DAYS = `${DEFAULT.arDays} days`;
  m.INV_DAYS = `${DEFAULT.inventoryDays} days`;
  m.AP_DAYS = `${DEFAULT.apDays} days`;
  m.CCC_DAYS = `${DEFAULT.arDays + DEFAULT.inventoryDays - DEFAULT.apDays} days`;

  // Cumulative-by-year OpEx (for capital raise breakdown)
  // Marketing Y1-Y4 cumulative
  const cumMktY1Y4 = y.slice(0, 4).reduce((a, yr) => a + yr.marketing, 0);
  const cumPayY1Y3 = y.slice(0, 3).reduce((a, yr) => a + yr.payroll, 0);
  const cumBdY1Y2 = y.slice(0, 2).reduce((a, yr) => a + yr.bdSales, 0);
  const cumClinY1Y2 = y.slice(0, 2).reduce((a, yr) => a + yr.clinical, 0);
  m.CUM_MKT_Y1Y4 = $(cumMktY1Y4);
  m.CUM_PAY_Y1Y3 = $(cumPayY1Y3);
  m.CUM_BD_Y1Y2 = $(cumBdY1Y2);
  m.CUM_CLIN_Y1Y2 = $(cumClinY1Y2);

  // === ALIASES (same value at multiple keys to handle table/chart/card variants) ===
  // Chart bar labels
  for (let i = 1; i <= 5; i++) {
    m[`Y${i}_EBITDA_CHART`] = m[`Y${i}_EBITDA`];
    m[`Y${i}_TOT_REV_CHART`] = m[`Y${i}_TOT_REV`];
  }
  // The last chart bar uses a slightly different format (Y5 currently labeled "$22M" not "$22.00M")
  m.Y5_TOT_REV_CHART_LABEL = m.Y5_TOT_REV; // sync uses same format

  // Table-row variants
  for (let i = 1; i <= 5; i++) {
    m[`Y${i}_EBITDA_TABLE`] = m[`Y${i}_EBITDA`];
  }

  // Fin-card variants
  m.Y5_TOT_REV_CARD = m.Y5_TOT_REV;
  m.Y5_EBITDA_CARD = m.Y5_EBITDA;
  m.Y5_CASH_CARD = m.Y5_CASH;
  m.CUM_LOSS_CARD = m.CUM_LOSS_BREAKEVEN;

  // Composite breakeven labels
  // SY_BREAKEVEN_MO is "Month 25"; SY_BREAKEVEN_LABEL is "Year 3 (Month 25)" for caption use
  const syBeMo = model.breakEvenMonth;
  const cumBeMo = model.cumulativeBreakEvenMonth;
  const syYear = syBeMo ? Math.ceil(syBeMo / 12) : "n/a";
  const cumYear = cumBeMo ? Math.ceil(cumBeMo / 12) : "n/a";
  m.SY_BREAKEVEN_LABEL = syBeMo ? yearMonthParen(syYear, syBeMo) : "n/a";
  m.CUM_BREAKEVEN_LABEL = cumBeMo ? yearMonthParen(cumYear, cumBeMo) : "n/a";
  m.SY_BREAKEVEN_TABLE = syBeMo ? yearMonth(syYear, syBeMo) : "n/a";
  m.CUM_BREAKEVEN_TABLE = cumBeMo ? yearMonth(cumYear, cumBeMo) : "n/a";
  m.BREAKEVEN_LABEL_CARD = `M${syBeMo} / M${cumBeMo}`;

  // Min cash + Y5 cash caption variants
  m.MIN_CASH_CAPTION = m.MIN_CASH;
  m.Y5_CASH_CAPTION = m.Y5_CASH;
  m.MIN_CASH_TABLE = `${m.MIN_CASH} end of ${m.TROUGH_YEAR}`;

  // Cumulative loss table variant
  m.CUM_LOSS_BREAKEVEN_TABLE = m.CUM_LOSS_BREAKEVEN;

  // Capital raise composites
  m.TOTAL_RAISE_HEADLINE = m.SEED_AMOUNT; // headline shows seed only ($2.5M)
  m.SEED_AMOUNT_HEADLINE = `${m.SEED_AMOUNT} Seed`;

  return m;
}

// === MARKER REPLACEMENT ===

const MARKER_RE = /<!--M:([A-Z0-9_]+)-->([\s\S]*?)<!--\/M-->/g;

function syncHtml(html, markers) {
  let replaced = 0;
  let unchanged = 0;
  const unknown = [];
  const changes = [];

  const next = html.replace(MARKER_RE, (full, key, current) => {
    const newVal = markers[key];
    if (newVal === undefined) {
      unknown.push(key);
      return full;
    }
    if (newVal === current) {
      unchanged++;
      return full;
    }
    replaced++;
    changes.push({ key, from: current, to: newVal });
    return `<!--M:${key}-->${newVal}<!--/M-->`;
  });

  return { html: next, replaced, unchanged, unknown, changes };
}

// === MAIN ===

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const checkMode = args.includes("--check");

  const model = runModel(DEFAULT);
  const markers = buildMarkers(model);

  const html = fs.readFileSync(PITCH_HTML, "utf8");
  const { html: nextHtml, replaced, unchanged, unknown, changes } = syncHtml(html, markers);

  console.log(`\n=== sync-pitch.js ===`);
  console.log(`Pitch: ${PITCH_HTML}`);
  console.log(`Markers: ${Object.keys(markers).length} defined`);
  console.log(`Total markers in pitch: ${replaced + unchanged}`);
  console.log(`  ✓ ${unchanged} unchanged`);
  console.log(`  ↻ ${replaced} need update`);
  if (unknown.length > 0) {
    console.log(`  ⚠ ${unknown.length} unknown markers (left untouched):`);
    [...new Set(unknown)].forEach((k) => console.log(`      <!--M:${k}-->`));
  }

  if (changes.length > 0) {
    console.log(`\nChanges:`);
    changes.forEach(({ key, from, to }) => {
      console.log(`  ${key}: "${from}" → "${to}"`);
    });
  }

  if (checkMode) {
    if (replaced > 0) {
      console.log(`\n❌ Pitch out of sync (${replaced} markers need update). Run without --check to fix.`);
      process.exit(1);
    } else {
      console.log(`\n✓ Pitch in sync with calc model.`);
      process.exit(0);
    }
  }

  if (dryRun) {
    console.log(`\n[DRY RUN] Would write ${replaced} changes. Run without --dry-run to apply.`);
    return;
  }

  if (replaced > 0) {
    fs.writeFileSync(PITCH_HTML, nextHtml);
    console.log(`\n✓ Wrote ${replaced} updates to pitch HTML.`);
  } else {
    console.log(`\n✓ Pitch already in sync. No changes written.`);
  }
}

main();
