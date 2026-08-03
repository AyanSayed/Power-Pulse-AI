// =============================================================================
// Slab Tariff Engine
// =============================================================================
// Indian residential electricity is billed in slabs: the first N units cost
// one rate, the next block costs a higher rate, and so on. This file models
// that structure so the Appliance Audit Matrix can price each appliance at
// its true *marginal* rate — the rate that would actually be saved if that
// appliance were switched off — instead of one flat average rate for
// everything.
//
// Rates below are a representative residential slab structure (₹/unit),
// modeled on the shape of Maharashtra (MSEDCL) urban domestic tariffs. They
// are illustrative for demo purposes, not a live feed of current DISCOM
// rates — swap this table for a live tariff API/state selector post-hackathon.
// =============================================================================

export const SLABS = [
  { upTo: 100, rate: 4.71 },
  { upTo: 300, rate: 10.44 },
  { upTo: 500, rate: 12.32 },
  { upTo: Infinity, rate: 13.85 },
];

// Total bill for a given monthly consumption, built up slab by slab.
export function billForUnits(units) {
  let remaining = Math.max(0, units);
  let cost = 0;
  let lower = 0;

  for (const slab of SLABS) {
    if (remaining <= 0) break;
    const slabSize = slab.upTo - lower;
    const unitsInSlab = Math.min(remaining, slabSize);
    cost += unitsInSlab * slab.rate;
    remaining -= unitsInSlab;
    lower = slab.upTo;
  }

  return Math.round(cost);
}

// The rate that applies to the *next* unit at this consumption level — i.e.
// what you'd actually save per unit by cutting usage right now. This is the
// economically correct way to price an individual appliance's contribution,
// since slabs apply to the household total, not to any one device.
export function marginalRate(totalUnits) {
  const slab = SLABS.find((s) => totalUnits <= s.upTo) || SLABS[SLABS.length - 1];
  return slab.rate;
}

export function averageRate(totalUnits) {
  if (totalUnits <= 0) return SLABS[0].rate;
  return billForUnits(totalUnits) / totalUnits;
}

// Which slab (1-indexed) the household currently sits in, for UI messaging
// like "You're in Slab 3 — every extra unit costs ₹13.85".
export function currentSlabIndex(totalUnits) {
  return SLABS.findIndex((s) => totalUnits <= s.upTo) + 1;
}
