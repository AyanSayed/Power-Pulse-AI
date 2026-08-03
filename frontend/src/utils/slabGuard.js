// =============================================================================
// Real-Time Slab Jump Guard — calculation engine
// =============================================================================
// Unlike RunRateGauge (which needs live ESP32 hardware and only works for the
// device owner), this engine runs off a single manual meter reading any user
// can type in themselves. That directly answers the "not everyone has this
// data" critique — no smart meter required, just today's meter number.
//
// It's also slab-aware, not just checking a single hardcoded ceiling: it finds
// whichever slab the household is CURRENTLY in (using slabRates.js) and warns
// specifically about breaching *that* slab's ceiling, not a fixed 300-unit
// number. It also supports non-30-day billing cycles, since DISCOMs commonly
// bill over 35-40 days.
// =============================================================================

import { SLABS, billForUnits, currentSlabIndex } from "./slabRates";

// Upper bound of a given (1-indexed) slab.
function slabCeiling(slabIndexOneBased) {
  const slab = SLABS[slabIndexOneBased - 1];
  return slab ? slab.upTo : Infinity;
}

/**
 * @param {Object} params
 * @param {number} params.unitsSoFar   units consumed so far this billing cycle
 * @param {number} params.daysElapsed  days elapsed in the billing cycle so far
 * @param {number} params.daysInCycle  total length of the billing cycle (default 30)
 */
export function computeSlabGuard({ unitsSoFar, daysElapsed, daysInCycle }) {
  const units = Math.max(0, Number(unitsSoFar) || 0);
  const elapsed = Math.max(Number(daysElapsed) || 0, 0.5);
  const cycleLength = Math.max(Number(daysInCycle) || 30, elapsed + 0.5);

  const daysLeft = Math.max(cycleLength - elapsed, 0.5);
  const velocity = units / elapsed; // units per day, current pace
  const projected = velocity * cycleLength; // projected end-of-cycle total

  const slabIndex = currentSlabIndex(units);
  const ceiling = slabCeiling(slabIndex);
  const isTopSlab = ceiling === Infinity;

  const unitsLeftInSlab = isTopSlab ? null : Math.max(ceiling - units, 0);
  const safeDailyAllowance =
    isTopSlab || unitsLeftInSlab === null ? null : unitsLeftInSlab / daysLeft;

  const willBreach = !isTopSlab && projected > ceiling;

  const projectedCost = billForUnits(projected);
  const cappedCost = isTopSlab ? projectedCost : billForUnits(ceiling);
  const potentialSavings = willBreach ? Math.max(projectedCost - cappedCost, 0) : 0;

  let zone = "green";
  if (isTopSlab) {
    zone = "yellow"; // already at the top flat rate — no "jump" left, but flag it
  } else if (willBreach) {
    zone = "red";
  } else if (projected > ceiling * 0.85) {
    zone = "yellow";
  }

  return {
    slabIndex,
    ceiling,
    isTopSlab,
    daysLeft: Math.round(daysLeft * 10) / 10,
    velocity: Math.round(velocity * 100) / 100,
    projected: Math.round(projected * 10) / 10,
    unitsLeftInSlab: unitsLeftInSlab === null ? null : Math.round(unitsLeftInSlab * 10) / 10,
    safeDailyAllowance:
      safeDailyAllowance === null ? null : Math.round(safeDailyAllowance * 100) / 100,
    willBreach,
    projectedCost,
    cappedCost,
    potentialSavings: Math.round(potentialSavings),
    zone,
  };
}