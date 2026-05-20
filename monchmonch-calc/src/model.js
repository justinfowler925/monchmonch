export function runModel(s) {
  const rmCost = (materials, tier) =>
    materials.reduce((sum, m) => sum + m.qty * m[`t${tier}`], 0);

  const barRMT1 = rmCost(s.barRM, 1), barRMT2 = rmCost(s.barRM, 2), barRMT3 = rmCost(s.barRM, 3);
  const elecRMT1 = rmCost(s.elecRM, 1), elecRMT2 = rmCost(s.elecRM, 2), elecRMT3 = rmCost(s.elecRM, 3);

  const barPkgPerUnit = s.barPackaging.reduce((sum, p) => sum + p.costPerUnit, 0);
  const elecPkgPerUnit = s.elecPackaging.reduce((sum, p) => sum + p.costPerUnit, 0);

  const laborFromRoles = (unitsPerRun) => {
    if (!s.laborRoles || s.laborRoles.length === 0) return s.laborPerUnit;
    const totalLaborCost = s.laborRoles.reduce((sum, r) => sum + r.headcount * r.rate * r.hoursPerRun, 0);
    return unitsPerRun > 0 ? totalLaborCost / unitsPerRun : s.laborPerUnit;
  };

  const getCoManTier = (vol) => {
    for (let i = s.coManThresholds.length - 1; i >= 0; i--) {
      if (vol >= s.coManThresholds[i]) return i;
    }
    return 0;
  };

  const laborAtTier = (tier) => {
    const midVols = [500, 5000, 50000, 250000, 750000, 2500000, 7500000];
    const baseLaborPerUnit = laborFromRoles(midVols[tier]);
    const scales = [1.0, 0.75, 0.5, 0.35, 0.25, 0.18, 0.12];
    return baseLaborPerUnit * scales[tier];
  };

  const ohAtTier = (tier) => {
    const midVols = [500, 5000, 50000, 250000, 750000, 2500000, 7500000];
    return s.fixedOverhead / midVols[tier];
  };

  const cogsWaterfall = (coManPrices, type) => {
    return s.coManLabels.map((label, i) => {
      const rm = type === "bar" ? [barRMT1, barRMT2, barRMT3] : [elecRMT1, elecRMT2, elecRMT3];
      const rmTier = i < 2 ? rm[0] : i < 4 ? rm[1] : rm[2];
      const labor = laborAtTier(i);
      const oh = ohAtTier(i);
      const coMan = coManPrices[i];
      const pkg = type === "bar" ? barPkgPerUnit : elecPkgPerUnit;
      return { tier: label, rm: rmTier, labor, overhead: oh, coMan, packaging: pkg, total: rmTier + labor + oh + coMan + pkg };
    });
  };

  const barCOGS = cogsWaterfall(s.coManBars, "bar");
  const elecCOGS = cogsWaterfall(s.coManElec, "elec");

  const activeChannels = s.channels.filter((ch) => ch.active);
  const totalAlloc = activeChannels.reduce((sum, ch) => sum + ch.pctAlloc, 0) || 1;

  const computeChannelRevenue = (barUnits, elecUnits, month) => {
    let totalRev = 0, totalChannelCosts = 0;
    const channelDetail = [];
    for (const ch of activeChannels) {
      if (month !== undefined && month < ch.rampMonths) {
        channelDetail.push({ name: ch.name, barUnits: 0, elecUnits: 0, rev: 0, costs: 0 });
        continue;
      }
      const normAlloc = ch.pctAlloc / totalAlloc;
      let chBarUnits = Math.round(barUnits * normAlloc);
      let chElecUnits = Math.round(elecUnits * normAlloc);
      if (ch.maxMonthlyUnits > 0 && month !== undefined) {
        const cap = ch.maxMonthlyUnits;
        const totalCh = chBarUnits + chElecUnits;
        if (totalCh > cap) {
          const scale = cap / totalCh;
          chBarUnits = Math.round(chBarUnits * scale);
          chElecUnits = Math.round(chElecUnits * scale);
        }
      }
      const rev = chBarUnits * ch.barPrice + chElecUnits * ch.elecPrice;
      const costs = (chBarUnits + chElecUnits) * ch.costPerUnit;
      totalRev += rev;
      totalChannelCosts += costs;
      channelDetail.push({ name: ch.name, barUnits: chBarUnits, elecUnits: chElecUnits, rev, costs });
    }
    return { totalRev, totalChannelCosts, channelDetail };
  };

  const computeY1Monthly = (barBaseDemand, elecBaseDemand, barSeason, elecSeason) => {
    let barBegInv = 0, elecBegInv = 0;
    const months = [];
    const payStartIdx = Math.max((s.payrollStartMonth || 4) - 1, 0);
    const payActiveMonths = Math.max(12 - payStartIdx, 1);
    const monthlyPayroll = (s.payrollY1 || 0) / payActiveMonths;
    for (let m = 0; m < 12; m++) {
      const barAdj = Math.round(barBaseDemand[m] * barSeason[m]);
      const elecAdj = Math.round(elecBaseDemand[m] * elecSeason[m]);
      const barSafety = Math.ceil(barAdj * s.safetyStockPct);
      const elecSafety = Math.ceil(elecAdj * s.safetyStockPct);
      const barProd = Math.max(barAdj + barSafety - barBegInv, 0);
      const elecProd = Math.max(elecAdj + elecSafety - elecBegInv, 0);
      const barSpoil = Math.round(barBegInv * s.spoilageBar);
      const elecSpoil = Math.round(elecBegInv * s.spoilageElec);
      const barEnd = barBegInv + barProd - barAdj - barSpoil;
      const elecEnd = elecBegInv + elecProd - elecAdj - elecSpoil;
      const barBelowMOQ = barProd > 0 && barProd < s.minBarRun;
      const elecBelowMOQ = elecProd > 0 && elecProd < s.minElecRun;

      const chRev = computeChannelRevenue(barAdj, elecAdj, m);
      const grossRev = chRev.totalRev;
      const returns = grossRev * s.returnsPct;
      const netRev = grossRev - returns;
      const payroll = m >= payStartIdx ? monthlyPayroll : 0;

      months.push({
        month: m + 1,
        barAdjDemand: barAdj, elecAdjDemand: elecAdj,
        barProdOrder: barProd, elecProdOrder: elecProd,
        barBegInv, elecBegInv,
        barSpoilage: barSpoil, elecSpoilage: elecSpoil,
        barEndInv: barEnd, elecEndInv: elecEnd,
        barBelowMOQ, elecBelowMOQ,
        barUnitsSold: barAdj, elecUnitsSold: elecAdj,
        grossRev, returns, netRev, payroll,
        channelDetail: chRev.channelDetail, channelCosts: chRev.totalChannelCosts,
      });
      barBegInv = barEnd;
      elecBegInv = elecEnd;
    }
    return months;
  };

  const monthly = computeY1Monthly(s.barDemand, s.elecDemand, s.barSeason, s.elecSeason);

  const y1BarUnits = monthly.reduce((a, m) => a + m.barUnitsSold, 0);
  const y1ElecUnits = monthly.reduce((a, m) => a + m.elecUnitsSold, 0);
  const y1TotalUnits = y1BarUnits + y1ElecUnits;
  const opTier = getCoManTier(y1TotalUnits);

  const growthRates = [1, s.growthY2, s.growthY3, s.growthY4, s.growthY5];
  const cumGrowth = [1];
  for (let i = 1; i < 5; i++) cumGrowth[i] = cumGrowth[i - 1] * (1 + growthRates[i]);

  const startupCapex = s.launchExpenses.reduce((sum, e) => sum + e.cost, 0);
  const commitmentMonthly = s.commitments.reduce((sum, c) => sum + c.monthlyCost, 0);
  const debtMonthlyPayment = s.debtAmount > 0 && s.debtTerm > 0
    ? (s.debtAmount * (s.debtRate / 12) * Math.pow(1 + s.debtRate / 12, s.debtTerm)) / (Math.pow(1 + s.debtRate / 12, s.debtTerm) - 1)
    : 0;

  const years = [];
  let cashBalance = s.startingCash + s.equityRaised + s.debtAmount - startupCapex;

  for (let y = 0; y < 5; y++) {
    const barUnits = Math.round(y1BarUnits * cumGrowth[y]);
    const elecUnits = Math.round(y1ElecUnits * cumGrowth[y]);
    const totalUnits = barUnits + elecUnits;
    const tier = getCoManTier(totalUnits);

    const chRev = computeChannelRevenue(barUnits, elecUnits);
    const grossRev = chRev.totalRev;
    const returnsAmt = grossRev * s.returnsPct;
    const netRev = grossRev - returnsAmt;

    const bCOGSUnit = barCOGS[tier].total;
    const eCOGSUnit = elecCOGS[tier].total;
    const totalCOGS = barUnits * bCOGSUnit + elecUnits * eCOGSUnit;
    const grossProfit = netRev - totalCOGS;
    const grossMargin = netRev > 0 ? grossProfit / netRev : 0;

    const channelCosts = chRev.totalChannelCosts;
    const ohMult = (s.overheadMult && s.overheadMult[y]) || 1;
    const fixedOH = (s.fixedOverhead + s.equipAmort) * 12 * ohMult;
    const marketing = (s.marketingByYear && s.marketingByYear[y] != null)
      ? s.marketingByYear[y]
      : (s.marketingAnnual != null ? s.marketingAnnual : netRev * s.marketingPct);
    const payroll = (s.payrollByYear && s.payrollByYear[y] != null)
      ? s.payrollByYear[y]
      : ((s.payrollY1 || 0) + (s.payrollAnnualIncrease || 0) * y);
    const gna = s.gna * 12 * ohMult;
    const ccRate = s.carryingCostRate || 0.10;
    const carryingCost = totalUnits * s.warehousingPerUnit * ccRate;
    const spMult = s.spoilageCostMult || 3;
    const spoilageCost = barUnits * s.spoilageBar * bCOGSUnit * spMult + elecUnits * s.spoilageElec * eCOGSUnit * spMult;
    const commitmentCost = commitmentMonthly * 12;
    const debtService = debtMonthlyPayment * 12;

    const totalOpex = channelCosts + fixedOH + marketing + payroll + gna + carryingCost + spoilageCost + commitmentCost + debtService;
    const ebitda = grossProfit - totalOpex;
    const ebitdaMargin = netRev > 0 ? ebitda / netRev : 0;

    cashBalance += ebitda;
    const monthlyBurn = ebitda < 0 ? Math.abs(ebitda) / 12 : 0;
    const runwayMonths = monthlyBurn > 0 ? Math.floor(cashBalance / monthlyBurn) : 999;

    years.push({
      year: y + 1, barUnits, elecUnits, totalUnits, tier, bCOGSUnit, eCOGSUnit,
      netRev, totalCOGS, grossProfit, grossMargin,
      channelCosts, fixedOH, marketing, payroll, gna, carryingCost, spoilageCost, commitmentCost, debtService,
      totalOpex, ebitda, ebitdaMargin, cashBalance, monthlyBurn, runwayMonths,
      channelDetail: chRev.channelDetail,
    });
  }

  let cumEBITDA = 0;
  years.forEach((y) => { cumEBITDA += y.ebitda; y.cumEBITDA = cumEBITDA; });

  const breakEvenMonth = (() => {
    let cum = s.startingCash + s.equityRaised + s.debtAmount - startupCapex;
    for (let m = 0; m < 60; m++) {
      const yIdx = Math.min(Math.floor(m / 12), 4);
      const yr = years[yIdx];
      cum += yr.ebitda / 12;
      if (yr.ebitda > 0 && m > 0) return m + 1;
    }
    return null;
  })();

  const rmMoqCommitment = (materials) =>
    materials.reduce((sum, m) => sum + m.moq * m.t1, 0);

  const barRMMoqCost = rmMoqCommitment(s.barRM);
  const elecRMMoqCost = rmMoqCommitment(s.elecRM);

  const barPkgMoqCost = s.barPackaging.reduce((sum, p) => sum + p.moq * p.costPerUnit, 0);
  const elecPkgMoqCost = s.elecPackaging.reduce((sum, p) => sum + p.moq * p.costPerUnit, 0);

  const workingCapitalMonthly = monthly.map((m) => {
    const rmCommitted = (m.barProdOrder * barRMT1 + m.elecProdOrder * elecRMT1);
    const wip = rmCommitted * (s.coManLeadWeeks / 4);
    const fgInv = (m.barEndInv * barCOGS[opTier].total + m.elecEndInv * elecCOGS[opTier].total);
    return { month: m.month, rmCommitted, wip, fgInv, total: rmCommitted + wip + fgInv };
  });

  return {
    barCOGS, elecCOGS, monthly, years,
    barRMT1, barRMT2, barRMT3, elecRMT1, elecRMT2, elecRMT3,
    barPkgPerUnit, elecPkgPerUnit,
    opTier, y1BarUnits, y1ElecUnits, y1TotalUnits,
    startupCapex, commitmentMonthly, debtMonthlyPayment,
    barRMMoqCost, elecRMMoqCost, barPkgMoqCost, elecPkgMoqCost,
    breakEvenMonth, workingCapitalMonthly, activeChannels,
  };
}
