# Calc ↔ Spreadsheet Sync Workflow

The Monch financial model lives in two places, and they must stay synchronized.

## The two artifacts

| Artifact | Path / URL | Purpose |
|---|---|---|
| **Live calc (canonical)** | `src/` in this repo → https://monchmonch-calc.vercel.app/ | Interactive React app investors can edit live to run scenarios. Source of truth for current numbers. |
| **Auditable spreadsheet** | `../Monch Bars/matchbox7-pitch-site/monchmonch_model_v6.xlsx` | 9-tab Excel rebuild, independently engineered by external auditor Ben in April 2026 (`bens_model_v3.xlsx`), then patched to mirror calc v6 in May 2026. Every cell traces to a formula. DASHBOARD reconciles every pitch claim against a live workbook cell. AUDIT documents bug findings + resolution status. |

Investors can use either. Both are linked from the pitch deck's Financial Model section (https://justinfowler925.github.io/matchbox7-pitch/).

## Sync history

| Date | Calc version | Spreadsheet | Notes |
|---|---|---|---|
| 2026-04 | v3.0 (snapshot) | Ben built `bens_model_v3.xlsx` from scratch, mirroring calc v3.0 constants/model | First external audit. Found 5 engineering bugs in calc + 5 strategic gaps. |
| 2026-05-20 | v5.0 (ingredient licensing pivot) | Spreadsheet not yet resynced | Calc shipped major narrative pivot; spreadsheet remained at v3 snapshot. |
| 2026-05-23 | v6.0 (Ben bugs fixed) | `monchmonch_model_v6.xlsx` | Calc fixed all 5 Ben bugs + added WC + completed BOM. Spreadsheet re-patched to mirror. |

## When to re-sync

Re-sync the spreadsheet **whenever calc material changes ship**. Material = anything that moves the Y3-Y5 numbers by >2%, or any structural change (new revenue stream, new OpEx category, schema bump).

Non-material changes (cosmetic UI, comment-only edits, new tabs, etc.) do not require re-sync.

## How to re-sync

The spreadsheet's INPUTS tab is the single source of truth — 2,094 formulas in CALC_*/DASHBOARD/AUDIT auto-recalculate from there. Patching `INPUTS` cells + running LibreOffice recalc generates a fresh v_N+1 file.

### Cell map: calc constants.js → spreadsheet INPUTS

| Calc constants.js field | Spreadsheet cells |
|---|---|
| `barRM[]` (15 items in v6) | INPUTS R74-R87 (14 rows; Monch Fiber occupies R80 slot — see Y1 ramp note below) |
| `elecRM[]` | INPUTS R91-R99 |
| `channels[]` | INPUTS R41-R46 (pctAlloc, prices, costPerUnit, ramp, max) |
| `coManBars/coManElec/coManThresholds/coManLabels` | INPUTS R51-R57 |
| `growthY2-Y5` | INPUTS R61 (C-F) |
| `marketingByYear` | INPUTS R62 |
| `payrollByYear` | INPUTS R63 |
| `bdSalesByYear` | INPUTS R64 |
| `clinicalByYear` | INPUTS R65 |
| `overheadMult` | INPUTS R66 |
| `licensingByYear` | INPUTS R67 |
| `licensingCogsPct` | INPUTS B68 |
| `barDemand` / `elecDemand` / `barSeason` / `elecSeason` | INPUTS R103-R114 |
| `launchExpenses[]` | INPUTS R119-R124 |
| `startingCash` / `equityRaised` / `debtAmount` / `debtRate` / `debtTerm` | INPUTS R128-R132 |
| `commitments[]` | INPUTS R136-R138 |
| `minBarRun` / `minElecRun` | INPUTS R142-R143 |
| `arDays` / `inventoryDays` / `apDays` | INPUTS R147-R149 (added in v6 sync) + CALC_CASH B5-B7 |

### Sync script template

The May 2026 v3→v6 patch lived at `/tmp/patch_to_v6.py`. Pattern:

```python
from openpyxl import load_workbook
wb = load_workbook('previous_version.xlsx', data_only=False)
ws = wb['INPUTS']

# Update each changed cell, e.g.:
ws['B78'] = 0.022  # Whey Protein qty (was 0.044)
# ...etc...

# Manually update hardcoded DASHBOARD "Deck Claim" values + verdicts
dash = wb['DASHBOARD']
dash['B6'] = '$281K (calc v6, ramp-adjusted)'
dash['D6'] = '⚠'
dash['F6'] = 'Explanation of methodology difference'

# Update AUDIT statuses when bugs are fixed
audit = wb['AUDIT']
audit['B38'] = '✓ FIXED IN CALC vN'

wb.save('new_version.xlsx')
```

Then run LibreOffice recalc to evaluate the 2,094 formulas:
```bash
python3 "$SKILL_BASE/scripts/recalc.py" new_version.xlsx 60
# Must return: {"status": "success", "total_errors": 0, ...}
```

Then verify a handful of DASHBOARD verdicts by sampling.

## Known structural divergence (Y1 ramp)

The spreadsheet's CALC_PL Y1 column uses annual aggregate revenue ($299K for bars) — does NOT respect channel rampMonths. Calc v6 fixed this by aggregating from CALC_MONTHLY (which respects ramps) → $281K. The 6% difference is documented in:

- DASHBOARD R6 (verdict ⚠ with explanation)
- AUDIT Section A (quantified)
- This document

To eliminate this divergence in a future spreadsheet pass: replace CALC_PL!B15 (Bars Gross Revenue Y1) formula to pull `=SUM(CALC_MONTHLY!N30, CALC_MONTHLY!N36, CALC_MONTHLY!N42, CALC_MONTHLY!N48, CALC_MONTHLY!N54, CALC_MONTHLY!N60)` (channel revenue Y1 totals).

## Inviting external re-audit

If Ben (or another auditor) wants to do a fresh pass:

1. Hand them the current spreadsheet (`monchmonch_model_v6.xlsx`) + the latest calc commit hash.
2. Their AUDIT tab will surface new bugs or confirm existing ones are fixed.
3. Apply their findings to calc constants.js / model.js.
4. Re-patch spreadsheet to match the new calc.
5. Update this doc's sync-history table.

The external-audit → fix → re-sync loop is the load-bearing maintenance discipline. The first round (Ben Apr → Justin May v5 → audit catches v5 gaps → Justin May v6 → spreadsheet resynced) caught 5 engineering bugs and 5 strategic gaps. Future rounds should be lighter but the discipline still applies.

## Files referenced

- `src/constants.js` — calc inputs (15 ingredient bar BOM in v6, WC days, etc.)
- `src/model.js` — calc engine (years loop with WC; cumulativeBreakEvenMonth)
- `../Monch Bars/matchbox7-pitch-site/index.html` — pitch deck (DASHBOARD numbers shown here must match spreadsheet)
- `../Monch Bars/matchbox7-pitch-site/monchmonch_model_v6.xlsx` — current spreadsheet artifact
- `../monch/Monch_Bar_and_Packet_BOM_Matchbox7.csv` — Ben's BOM extract that surfaced "Monch Fiber NOT in calculator" gap
