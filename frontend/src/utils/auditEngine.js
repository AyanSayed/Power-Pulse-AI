// =============================================================================
// Virtual Appliance Energy Audit Matrix
// =============================================================================
// This is deliberately NOT the same computation as nilmEngine.js's Tier 2
// breakdown. Tier 2 infers a *percentage split* and calibrates it to match
// the bill total — it's explicitly an estimate. This engine instead computes
// real, independent kWh and cost from specs the user actually enters
// (appliance type, tonnage/star rating, daily run hours, quantity) using
// published BEE efficiency deltas. Nothing here is normalized to force-fit
// the bill — the reconciliation section instead compares the two so the
// user can see how close a from-scratch calculation lands.
// =============================================================================

import { marginalRate } from "./slabRates";

const DAYS_PER_MONTH = 30;

// Star-rating efficiency multipliers, relative to a 3-star non-inverter
// baseline (1.0). Based on the well-known BEE pattern where each extra star
// represents roughly a 12-15% efficiency gain; inverter compressors add a
// further cut because they modulate instead of running full-tilt.
const STAR_MULTIPLIER = {
  3: 1.0,
  4: 0.85,
  5: 0.72,
};
const INVERTER_MULTIPLIER = 0.75;

// Reference running-watt figures per ton (AC) or per category (fridge),
// at the 3-star non-inverter baseline.
const AC_WATTS_PER_TON = 1200;
const FRIDGE_BASE_WATTS = {
  "Single Door (small)": 130,
  "Double Door": 180,
  "Side-by-Side / Frost-Free": 250,
};

export const AUDIT_APPLIANCE_TYPES = [
  { key: "AC", label: "Air Conditioner", mode: "ac" },
  { key: "Refrigerator", label: "Refrigerator", mode: "fridge" },
  { key: "WashingMachine", label: "Washing Machine", mode: "generic", defaultWatts: 500 },
  { key: "WaterHeater", label: "Water Heater / Geyser", mode: "generic", defaultWatts: 2000 },
  { key: "TV", label: "Television", mode: "generic", defaultWatts: 120 },
  { key: "Lights", label: "Lights / Fans (bulk)", mode: "generic", defaultWatts: 12 },
  { key: "Custom", label: "Other (custom wattage)", mode: "generic", defaultWatts: 100 },
];

export function fridgeCategories() {
  return Object.keys(FRIDGE_BASE_WATTS);
}

// Resolve the effective running wattage for one entry based on its mode.
function resolveWatts(entry) {
  if (entry.mode === "ac") {
    const tonnage = Number(entry.tonnage) || 1.5;
    const star = STAR_MULTIPLIER[Number(entry.starRating)] ?? 1.0;
    const inverter = entry.inverter ? INVERTER_MULTIPLIER : 1;
    return tonnage * AC_WATTS_PER_TON * star * inverter;
  }
  if (entry.mode === "fridge") {
    const base = FRIDGE_BASE_WATTS[entry.category] || FRIDGE_BASE_WATTS["Double Door"];
    const star = STAR_MULTIPLIER[Number(entry.starRating)] ?? 1.0;
    return base * star;
  }
  return Number(entry.watts) || 0;
}

// Compute independent kWh + cost for one appliance entry.
function computeEntry(entry, totalBilledUnits) {
  const watts = resolveWatts(entry);
  const hours = Math.max(0, Number(entry.hours) || 0);
  const qty = Math.max(1, Number(entry.quantity) || 1);

  const dailyKwh = (watts * hours * qty) / 1000;
  const monthlyKwh = dailyKwh * DAYS_PER_MONTH;
  const rate = marginalRate(totalBilledUnits);
  const monthlyCost = monthlyKwh * rate;

  return {
    ...entry,
    watts: Math.round(watts),
    dailyKwh: Number(dailyKwh.toFixed(2)),
    monthlyKwh: Number(monthlyKwh.toFixed(1)),
    monthlyCost: Math.round(monthlyCost),
  };
}

// Full audit: per-entry results, totals, and a reconciliation against the
// actual billed units — the reconciliation is the piece that directly
// answers "this is just a guess," because it's a real, falsifiable check.
export function runAudit(entries, totalBilledUnits = 0) {
  const computed = entries.map((e) => computeEntry(e, totalBilledUnits));
  const totalKwh = computed.reduce((s, e) => s + e.monthlyKwh, 0);
  const totalCost = computed.reduce((s, e) => s + e.monthlyCost, 0);

  const withShare = computed
    .map((e) => ({ ...e, sharePct: totalKwh > 0 ? Math.round((e.monthlyKwh / totalKwh) * 100) : 0 }))
    .sort((a, b) => b.monthlyKwh - a.monthlyKwh);

  const matchPct =
    totalBilledUnits > 0 ? Math.round(Math.min(totalKwh, totalBilledUnits * 2) / totalBilledUnits * 100) : null;

  return {
    entries: withShare,
    totalKwh: Number(totalKwh.toFixed(1)),
    totalCost: Math.round(totalCost),
    billedUnits: totalBilledUnits,
    matchPct, // e.g. 92 means computed usage accounts for 92% of the actual bill
  };
}

export function emptyEntry(type = AUDIT_APPLIANCE_TYPES[0]) {
  const base = {
    id: `${type.key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    key: type.key,
    label: type.label,
    mode: type.mode,
    hours: type.mode === "ac" ? 5 : 2,
    quantity: 1,
  };
  if (type.mode === "ac") return { ...base, tonnage: 1.5, starRating: 3, inverter: false };
  if (type.mode === "fridge") return { ...base, category: "Double Door", starRating: 3 };
  return { ...base, watts: type.defaultWatts ?? 100 };
}
