import { useState } from "react";
import { C } from "../constants.js";
import { glassCard, h3Style, labelStyle } from "../components.jsx";

const sections = [
  {
    id: "overview",
    icon: "🧭",
    title: "How This Calculator Works",
    content: [
      {
        type: "text",
        body: "This calculator models the full operational and financial picture for MonchMonch — from raw material costs through to a 5-year P&L and capital planning. Every input you change recalculates the entire model instantly. There's no save button; the model runs live as you adjust."
      },
      {
        type: "text",
        body: "The six tabs are designed to flow left to right: start with your startup costs, understand your unit economics, set up your channels, plan production, review the P&L, and finally check your capital position. But you can jump to any tab at any time."
      },
      {
        type: "callout",
        color: C.amber,
        body: "Hit \"Reset to Defaults\" in the top-right corner at any time to restore all inputs to their starting values. This is useful when you want to start a fresh scenario."
      },
    ],
  },
  {
    id: "strategic-cost-analysis",
    icon: "🎯",
    title: "Strategic Cost Analysis — Path to $0.10 Fiber (Apr 2026)",
    content: [
      {
        type: "callout",
        color: C.red,
        body: "OPERATIONAL DIRECTIVE: Current cost to produce a single serving of Monch fiber is ~$0.37. Target is $0.10. This is the SOLE strategic cost-reduction target. Protein cost is accepted as market-given context, not a lever. Unless Monch fiber drops to ~$0.10/serving, both the bar/packet 5x retail economics AND the B2B ingredient licensing channel are blocked. This is the defining unit-economics decision for the business."
      },
      { type: "heading", body: "Cost Baseline (April 2026)" },
      {
        type: "text",
        body: "Monch proprietary fiber: $0.37/serving at current small-batch production — this is the target for reduction. Commodity prebiotic fiber (inulin, soluble corn fiber) at plant scale: $0.02–0.03/serving — this is the competitive floor, NOT the target (Monch's 3.3x bioavailability justifies a premium over commodity). Full bar COGS today: $1.59 at 25K run, $1.35 at 100K run. The 5x retail:COGS rule implies bar COGS must land at or below $0.70 to sustain a $3.49 retail price. Protein cost at 15g WPI is $0.36–0.39/serving (2026 spot) — included here as verification context only; it is not a reduction lever."
      },
      { type: "heading", body: "Fiber Cost-Reduction Levers" },
      {
        type: "text",
        body: "Four paths to reduce Monch fiber cost: (1) Reformulate as 50/50 blend with commodity soluble corn fiber (ADM Fibersol-2 or Tate & Lyle Promitor): $0.37 → ~$0.20/serving, but dilutes the bioavailability story. (2) In-house commercial scale-up at 100+ MT/yr: $0.37 → ~$0.18, requires $2–5M capex. (3) Strategic co-development with a major ingredient house (Cargill / Tate & Lyle / ADM / IFF / DSM-Firmenich) at 500+ MT/yr: $0.37 → $0.09–$0.14. (4) Combined strategy (co-dev + selective blending + dual-protein formulation): $0.06–$0.10. Only paths 3 and 4 hit the target."
      },
      { type: "heading", body: "Strategic Co-Development Partners" },
      {
        type: "text",
        body: "Cargill — Oliggo-Fiber inulin platform, scale anchor, Food System Design co-dev model with strong IP protection. Tate & Lyle — Promitor Soluble Corn Fiber, historically the most flexible on co-dev terms. ADM — Fibersol-2 digestion-resistant maltodextrin, strong resistant-starch expertise. IFF (ex-DuPont Nutrition) — premium formulation IP, nimble innovation group. DSM-Firmenich — premium nutrition positioning, willing to pay for differentiated IP. Typical deal shape: 500 MT/yr MOQ (~50M servings annually), 5–7 year term, category exclusivity or equity concession in exchange for aggressive pricing."
      },
      {
        type: "callout",
        color: C.green,
        body: "Recommended path: 3-way parallel RFP (Cargill + Tate & Lyle + IFF). Single-vendor conversations surrender 20–35% of the eventual price compression — strategics reveal their real pricing only when they smell a competitor on the same deal."
      },
      { type: "heading", body: "Why $0.10 Matters Beyond Internal COGS" },
      {
        type: "text",
        body: "The $0.10 target is not only about bar/packet internal unit economics. In food-industry ingredient sales, supplier price is conventionally ~5x production cost. At Monch's current $0.37/serving cost, supplier pricing would land at $1.85/serving — no CPG brand buys fiber at that price. At $0.10 production cost, supplier price becomes $0.50/serving — still ~20x commodity fiber, but defensible because of the 3.3x bioavailability premium. That threshold is what unlocks the B2B ingredient licensing channel flagged as the 'Universal Incorporation' moat: Monch licensed as a functional fiber into other CPG brands' bars, drinks, baked goods, and powders — a second revenue line beyond the Matchbox 7 consumer brand."
      },
      { type: "heading", body: "Product Line Decision (April 2026)" },
      {
        type: "text",
        body: "Year 1 flagship system: Bar + Electrolyte Packet (bundled). Bar drives nutrition/satiety; packet drives hydration + GI support (the #2 GLP-1 side effect) and serves as the attach-rate driver. Packet is thin-margin by design (26% standalone DTC GM) — the business case lives at the bundle level, not the SKU level. Flavor Insights (creators of Muscle Milk) is the GTM/production partner. H1 Year 2: Functional Drink launches as the margin-expansion SKU — structurally stronger 5x economics (water base, cheaper packaging) than the bar. All three products carry Monch fiber; all three benefit directly from the $0.10 fiber-cost target. Factory capacity: 166K servings/month across the product mix."
      },
      { type: "heading", body: "Source References (Apr 2026)" },
      {
        type: "text",
        body: "WPI market pricing: Macau Nutrition 2026 price analysis; Wisconsin Whey food-grade specs; Vivion bulk distribution; CLAL global WPC price index. Pea protein market: Green Circle Capital protein pricing review; PURIS; Jedwards International 80% bulk; Global Resources Direct. Cargill co-development model: IFT Food Technology magazine; Cargill Food & Beverage NA portfolio; Vitafoods Europe 2026 active nutrition concepts; Cargill + ENOUGH partnership case study. Contract manufacturing benchmarks: FinancialModelsLab custom protein bar analysis; CopackConnect U.S. nutrition bar market trends; Element Bars scale economics (25K–1M bars/month capacity range)."
      },
    ],
  },
  {
    id: "launch",
    icon: "🚀",
    title: "Tab 1: Launch & Startup",
    content: [
      {
        type: "text",
        body: "This tab captures every dollar you need to spend before selling a single unit. It answers the question: \"How much capital do we need to get to Day 1?\""
      },
      {
        type: "heading",
        body: "Pre-Launch Capital Expenses"
      },
      {
        type: "text",
        body: "The expenses table lists one-time costs required before launch. Each row has a name, dollar amount, the month it hits (negative numbers mean months before launch — e.g., Month -3 means three months before your first sale), and a notes field. Defaults include the kosher certification ($10K), clean room buildout ($150K), and factory inventory minimum ($15K / 5 tons). Click \"+ Add\" to add your own line items."
      },
      {
        type: "heading",
        body: "Funding Sources"
      },
      {
        type: "text",
        body: "Lists where the startup capital is coming from — founder equity, angel investment, grants, etc. The model compares total startup costs against total funding and shows a gap or surplus at the top of the tab. If you see a red \"Funding Gap\" card, you need more capital."
      },
      {
        type: "heading",
        body: "Pre-Launch Timeline"
      },
      {
        type: "text",
        body: "The visual timeline shows when each expense hits relative to launch. This helps you plan cash outflows — you'll need the clean room money 6 months out, but the factory inventory minimum isn't due until Month -1."
      },
      {
        type: "heading",
        body: "Commitments"
      },
      {
        type: "text",
        body: "Ongoing contractual obligations like your warehouse lease, equipment lease, and co-manufacturer minimums. These are monthly recurring costs that show up in the P&L regardless of how many units you sell. The \"Monthly Commitments\" metric card at the top shows the total fixed burn from these contracts."
      },
    ],
  },
  {
    id: "unit-econ",
    icon: "⚙️",
    title: "Tab 2: Unit Economics",
    content: [
      {
        type: "text",
        body: "This is the most detailed tab. It answers: \"What does it cost to make one bar and one electrolyte stick pack?\" Every cost rolls up into the COGS (Cost of Goods Sold) waterfall."
      },
      {
        type: "heading",
        body: "Raw Materials Tables"
      },
      {
        type: "text",
        body: "Two side-by-side tables — one for bars, one for electrolytes. Each row is a raw material with:"
      },
      {
        type: "list",
        items: [
          "Qty/Unit — how many pounds of this material go into one finished unit",
          "$/lb T1, T2, T3 — the per-pound cost at three volume tiers (T1 = small orders, T3 = bulk). Use the tier buttons above the table to toggle which pricing tier is used in the Cost/Unit calculation",
          "MOQ (lbs) — the minimum order quantity from the supplier in pounds. This is the smallest amount you can buy",
          "MOQ $ — automatically calculated: MOQ × T1 price. Shows the minimum dollar commitment for each material",
          "Cost/Unit — automatically calculated: Qty × $/lb at the selected tier. This is what each material contributes to your per-unit COGS",
        ],
      },
      {
        type: "callout",
        color: C.cyan,
        body: "The MOQ column is critical for cash planning. Even if you only need 50 lbs of Konjac Gum for your first run, if the MOQ is 50 lbs, that's a $333 minimum purchase at T1 pricing. For packaging materials like wrappers (MOQ: 5,000 units), that's $400 minimum just for one component."
      },
      {
        type: "heading",
        body: "COGS Waterfall"
      },
      {
        type: "text",
        body: "The waterfall shows the all-in cost to produce one unit at each of the seven production volume tiers. Each bar in the waterfall is broken into four color-coded segments:"
      },
      {
        type: "list",
        items: [
          "Purple (Raw Materials) — sum of all ingredient and packaging costs",
          "Violet (Labor) — direct production labor per unit",
          "Amber (Overhead) — fixed overhead and equipment amortization spread across units",
          "Orange (Co-Man) — the co-manufacturer's fee per unit",
        ],
      },
      {
        type: "text",
        body: "As volume increases, per-unit costs drop because fixed overhead gets spread across more units and co-manufacturer pricing falls at higher tiers. This is the core scale economics of the business."
      },
      {
        type: "heading",
        body: "Co-Manufacturer Pricing"
      },
      {
        type: "text",
        body: "Seven editable tiers from 1–999 units up to 5M+. This is the fee your co-manufacturer charges per unit on top of your raw material costs. The model automatically selects the appropriate tier based on your Year 1 production volume."
      },
      {
        type: "heading",
        body: "Production Costs"
      },
      {
        type: "text",
        body: "Direct labor ($/unit), fixed monthly overhead, and equipment amortization. The labor table breaks down by role with headcount, hourly rate, and hours per production run. Fixed vs. variable toggle determines whether a role's cost scales with volume."
      },
      {
        type: "heading",
        body: "Packaging"
      },
      {
        type: "text",
        body: "Separate packaging cost tables for bars and electrolytes. Each component (wrapper, box, labels, inserts) has a per-unit cost, MOQ, and lead time in weeks. The MOQ here is important: if the wrapper minimum is 50,000 units but you're only running 10,000 bars, you're buying 5 runs' worth of wrappers upfront."
      },
      {
        type: "heading",
        body: "Minimum Production Runs"
      },
      {
        type: "text",
        body: "The minimum number of units you must produce in a single run (default: 5,000 bars, 10,000 electrolytes). If a month's demand is below this minimum, the production schedule will either snap up to the minimum run size or skip production and serve from inventory."
      },
    ],
  },
  {
    id: "revenue",
    icon: "💰",
    title: "Tab 3: Revenue & Channel",
    content: [
      {
        type: "text",
        body: "This tab models where you sell and how much you make per unit in each channel. It answers: \"What's the revenue mix, and what does each channel actually net us after costs?\""
      },
      {
        type: "heading",
        body: "Channel Mix Table"
      },
      {
        type: "text",
        body: "Six pre-configured channels, each with its own economics:"
      },
      {
        type: "list",
        items: [
          "Active — toggle to include/exclude a channel from the model. Big Box Retail is off by default because it takes 12+ months to get on shelf",
          "% Alloc — what percentage of your total units flow through this channel. Active channels should sum to 100% (a warning appears if they don't; the model normalizes automatically)",
          "Bar $/unit & Elec $/unit — the net revenue you receive per unit in this channel (after retailer margin, distribution fees, etc.)",
          "Cost/unit — channel-specific costs like fulfillment, FBA fees, slotting, broker fees",
          "Ramp (mo) — how many months from today until this channel starts generating revenue. DTC = 0 (immediate), Big Box = 12 months",
          "Max/mo — the monthly unit capacity ceiling for this channel. Once you hit it, excess demand doesn't flow through",
        ],
      },
      {
        type: "callout",
        color: C.green,
        body: "Look at the Y1 Rev column on the right side of the table. This shows each channel's projected Year 1 revenue after accounting for ramp time and capacity limits. If a channel shows $0 and it's active, the ramp period hasn't ended within Year 1."
      },
      {
        type: "heading",
        body: "Channel Margin Comparison"
      },
      {
        type: "text",
        body: "Below the mix table, you'll see a side-by-side margin analysis. For each active channel it shows gross revenue per unit, channel costs, COGS, and the resulting contribution margin. This is how you decide which channels are worth the effort — DTC has the highest margin but the highest CAC, distributors have thin margins but access to thousands of doors."
      },
      {
        type: "heading",
        body: "Pros & Cons Cards"
      },
      {
        type: "text",
        body: "Each channel has a collapsible info card with practical pros and cons. These aren't calculated — they're reference material to help you think about tradeoffs when setting your channel mix."
      },
      {
        type: "heading",
        body: "Growth Rates & Monthly Revenue"
      },
      {
        type: "text",
        body: "Year-over-year growth sliders (Year 2 through Year 5) and a monthly revenue chart showing the ramp through Year 1. The default Y2 growth of 150% means Year 2 revenue is 2.5× Year 1. Adjust these based on your fundraising plan and market assumptions."
      },
    ],
  },
  {
    id: "production",
    icon: "🏭",
    title: "Tab 4: Production & Inventory",
    content: [
      {
        type: "text",
        body: "This tab models the physical operation: how much to produce each month, how much inventory to hold, and what it costs to store it. It answers: \"What's the production schedule and what are the carrying costs?\""
      },
      {
        type: "heading",
        body: "Inventory Parameters"
      },
      {
        type: "list",
        items: [
          "Target Days of Inventory (DOI) — how many days of demand you want on hand. Higher = safer but more cash tied up. 30 days is a common starting point",
          "Safety Stock % — extra buffer above target DOI. At 15%, if you need 1,000 units of base inventory, you'll hold 1,150",
          "Warehousing $/unit/mo — what it costs to store one unit per month",
          "Insurance % of Inventory Value — annual insurance as a percentage of average inventory value",
          "Cost of Capital % — the opportunity cost of cash tied up in inventory. At 8%, $100K of inventory \"costs\" $8K/year in foregone returns",
        ],
      },
      {
        type: "heading",
        body: "Spoilage & Cost Drivers"
      },
      {
        type: "text",
        body: "Spoilage rates are per month — at 0.5%/month for bars, you'll lose about 6% of bar inventory per year. The Spoilage Cost Multiplier sets the financial impact: at 1×, spoiled units cost you their COGS. At 3× (the default), it accounts for the fully loaded cost of disposal, replacement production, and lost opportunity."
      },
      {
        type: "heading",
        body: "Monthly Base Demand"
      },
      {
        type: "text",
        body: "Twelve monthly inputs for each product. This is your demand forecast before seasonality adjustments. The defaults ramp from 500 bars in January to 5,000 in December, reflecting a launch-year growth curve. Adjust these to match your sales plan."
      },
      {
        type: "heading",
        body: "Seasonality Indices"
      },
      {
        type: "text",
        body: "Sliders that multiply each month's base demand. A value of 1.00 means normal, 1.20 means 20% above base, 0.85 means 15% below. Bars default to higher demand in winter (protein snacking) while electrolytes peak in summer (hydration). The average across all 12 months should be close to 1.00."
      },
      {
        type: "heading",
        body: "Production Schedule Tables"
      },
      {
        type: "text",
        body: "Monthly tables for both bars and electrolytes showing five rows:"
      },
      {
        type: "list",
        items: [
          "Adj Demand — base demand × seasonality index. This is what you need to sell",
          "Production — how many units to manufacture, accounting for inventory targets and minimum run sizes",
          "Units Sold — actual units shipped (demand-constrained if inventory runs low)",
          "End Inventory — units on hand at month end",
          "Spoilage — units lost to expiration/damage",
        ],
      },
      {
        type: "callout",
        color: C.amber,
        body: "Watch for months where Production is much larger than Adj Demand. This means you're building inventory ahead of a demand ramp or the minimum run size is forcing you to produce more than you need. That excess ties up cash."
      },
      {
        type: "heading",
        body: "Procurement Pipeline"
      },
      {
        type: "text",
        body: "Shows the inventory lifecycle from purchase order to finished goods. Key inputs: RM lead time (weeks to receive raw materials), co-man lead time (weeks in production), payment terms for both (Net 30/60/90), and co-man deposit percentage. The pipeline visualization shows cash committed at each stage, helping you understand working capital requirements."
      },
    ],
  },
  {
    id: "pl",
    icon: "📊",
    title: "Tab 5: 5-Year P&L",
    content: [
      {
        type: "text",
        body: "Everything from the other tabs rolls up into this P&L. It's read-only — you change the inputs elsewhere, and this tab shows the financial output."
      },
      {
        type: "heading",
        body: "Key Metrics"
      },
      {
        type: "list",
        items: [
          "Y5 Revenue — where the topline lands in Year 5 based on your growth rates",
          "Y5 Gross Margin — revenue minus COGS as a percentage. For CPG, 40-60% is healthy; below 30% is tight",
          "Y5 EBITDA — earnings before interest, tax, depreciation, and amortization. This is your operating profitability",
          "Cumulative EBITDA — total EBITDA across all 5 years. If this is negative, the business hasn't earned back its operating costs within the projection period",
        ],
      },
      {
        type: "heading",
        body: "P&L Table"
      },
      {
        type: "text",
        body: "A standard income statement laid out year by year. Reading top to bottom:"
      },
      {
        type: "list",
        items: [
          "Net Revenue — total revenue across all channels after returns and allowances",
          "COGS — raw materials + labor + overhead + co-manufacturer + packaging",
          "Gross Profit & Margin — revenue minus COGS. This is your product-level profitability",
          "Channel Costs — fulfillment, freight, slotting fees, broker fees by channel",
          "Fixed Overhead, Marketing, G&A — operating expenses that don't scale linearly with units",
          "Carrying Costs — warehousing, insurance, cost of capital on inventory",
          "Spoilage — financial impact of expired/damaged inventory",
          "Commitments — lease and contract obligations",
          "Debt Service — loan payments if you have debt financing",
          "EBITDA — what's left after all operating expenses",
          "Cash Balance — running cash position accounting for all inflows and outflows",
        ],
      },
      {
        type: "callout",
        color: C.green,
        body: "Green numbers are good (profitable), red means losses. Watch for the year where EBITDA flips from red to green — that's your operating break-even year."
      },
      {
        type: "heading",
        body: "Charts"
      },
      {
        type: "text",
        body: "The Revenue vs EBITDA chart gives you a visual on when profitability kicks in. The Unit Volume chart below shows the growth trajectory split between bars and electrolytes."
      },
    ],
  },
  {
    id: "financing",
    icon: "🏦",
    title: "Tab 6: Financing & Capital",
    content: [
      {
        type: "text",
        body: "This tab answers: \"Do we have enough money, and when do we run out?\" It pulls data from every other tab to calculate total capital requirements."
      },
      {
        type: "heading",
        body: "Key Metrics"
      },
      {
        type: "list",
        items: [
          "Total Capital Needed — startup costs + peak working capital + 6 months of operating runway (if you're burning cash in Year 1)",
          "Capital Available — starting cash + equity raised + debt",
          "Funding Gap / Surplus — the difference. Red means you need more money",
          "Break-Even — the month when the business becomes cash-flow positive. If it says N/A, you don't break even within 5 years",
        ],
      },
      {
        type: "heading",
        body: "Capital Sources"
      },
      {
        type: "text",
        body: "Three categories: starting cash (money in the bank today), equity raised (investment capital), and debt financing. For debt, you set the loan amount, interest rate, and term in months. The model calculates your monthly payment and total interest cost."
      },
      {
        type: "heading",
        body: "Cash Projection"
      },
      {
        type: "text",
        body: "A 60-month (5-year) chart showing your projected cash balance. This starts with your total capital, subtracts startup costs, and then adds/subtracts monthly EBITDA. The point where the curve stops falling and starts rising is your cash inflection point. If the curve hits zero, you're out of money."
      },
      {
        type: "heading",
        body: "Working Capital"
      },
      {
        type: "text",
        body: "Monthly working capital requirements showing how much cash is tied up in inventory and receivables at any given time. The peak working capital month is usually the month before your biggest sales month — you've bought the inventory but haven't collected the revenue yet."
      },
      {
        type: "heading",
        body: "Investor Returns"
      },
      {
        type: "text",
        body: "A simple exit analysis: given an entry equity amount at a certain valuation, and a hold period, what do investors get back at various exit multiples? The three scenarios (conservative, base, optimistic) help frame the risk/return conversation with potential investors."
      },
    ],
  },
  {
    id: "scenarios",
    icon: "🎯",
    title: "Running Scenarios",
    content: [
      {
        type: "text",
        body: "The real power of this calculator is scenario analysis. Here are the key levers to pull:"
      },
      {
        type: "heading",
        body: "\"What if our COGS are higher?\""
      },
      {
        type: "text",
        body: "Go to Unit Economics → increase raw material prices or co-manufacturer rates. Watch the P&L gross margin respond instantly."
      },
      {
        type: "heading",
        body: "\"What if we can't get into retail for 18 months?\""
      },
      {
        type: "text",
        body: "Go to Revenue & Channel → set Big Box Retail and Natural/Specialty to inactive, or increase their ramp months. Shift allocation to DTC and Amazon. Check the P&L and Financing tabs to see if you can survive on DTC-only revenue."
      },
      {
        type: "heading",
        body: "\"What if demand is 50% lower than projected?\""
      },
      {
        type: "text",
        body: "Go to Production → cut all monthly demand numbers in half. Then check Financing → does your runway hold? How many months until break-even?"
      },
      {
        type: "heading",
        body: "\"What's the minimum we need to raise?\""
      },
      {
        type: "text",
        body: "Go to Financing → lower equity raised until the Funding Gap appears. That gap amount is your minimum raise. Add a buffer of 20-30% because assumptions are always optimistic."
      },
      {
        type: "heading",
        body: "\"What if we negotiate better co-man pricing?\""
      },
      {
        type: "text",
        body: "Go to Unit Economics → adjust co-manufacturer pricing at your expected operating tier. Even a $0.05/unit improvement flows straight to gross margin across your entire production volume."
      },
    ],
  },
  {
    id: "glossary",
    icon: "📖",
    title: "Glossary",
    content: [
      {
        type: "term",
        term: "ASP (Average Selling Price)",
        def: "Net revenue divided by total units sold. Blended across all channels.",
      },
      {
        type: "term",
        term: "COGS (Cost of Goods Sold)",
        def: "Everything it costs to make one unit: raw materials, packaging, labor, overhead, and co-manufacturer fees.",
      },
      {
        type: "term",
        term: "Co-Manufacturer (Co-Man)",
        def: "A third-party facility that produces your product. You supply the formula and materials; they run the production line.",
      },
      {
        type: "term",
        term: "Contribution Margin",
        def: "Revenue per unit minus all variable costs (COGS + channel costs). Shows how much each unit contributes to covering fixed costs.",
      },
      {
        type: "term",
        term: "DOI (Days of Inventory)",
        def: "How many days of sales your current inventory could cover. 30 DOI = one month of stock.",
      },
      {
        type: "term",
        term: "DTC (Direct to Consumer)",
        def: "Selling directly to customers through your own website. Highest margin, but you handle fulfillment and pay for customer acquisition.",
      },
      {
        type: "term",
        term: "EBITDA",
        def: "Earnings Before Interest, Taxes, Depreciation, and Amortization. The standard measure of operating profitability.",
      },
      {
        type: "term",
        term: "FBA (Fulfillment by Amazon)",
        def: "Amazon stores, packs, and ships your product. Convenient but expensive — typically 15% referral fee plus fulfillment fees.",
      },
      {
        type: "term",
        term: "Gross Margin",
        def: "Gross profit as a percentage of revenue. (Revenue - COGS) / Revenue. For CPG food products, 40-60% is healthy.",
      },
      {
        type: "term",
        term: "MOQ (Minimum Order Quantity)",
        def: "The smallest amount a supplier will sell you. Applies to both raw materials (in lbs) and packaging (in units).",
      },
      {
        type: "term",
        term: "Safety Stock",
        def: "Extra inventory held above your target to guard against demand spikes or supply delays. Expressed as a % of target inventory.",
      },
      {
        type: "term",
        term: "Seasonality Index",
        def: "A multiplier applied to base demand each month. 1.0 = normal, 1.2 = 20% above normal, 0.8 = 20% below.",
      },
      {
        type: "term",
        term: "Slotting Fee",
        def: "A one-time fee paid to a retailer for shelf space. Common in big box retail; can range from $25K to $100K per SKU per chain.",
      },
      {
        type: "term",
        term: "Tier (T1/T2/T3)",
        def: "Volume-based pricing levels for raw materials. T1 = smallest order (most expensive per unit), T3 = bulk order (cheapest).",
      },
      {
        type: "term",
        term: "Working Capital",
        def: "Cash tied up in day-to-day operations: inventory you've bought but not sold, revenue you've earned but not collected.",
      },
    ],
  },
];

function GuideSection({ section, isOpen, onToggle }) {
  return (
    <div style={{ ...glassCard, marginBottom: 8, padding: 0, overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "16px 20px", border: "none", background: "transparent",
          cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        }}
      >
        <span style={{ fontSize: 20 }}>{section.icon}</span>
        <span style={{ flex: 1, color: C.text, fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>{section.title}</span>
        <span style={{
          color: C.textMuted, fontSize: 18, fontWeight: 300,
          transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
        }}>+</span>
      </button>
      {isOpen && (
        <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}22` }}>
          {section.content.map((block, i) => {
            if (block.type === "text") {
              return <p key={i} style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.7, margin: "12px 0 0" }}>{block.body}</p>;
            }
            if (block.type === "heading") {
              return <h4 key={i} style={{ color: C.text, fontSize: 13, fontWeight: 700, margin: "18px 0 0", paddingTop: 12, borderTop: `1px solid ${C.border}22` }}>{block.body}</h4>;
            }
            if (block.type === "callout") {
              return (
                <div key={i} style={{
                  margin: "14px 0 0", padding: "10px 14px", borderRadius: 8,
                  background: `${block.color}10`, border: `1px solid ${block.color}25`,
                }}>
                  <p style={{ color: block.color, fontSize: 12, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{block.body}</p>
                </div>
              );
            }
            if (block.type === "list") {
              return (
                <ul key={i} style={{ margin: "10px 0 0", paddingLeft: 20 }}>
                  {block.items.map((item, j) => {
                    const dash = item.indexOf(" — ");
                    return (
                      <li key={j} style={{ color: C.textMuted, fontSize: 12, lineHeight: 1.7, marginBottom: 4 }}>
                        {dash > -1 ? (
                          <>
                            <span style={{ color: C.text, fontWeight: 600 }}>{item.slice(0, dash)}</span>
                            <span>{item.slice(dash)}</span>
                          </>
                        ) : item}
                      </li>
                    );
                  })}
                </ul>
              );
            }
            if (block.type === "term") {
              return (
                <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}15` }}>
                  <div style={{ color: C.purple, fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{block.term}</div>
                  <div style={{ color: C.textMuted, fontSize: 12, lineHeight: 1.6 }}>{block.def}</div>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

export default function GuideTab() {
  const [openSections, setOpenSections] = useState(new Set(["overview"]));

  const toggle = (id) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenSections(new Set(sections.map((s) => s.id)));
  const collapseAll = () => setOpenSections(new Set());

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ color: C.text, fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>User Guide</h2>
          <p style={{ color: C.textMuted, fontSize: 12, margin: "4px 0 0" }}>
            Everything you need to understand and operate the MonchMonch Financial Model
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={expandAll} style={{
            padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
            background: "transparent", color: C.textMuted, fontSize: 11, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Expand All
          </button>
          <button onClick={collapseAll} style={{
            padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
            background: "transparent", color: C.textMuted, fontSize: 11, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Collapse All
          </button>
        </div>
      </div>

      {sections.map((section) => (
        <GuideSection
          key={section.id}
          section={section}
          isOpen={openSections.has(section.id)}
          onToggle={() => toggle(section.id)}
        />
      ))}
    </div>
  );
}
