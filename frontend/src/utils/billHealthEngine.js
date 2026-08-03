import { averageRate, billForUnits, currentSlabIndex, marginalRate } from "./slabRates";

export function getBillHealth(bills = []) {
  const latest = bills.at(-1);
  const previous = bills.at(-2);
  if (!latest) return null;
  const units = Number(latest.units) || 0;
  const amount = Number(latest.bill) || 0;
  const actualRate = units ? amount / units : 0;
  const benchmarkRate = averageRate(units);
  const unitChange = previous?.units ? ((units - previous.units) / previous.units) * 100 : null;
  const history = bills.slice(-6);
  const historicalUnits = history.length > 1 ? history.slice(0, -1).reduce((sum, bill) => sum + Number(bill.units || 0), 0) / (history.length - 1) : null;
  const expectedTariffAmount = billForUnits(units);
  const findings = [];
  if (unitChange !== null && unitChange > 15) findings.push({ tone: "amber", title: "Usage increased", text: `${Math.round(unitChange)}% more electricity was recorded than your previous bill.` });
  if (unitChange !== null && unitChange < -12) findings.push({ tone: "teal", title: "Usage reduced", text: `${Math.abs(Math.round(unitChange))}% fewer units were recorded than your previous bill.` });
  if (units > 300) findings.push({ tone: "amber", title: `Higher tariff slab`, text: `You are currently in Slab ${currentSlabIndex(units)}. Each additional unit is approximately ₹${marginalRate(units).toFixed(2)}.` });
  if (actualRate > benchmarkRate * 1.22) findings.push({ tone: "rose", title: "Amount worth checking", text: `Your effective rate is ₹${actualRate.toFixed(2)}/unit, above the illustrative energy-charge benchmark. Check fixed charges, arrears and taxes on the bill.` });
  if (!findings.length) findings.push({ tone: "teal", title: "No obvious change", text: "Your available bill history does not show a large usage change. Review the full bill for fixed charges and due date." });
  return { latest, units, amount, actualRate, unitChange, historicalUnits, expectedTariffAmount, findings, confidence: bills.length >= 6 ? "medium" : bills.length >= 3 ? "low–medium" : "low" };
}

export function scenarioEstimate(health, percent) {
  const units = Math.max(0, Math.round(health.units * (1 + percent / 100)));
  const energyCharge = billForUnits(units);
  const fixedAndOther = Math.max(0, health.amount - billForUnits(health.units));
  const amount = Math.round(energyCharge + fixedAndOther);
  const spread = Math.max(100, Math.round(amount * 0.1));
  return { units, low: Math.max(0, amount - spread), high: amount + spread };
}
