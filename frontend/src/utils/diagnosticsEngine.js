// Rule-based Equipment Health Diagnostics engine.
// No live sensor data exists yet (per-appliance current draw), so this
// reasons from bill-level signals already in BillContext: overall trend,
// simulated appliance breakdown %, and weather. Each rule checks for a
// *mismatch* pattern (e.g. high AC share despite mild weather) that would
// realistically indicate a hardware issue rather than just "usage is up."
//
// IMPORTANT: applianceBreakdown is currently hardcoded in BillContext, not
// real sensor data — so these flags are illustrative/demo-quality until
// real per-appliance monitoring exists. Keep this honest with users.

const FRIDGE_HEALTHY_BASELINE_PCT = 15; // typical healthy fridge share of total bill
const HEATER_HEALTHY_BASELINE_PCT = 22;
const AC_MISMATCH_TEMP_C = 28; // "mild" weather ceiling for the AC-anomaly rule

export function generateDiagnostics({
  trendPercent = 0,
  applianceBreakdown = [],
  weatherTemp = null,
  latestBill = null,
}) {
  const billAmount = latestBill?.bill ?? 0;
  if (!billAmount) return null;

  const acShare = applianceBreakdown.find((a) => a.name === "AC Unit")?.pct ?? 0;
  const heaterShare = applianceBreakdown.find((a) => a.name === "Water Heater")?.pct ?? 0;
  const fridgeShare = applianceBreakdown.find((a) => a.name === "Refrigerator")?.pct ?? 0;

  const candidates = [];

  // --- Rule A: Refrigerator drawing well above healthy baseline ---
  // A healthy fridge is a small, steady load. A large share is a signal
  // independent of weather or overall trend — worth flagging on its own.
  if (fridgeShare >= FRIDGE_HEALTHY_BASELINE_PCT + 5) {
    const overBy = fridgeShare - FRIDGE_HEALTHY_BASELINE_PCT;
    candidates.push({
      appliance: "Refrigerator",
      percent: Math.round(overBy),
      cause:
        "This is above the typical 10-15% baseline for a healthy unit — often caused by dust-choked condenser coils or a worn door seal making the compressor cycle more than it should.",
      impactRs: Math.round((billAmount * fridgeShare) / 100 * 0.15),
    });
  }

  // --- Rule B: High AC share despite mild outdoor temperature ---
  // If AC is a big chunk of the bill but it isn't hot outside, weather
  // doesn't explain the load — that mismatch points to the unit itself.
  if (acShare >= 45 && weatherTemp !== null && weatherTemp <= AC_MISMATCH_TEMP_C) {
    candidates.push({
      appliance: "AC Unit",
      percent: acShare,
      cause: `Outdoor temperature is only ${Math.round(
        weatherTemp
      )}°C, so this level of draw isn't fully explained by weather — a clogged air filter or low refrigerant can force the compressor to run longer to hit the set temperature.`,
      impactRs: Math.round((billAmount * acShare) / 100 * 0.12),
    });
  }

  // --- Rule C: Water heater above healthy baseline ---
  if (heaterShare >= HEATER_HEALTHY_BASELINE_PCT + 8) {
    candidates.push({
      appliance: "Water Heater",
      percent: heaterShare,
      cause:
        "A thermostat that's miscalibrated (running hotter than its setting) or degrading tank insulation can cause more frequent reheating cycles than necessary.",
      impactRs: Math.round((billAmount * heaterShare) / 100 * 0.1),
    });
  }

  // --- Rule D: Fallback — overall trend spike with no specific culprit found ---
  if (candidates.length === 0 && trendPercent > 15) {
    candidates.push({
      appliance: "Unusual usage",
      percent: Math.round(trendPercent),
      cause:
        "No single appliance stands out yet, but overall consumption is well above your recent average — worth a walkthrough to rule out a device left running.",
      impactRs: Math.round(billAmount * 0.08),
    });
  }

  if (candidates.length === 0) return null;

  // Return the highest-impact issue.
  return candidates.sort((a, b) => b.impactRs - a.impactRs)[0];
}