// =============================================================================
// The Three-Tier Data Pyramid
// =============================================================================
// Tier 1 — Onboarding Hook:      Bill upload + pincode only. Generic, weather-
//                                 nudged averages. Zero personalization inputs.
// Tier 2 — Software-Only Flow:   Bill + weather + a 30-second appliance checklist.
//                                 No hardware. Uses Non-Intrusive Load Monitoring
//                                 (NILM) / "Virtual Sub-Metering": we don't measure
//                                 each appliance, we *infer* its share from its
//                                 typical wattage, how many the user owns, and how
//                                 hard it would plausibly be working given the
//                                 weather — then calibrate the mix so it still
//                                 sums to the user's real billed units.
// Tier 3 — Complete Ecosystem:   Real per-appliance sensor readings (ESP32 smart
//                                 meter, via /api/meter-reading) replace the
//                                 estimate entirely with measured data.
//
// The rest of the app should never need to know which tier is active — it just
// calls estimateApplianceBreakdown() and gets back a chart-ready array, plus
// getDataTier()/getTierInfo() for the UI badge that tells the user what's real
// vs. estimated and how to unlock the next tier.
// =============================================================================

// Typical wattage + baseline daily runtime assumptions per appliance category.
// These are deliberately conservative, well-known Indian-household averages —
// good enough to rank appliances relative to each other, not a claim of
// laboratory-grade precision.
export const APPLIANCE_CATALOG = {
  AC: { label: "Air Conditioner (1.5 ton)", watts: 1500, baseHours: 5 },
  WaterHeater: { label: "Water Heater / Geyser", watts: 2000, baseHours: 1 },
  Refrigerator: { label: "Refrigerator", watts: 150, baseHours: 24 },
  WashingMachine: { label: "Washing Machine", watts: 500, baseHours: 0.5 },
  TV: { label: "Television", watts: 120, baseHours: 4 },
  Lights: { label: "Lights (per bulb/tube, avg)", watts: 12, baseHours: 6 },
};

const LABELS = {
  AC: "AC Unit",
  WaterHeater: "Water Heater",
  Refrigerator: "Refrigerator",
  WashingMachine: "Washing Machine",
  TV: "TV",
  Lights: "Lights",
  Others: "Other Appliances",
};

const COLORS = {
  AC: "coral",
  WaterHeater: "amber",
  Refrigerator: "teal",
  WashingMachine: "navy",
  TV: "navy",
  Lights: "navy",
  Others: "navy",
};

const TIER_INFO = {
  1: {
    tier: 1,
    name: "Tier 1 · Onboarding Estimate",
    short: "Generic estimate",
    desc: "Based on your bill and pincode only. Add your appliances for a personalized, weather-aware breakdown.",
  },
  2: {
    tier: 2,
    name: "Tier 2 · Virtual Sub-Metering",
    short: "Estimated (no hardware)",
    desc: "Estimated from your appliance checklist and local weather using Non-Intrusive Load Monitoring (NILM) — no sensors required.",
  },
  3: {
    tier: 3,
    name: "Tier 3 · Live Sensor Data",
    short: "Measured live",
    desc: "Measured directly from your connected smart-meter sensors.",
  },
};

export function getTierInfo(tier) {
  return TIER_INFO[tier] || TIER_INFO[1];
}

// ---------------------------------------------------------------------------
// Tier detection
// ---------------------------------------------------------------------------
export function getDataTier({ hasApplianceProfile, hasLiveSensorData }) {
  if (hasLiveSensorData) return 3;
  if (hasApplianceProfile) return 2;
  return 1;
}

// ---------------------------------------------------------------------------
// Tier 1 — generic, weather-nudged fallback (no appliance data at all)
// ---------------------------------------------------------------------------
export function tier1Breakdown(weatherTemp) {
  const hot = weatherTemp != null && weatherTemp >= 33;
  return hot
    ? [
        { name: "AC Unit", pct: 48, color: "coral" },
        { name: "Water Heater", pct: 18, color: "amber" },
        { name: "Refrigerator", pct: 14, color: "teal" },
        { name: "Other Appliances", pct: 20, color: "navy" },
      ]
    : [
        { name: "AC Unit", pct: 32, color: "coral" },
        { name: "Water Heater", pct: 26, color: "amber" },
        { name: "Refrigerator", pct: 18, color: "teal" },
        { name: "Other Appliances", pct: 24, color: "navy" },
      ];
}

// Hotter weather -> AC plausibly runs longer per day. This is the "weather API"
// half of the Tier 2 software-only flow.
function acHoursForWeather(weatherTemp) {
  if (weatherTemp == null) return APPLIANCE_CATALOG.AC.baseHours;
  if (weatherTemp >= 38) return 9;
  if (weatherTemp >= 33) return 7;
  if (weatherTemp >= 28) return 5;
  return 2.5;
}

// ---------------------------------------------------------------------------
// Tier 2 — NILM / Virtual Sub-Metering
// ---------------------------------------------------------------------------
// We estimate kWh per appliance category from (count × wattage × plausible
// daily hours), then normalize to percentages. Normalizing means the estimate
// always reconciles with the user's real billed units even though the split
// itself is inferred, not measured.
export function tier2Breakdown({ applianceProfile, weatherTemp, billingDays = 30 }) {
  const p = { AC: 0, WaterHeater: 0, Refrigerator: 0, WashingMachine: 0, TV: 0, Lights: 0, ...applianceProfile };
  const acHours = acHoursForWeather(weatherTemp);

  const kwhOf = (key, hours) => (p[key] * APPLIANCE_CATALOG[key].watts * hours * billingDays) / 1000;

  const rawKwh = {
    AC: kwhOf("AC", acHours),
    WaterHeater: kwhOf("WaterHeater", APPLIANCE_CATALOG.WaterHeater.baseHours),
    Refrigerator: kwhOf("Refrigerator", APPLIANCE_CATALOG.Refrigerator.baseHours),
    WashingMachine: kwhOf("WashingMachine", APPLIANCE_CATALOG.WashingMachine.baseHours),
    TV: kwhOf("TV", APPLIANCE_CATALOG.TV.baseHours),
    Lights: kwhOf("Lights", APPLIANCE_CATALOG.Lights.baseHours),
  };

  const total = Object.values(rawKwh).reduce((s, v) => s + v, 0);

  // Nobody ticked anything -> nothing to infer from, fall back to Tier 1
  // rather than showing a meaningless empty/divide-by-zero chart.
  if (total <= 0) return tier1Breakdown(weatherTemp);

  // Fold anything below 3% into "Other Appliances" so the chart stays legible.
  const entries = Object.entries(rawKwh)
    .map(([key, kwh]) => ({ name: LABELS[key], color: COLORS[key], pct: (kwh / total) * 100 }))
    .filter((e) => e.pct >= 3);

  const shown = entries.reduce((s, e) => s + e.pct, 0);
  const remainder = 100 - shown;
  if (remainder > 0.5) {
    entries.push({ name: LABELS.Others, color: COLORS.Others, pct: remainder });
  }

  return entries
    .map((e) => ({ ...e, pct: Math.round(e.pct) }))
    .sort((a, b) => b.pct - a.pct);
}

// ---------------------------------------------------------------------------
// Tier 3 — real sensor readings from MeterReading docs (one row per appliance)
// ---------------------------------------------------------------------------
export function tier3Breakdown(latestReadings = []) {
  const totalPower = latestReadings.reduce((s, r) => s + (r.power || 0), 0);
  if (totalPower <= 0) return null;

  return latestReadings
    .map((r) => ({
      name: LABELS[r.appliance] || r.appliance,
      color: COLORS[r.appliance] || "navy",
      pct: Math.round((r.power / totalPower) * 100),
    }))
    .filter((e) => e.pct > 0)
    .sort((a, b) => b.pct - a.pct);
}

// ---------------------------------------------------------------------------
// Single entry point the rest of the app calls
// ---------------------------------------------------------------------------
export function estimateApplianceBreakdown({ tier, applianceProfile, weatherTemp, latestReadings }) {
  if (tier === 3) {
    const measured = tier3Breakdown(latestReadings);
    if (measured) return measured;
  }
  if (tier >= 2) return tier2Breakdown({ applianceProfile, weatherTemp });
  return tier1Breakdown(weatherTemp);
}