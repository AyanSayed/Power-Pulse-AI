// Rule-based "zero-sacrifice" recommendation engine.
// Takes data already available in BillContext (no new backend/AI calls)
// and returns a sorted list of recommendations with quantified ₹ savings.
//
// Each rule only fires when its condition is met, so the output adapts
// to the household's actual weather + usage pattern instead of showing
// generic advice.

const RATE_PER_UNIT = 8.2; // ₹/unit — matches the rest of the app

export function generateRecommendations({
  weatherTemp,
  latestBill,
  trendPercent,
  applianceBreakdown = [],
}) {
  const recs = [];
  const billAmount = latestBill?.bill ?? 0;

  const acShare = applianceBreakdown.find((a) => a.name === "AC Unit")?.pct ?? 0;
  const heaterShare = applianceBreakdown.find((a) => a.name === "Water Heater")?.pct ?? 0;
  const fridgeShare = applianceBreakdown.find((a) => a.name === "Refrigerator")?.pct ?? 0;

  // --- Rule 1: Hot weather + meaningful AC load -> raise thermostat ---
  if (weatherTemp !== null && weatherTemp > 30 && acShare > 0) {
    // Roughly 3-4% cooling-load reduction per °C raised, applied to AC's
    // share of the bill. Conservative estimate, framed as "zero sacrifice"
    // since 1-2°C + a fan is generally imperceptible for comfort.
    const acSpend = (billAmount * acShare) / 100;
    const saving = Math.round(acSpend * 0.07); // ~2°C raise
    if (saving > 0) {
      recs.push({
        id: "ac-temp",
        title: "Raise AC to 24–25°C + ceiling fan",
        description: `It's ${Math.round(
          weatherTemp
        )}°C outside — running your AC 1–2°C warmer alongside a fan on medium speed keeps the same comfort level while cutting compressor load.`,
        estimatedSaving: saving,
      });
    }
  }

  // --- Rule 2: Usage trending up meaningfully -> shift load off-peak ---
  if (trendPercent > 8 && billAmount > 0) {
    const saving = Math.round(billAmount * 0.05);
    recs.push({
      id: "trend-shift",
      title: "Shift heavy appliances to off-peak hours",
      description: `Your usage is up ${trendPercent.toFixed(
        0
      )}% vs last month. Running your washing machine, water heater, and iron before 8am or after 10pm avoids peak-hour slab pressure without changing how much you use them.`,
      estimatedSaving: saving,
    });
  }

  // --- Rule 3: Water heater is a large share -> thermostat tip ---
  if (heaterShare >= 20 && billAmount > 0) {
    const heaterSpend = (billAmount * heaterShare) / 100;
    const saving = Math.round(heaterSpend * 0.1);
    recs.push({
      id: "heater-temp",
      title: "Lower water heater thermostat to 50–55°C",
      description: `Water heating is ${heaterShare}% of your bill. Most households run heaters hotter than needed — 50–55°C is plenty for bathing and dishes, and cuts standby heat loss.`,
      estimatedSaving: saving,
    });
  }

  // --- Rule 4: Fridge share looks high relative to typical baseline ---
  if (fridgeShare >= 18 && billAmount > 0) {
    const saving = Math.round(billAmount * 0.03);
    recs.push({
      id: "fridge-check",
      title: "Check refrigerator door seal & coil dust",
      description: `Refrigerators are usually a steady, small load. Yours is at ${fridgeShare}% of your bill — worth checking the door seal and cleaning the back coils, which can quietly inflate consumption for months.`,
      estimatedSaving: saving,
    });
  }

  // --- Fallback: always have at least one general tip ---
  if (recs.length === 0 && billAmount > 0) {
    recs.push({
      id: "general",
      title: "Unplug idle chargers & devices on standby",
      description:
        "Small standby loads across chargers, set-top boxes, and routers add up over a full month even when devices look 'off'.",
      estimatedSaving: Math.round(billAmount * 0.02),
    });
  }

  return recs.sort((a, b) => b.estimatedSaving - a.estimatedSaving);
}