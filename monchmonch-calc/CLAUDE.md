# MonchMonch Calculator — Update Plan

**Date:** April 11, 2026
**Source:** Joe Stein operational feedback
**Target:** https://monchmonch-calc.vercel.app/
**Codebase:** `monchmonch-calc/src/App.jsx` (1,021 lines, single-file Vite+React app)

---

## Executive Summary

Joe raised questions across nine operational areas. After auditing the existing calculator, roughly 40% of his concerns are already modeled (raw material tiers, COGS waterfall, basic channel mix, production scheduling, 5-year P&L) but the remaining 60% — startup costs, MOQ visibility, packaging, channel granularity, per-channel margins, labor detail, financing, and contracts — are either missing entirely or have data in the model that isn't surfaced in the UI. This plan lays out every gap and how to close it.

---

## Current Architecture

The app is a single React component file (`App.jsx`) with four tabs:

| Tab | Name | What It Covers |
|-----|------|----------------|
| 0 | Unit Economics | Raw materials (bars + electrolytes), COGS waterfall by tier, co-man pricing, production costs |
| 1 | Revenue & Channel | SKU pricing (DTC + trade), channel mix slider, fulfillment/freight, growth rates, monthly revenue chart |
| 2 | Production & Inventory | Inventory params, spoilage, OpEx (G&A + marketing), monthly demand, seasonality, bar production schedule |
| 3 | 5-Year P&L | Revenue vs EBITDA chart, full P&L table, unit volume chart |

State lives in a single `useState({ ...DEFAULT })` object. All calculations run through a single `runModel(state)` function.

---

## Gap Analysis & Implementation Plan

### 1. LAUNCH / STARTUP EXPENSES (New Tab or Section)

**Joe's ask:** Kosher factory certification ($10K), clean rooms ($150K), factory inventory minimum (5 tons, $15K).

**What exists:** Nothing. There is no startup capex or one-time expense modeling anywhere in the calculator.

**Plan:**

Add a new **Tab 0: "Launch & Startup"** (shift existing tabs to 1-4) with the following sections:

**a) Pre-Launch Capital Expenses Table**
- Editable rows: item name, cost, timing (month), notes
- Pre-populated defaults:
  - Kosher certification: $10,000 (Month -3)
  - Clean room buildout: $150,000 (Month -6 to -1)
  - Factory inventory minimum: $15,000 / 5 tons (Month -1)
- Allow users to add/remove rows for other startup costs (equipment, legal, branding, etc.)
- Show total startup capital required

**b) Funding Sources**
- Equity raised, debt/loans, existing cash
- Simple waterfall: total startup costs vs. available capital → gap analysis

**c) Pre-Launch Timeline**
- Visual timeline (horizontal bar or Gantt-style) showing when each expense hits
- Cumulative cash outflow curve

**State changes:**
- Add `launchExpenses: [{name, cost, month, notes}]` array to DEFAULT
- Add `fundingSources: [{name, amount, type}]` array

**Model changes:**
- `runModel` gets a `startupCapex` total that feeds into the P&L as a Year 0 / pre-revenue line item
- Year 1 cash flow adjusts for startup spend

**Estimated complexity:** Medium. New tab component (~200 lines), minor model updates.

---

### 2. MINIMUM ORDER QUANTITIES — Surface in UI

**Joe's ask:** What are the minimum orders for bars and stick packs?

**What exists:** MOQ data is already in the DEFAULT state for every raw material (e.g., `moq: 500` for Whey Protein, `moq: 100` for Creatine). The data is stored but **never rendered** in the UI.

**Plan:**

**a) Add MOQ column to raw material tables (Tab 1 → Unit Economics)**
- Add a "MOQ (lbs)" column to both the Bar and Electrolyte RM tables
- Make it editable like the other fields
- Show the dollar value at current tier pricing: `MOQ × $/lb = minimum $ commitment`

**b) Add finished-goods MOQ section**
- New card in Unit Economics: "Minimum Production Runs"
- Inputs: minimum bar run (units), minimum stick pack run (units)
- Calculate: minimum RM purchase required for each run size
- Show: "To produce X bars, you need Y lbs of each material → Z total RM cost"

**c) Add MOQ alerts to Production tab**
- In the monthly production schedule, flag any month where the production order is below the minimum run size
- Visual indicator (red highlight or warning icon)

**State changes:**
- MOQ already exists in state — just surface it
- Add `minBarRun: number` and `minElecRun: number` to DEFAULT

**Model changes:**
- `runModel` adds MOQ constraint check to monthly production logic
- If a month's production order < minimum run, snap up to minimum or flag

**Estimated complexity:** Low-Medium. Mostly UI work + minor model logic.

---

### 3. CO-MANUFACTURER INVENTORY PROGRESSION

**Joe's ask:** How does the inventory pipeline work — raw materials → standing inventory → payment deadlines?

**What exists:** The calculator models end inventory and spoilage but doesn't show the procurement-to-payment lifecycle.

**Plan:**

**Add a "Procurement Pipeline" section to the Production & Inventory tab:**

**a) Lead Time Inputs**
- RM procurement lead time (weeks)
- Co-man production lead time (weeks)
- Payment terms: Net 30/60/90 selector for RM suppliers
- Payment terms: Net 30/60/90 for co-manufacturer
- Deposit requirements (% upfront for co-man runs)

**b) Inventory Stage Visualization**
- Horizontal pipeline diagram showing:
  - Stage 1: RM on order (committed $, not yet received)
  - Stage 2: RM in warehouse (received, holding cost accruing)
  - Stage 3: In production at co-man (WIP)
  - Stage 4: Finished goods in warehouse (sellable inventory)
- Each stage shows: units, dollar value, days in stage

**c) Cash Flow Timeline**
- When cash goes out (RM purchase, co-man deposit, co-man balance)
- When cash comes in (sale → payment collection)
- Cash conversion cycle calculation
- Monthly working capital requirement

**State changes:**
- Add `rmLeadWeeks`, `coManLeadWeeks`, `rmPaymentTerms`, `coManPaymentTerms`, `coManDeposit` to DEFAULT

**Model changes:**
- `runModel` calculates cash outflow timing per month based on lead times and payment terms
- Working capital requirement = RM committed + WIP + FG inventory - payables

**Estimated complexity:** High. New visualization, significant model additions for cash timing.

---

### 4. PACKAGING MINIMUMS

**Joe's ask:** What are the packaging minimums for bars and packs?

**What exists:** Nothing. Packaging costs are not modeled separately — they're implicitly bundled into co-manufacturer pricing.

**Plan:**

**Add a "Packaging" section to Unit Economics tab:**

**a) Packaging Cost Breakdown**
- Bar packaging: wrapper, box/case, labels, inserts
- Stick pack packaging: foil pouch, display box, labels
- Each row: item, cost per unit, minimum order quantity, lead time
- Editable table similar to RM tables

**b) Packaging MOQ Impact**
- Show: minimum packaging order → minimum dollar commitment
- Calculate how many production runs each packaging order covers
- Flag if packaging MOQ forces excess inventory (e.g., must buy 50,000 wrappers but only running 10,000 bars)

**c) Model Integration**
- Add packaging cost as a new COGS line item in the waterfall (currently only RM, Labor, Overhead, Co-Man)
- COGS waterfall becomes: RM + Packaging + Labor + Overhead + Co-Man

**State changes:**
- Add `barPackaging: [{name, costPerUnit, moq, leadWeeks}]` and `elecPackaging: [...]` arrays

**Model changes:**
- `runModel` adds packaging to per-unit COGS calculation
- Waterfall visualization gets a 5th segment

**Estimated complexity:** Medium. New data structures, UI section, waterfall update.

---

### 5. CHANNEL CAPACITY & TIMELINE DETAIL

**Joe's ask:** What's the capacity by sales channel? Big retailers (how long to get in), smaller retailers/vitamin shops/distributors, DTC capacity?

**What exists:** A single DTC/Wholesale slider. No channel breakdown, no timeline modeling, no capacity constraints.

**Plan:**

**Redesign the Revenue & Channel tab with granular channel modeling:**

**a) Replace single slider with multi-channel mix**

Channels to model (each with its own inputs):
| Channel | Key Inputs |
|---------|-----------|
| DTC (website) | Monthly visitor capacity, conversion rate, AOV, CAC, ramp months |
| Amazon/Marketplace | Listing fees, FBA costs, ramp timeline, monthly cap |
| Big Box Retail (e.g., Walmart, Target) | Timeline to shelf (months), slotting fees, velocity requirement, chargebacks, deductions |
| Natural/Specialty (Whole Foods, Sprouts) | Timeline, broker fees, velocity, demo costs |
| Vitamin/Supplement Shops | Minimum order, payment terms, margins |
| Distributors (UNFI, KeHE) | Distribution margin (15-25%), minimum velocity, warehouse fees |

**b) Channel Ramp Timelines**
- Each channel gets a "months to first revenue" input
- Visual timeline showing when each channel comes online
- Monthly revenue builds up as channels activate over time

**c) Channel Capacity Constraints**
- Each channel has a realistic monthly unit capacity ceiling
- Model auto-caps revenue per channel at capacity
- Shows when you hit capacity → need to activate next channel

**d) Update monthly revenue calculation**
- Currently: `totalUnits × dtcPct × MSRP + totalUnits × (1-dtcPct) × trade`
- New: sum of per-channel revenue, each with its own pricing, timing, and capacity

**State changes:**
- Replace `dtcPct` with `channels: [{name, type, pricePer, costsPer, rampMonths, maxMonthlyUnits, active, ...}]`
- Keep backward compatibility by computing blended metrics from channel array

**Model changes:**
- Major refactor of revenue calculation in `runModel`
- Monthly revenue becomes sum of channel contributions with ramp curves
- P&L gets per-channel line items or at least a channel breakdown summary

**Estimated complexity:** High. This is the largest change — redesigns the revenue model fundamentally.

---

### 6. PER-CHANNEL MARGIN ANALYSIS

**Joe's ask:** What are the margins per channel, with pros and cons?

**What exists:** Only a blended ASP and blended gross margin. No per-channel margin visibility.

**Plan:**

This is tightly coupled with #5 above. Once channels are broken out:

**a) Channel Margin Comparison Card**
- Side-by-side cards or table showing for each channel:
  - Gross revenue per unit
  - Deductions (slotting, chargebacks, broker fees, distribution margin)
  - Net revenue per unit
  - COGS per unit (same across channels)
  - Contribution margin per unit
  - Contribution margin %
  - Fulfillment/logistics cost per unit
  - Net margin per unit

**b) Channel Profitability Waterfall**
- Horizontal waterfall chart: gross price → deductions → net revenue → COGS → contribution
- One waterfall per channel, stacked for comparison

**c) Pros/Cons Reference Panel**
- Static but useful: for each channel type, display a brief pros/cons summary
- e.g., "Big Box Retail — Pro: volume, brand credibility. Con: slotting fees ($25K-$100K), velocity requirements, deductions, 60-90 day payment terms"
- This is informational, not calculated — can be a collapsible info card

**State changes:** Included in #5's channel array (each channel carries its own cost structure)

**Model changes:** Included in #5's revenue refactor

**Estimated complexity:** Medium (given #5 is already built). Mostly visualization.

---

### 7. LABOR & SOURCING DETAIL

**Joe's ask:** Labor and sourcing costs — more detail needed.

**What exists:** A single "Direct Labor $/unit" input in Tab 1. No headcount, no role breakdown, no sourcing strategy.

**Plan:**

**a) Expand labor section in Unit Economics or Production tab:**

- Replace single input with a staffing table:
  - Role (production operator, QA, warehouse, management)
  - Headcount
  - Hourly rate or salary
  - Hours per production run
  - Scales with volume (toggle: fixed vs. variable)
- Calculate: total labor cost per unit at different production volumes
- Show how labor cost/unit decreases with scale

**b) Sourcing Section**
- For each raw material, add:
  - Supplier name (optional text field)
  - Lead time (weeks)
  - Payment terms
  - Alternative supplier toggle (single-source risk flag)
- Sourcing summary: total unique suppliers, single-source risks, total RM committed $

**State changes:**
- Add `laborRoles: [{role, headcount, rate, hoursPerRun, isVariable}]`
- Add supplier fields to existing RM objects

**Model changes:**
- Labor cost calculation becomes: sum of (headcount × rate × hours) / units produced
- Replaces flat `laborPerUnit` in COGS calculation

**Estimated complexity:** Medium. New UI section, model refactor for labor calculation.

---

### 8. FINANCING / CAPITAL STRUCTURE

**Joe's ask:** How does financing work for all of this?

**What exists:** Nothing. No capital modeling, no burn rate, no runway calculation.

**Plan:**

**Add a "Financing" section — either in the new Launch tab or as a new Tab 5:**

**a) Capital Requirements Summary**
- Auto-calculated from all other tabs:
  - Startup capex (from #1)
  - Working capital for first X months (from #3 cash conversion cycle)
  - Initial inventory build (from production schedule)
  - Marketing/launch spend
  - Operating runway (months of negative EBITDA × monthly burn)
- Total capital required

**b) Funding Sources**
- Equity rounds: amount, valuation, dilution
- Debt: amount, interest rate, term, monthly payment
- Revenue-based financing
- Grants/other

**c) Runway & Burn Dashboard**
- Monthly cash balance projection (starting capital - cumulative burn + revenue)
- Months to cash-flow positive
- Months of runway remaining
- Break-even analysis: what unit volume makes the business self-sustaining?

**d) Sensitivity Analysis**
- "What if revenue is 20% lower?" → new runway
- "What if COGS are 10% higher?" → new break-even
- Simple toggle or slider for pessimistic/optimistic scenarios

**State changes:**
- Add `startingCash`, `equityRaised`, `debtAmount`, `debtRate`, `debtTerm` to DEFAULT

**Model changes:**
- `runModel` calculates monthly cash balance, runway, break-even month
- P&L tab gets a cash flow section or the P&L table adds interest expense and cash balance rows

**Estimated complexity:** High. New calculations, new visualizations, ties into multiple other sections.

---

### 9. CONTRACTS & COMMITMENTS

**Joe's ask:** What about contracts?

**What exists:** Nothing. No contract or commitment tracking.

**Plan:**

**Add a "Commitments" reference card (lightweight approach):**

This is more informational than calculable. Rather than a full contract management system:

**a) Commitment Summary Card (in Launch or Production tab)**
- Table of key contracts/commitments:
  - Co-manufacturer: minimum volume commitment, term, exclusivity
  - RM suppliers: minimum purchase agreements, price lock periods
  - Retail: slotting fee commitments, velocity guarantees
  - Lease/facility: monthly cost, term
  - Equipment: lease vs. buy, monthly cost
- Each row: counterparty, commitment type, monthly/annual $, term (months), cancellation terms

**b) Integration with P&L**
- Fixed commitments feed into the OpEx section as baseline costs
- Show: "even at zero revenue, your monthly fixed commitments are $X"

**State changes:**
- Add `commitments: [{name, type, monthlyCost, termMonths, notes}]`

**Model changes:**
- Sum of commitment costs feeds into fixed OpEx in `runModel`

**Estimated complexity:** Low-Medium. Mostly a reference table with basic model integration.

---

### 10. ELECTROLYTE PRODUCTION SCHEDULE (Bug Fix)

**Not in Joe's list, but discovered during audit.**

**What exists:** The Production tab shows a full monthly production schedule for **bars only** (lines 790-819). No equivalent table exists for electrolytes despite the model calculating `elecMonthly` data.

**Plan:**
- Duplicate the bar production schedule table for electrolytes
- Same columns: Adj Demand, Production, Units Sold, End Inventory, Spoilage
- Uses `model.elecMonthly` which already exists in `runModel`

**Estimated complexity:** Very Low. Copy-paste of ~30 lines with variable name changes.

---

## Implementation Priority & Sequencing

### Phase 1 — Quick Wins (1-2 days)
| # | Item | Why First |
|---|------|-----------|
| 10 | Electrolyte production schedule | Bug fix, ~30 min, immediately useful |
| 2 | Surface MOQs in UI | Data already exists, just needs rendering |

### Phase 2 — Core Operational Model (3-5 days)
| # | Item | Why Now |
|---|------|---------|
| 1 | Launch/startup expenses | Joe's most concrete numbers ($10K, $150K, $15K) |
| 4 | Packaging minimums | Fills a real gap in COGS modeling |
| 7 | Labor & sourcing detail | Replaces oversimplified single input |

### Phase 3 — Channel Redesign (5-7 days)
| # | Item | Why Together |
|---|------|-------------|
| 5 | Channel capacity & timelines | Largest refactor, redesigns revenue model |
| 6 | Per-channel margin analysis | Depends on #5's channel breakout |

### Phase 4 — Financial Planning (3-5 days)
| # | Item | Why Last |
|---|------|---------|
| 3 | Co-man inventory progression | Needs lead time + payment terms modeling |
| 8 | Financing & capital structure | Needs all cost inputs finalized first |
| 9 | Contracts & commitments | Informational layer on top of everything else |

**Total estimated effort: 12-19 days** (depending on depth of implementation and design polish)

---

## Technical Notes

- **File structure:** Currently a single 1,021-line file. With these additions, the app will grow to ~2,500-3,000 lines. Consider splitting into separate component files per tab before starting Phase 2.
- **Tab count:** Currently 4 tabs. Plan adds 1-2 new tabs (Launch & Startup, possibly Financing). Recommend a scrollable/overflow tab bar if going beyond 5.
- **State object:** Will grow significantly. Consider adding a version number and migration function so saved states from the current version still load correctly.
- **Model function:** `runModel()` is currently ~140 lines. Will roughly double. Consider breaking into sub-functions: `calcCOGS()`, `calcRevenue()`, `calcProduction()`, `calcCashFlow()`.
- **Deployment:** Auto-deploys to Vercel on push. No CI/CD changes needed.
