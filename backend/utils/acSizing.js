// backend/utils/acSizing.js

const humidCities = [
  "Mumbai",
  "Chennai",
  "Kolkata",
  "Goa",
  "Kochi",
  "Visakhapatnam"
];

function calculateACTonnage(data) {
  let {
    area,
    ceilingHeight,
    city,
    sunExposure,
    floor,
    currentTon,
    starRating,
    hoursPerDay
  } = data;

  area = Number(area);
  ceilingHeight = Number(ceilingHeight);
  currentTon = Number(currentTon);
  hoursPerDay = Number(hoursPerDay);

  // Base tonnage
  let requiredTon = area / 120;

  // Ceiling adjustment
  if (ceilingHeight > 10)
    requiredTon += 0.2;

  // Floor adjustment
  if (floor === "Top")
    requiredTon += 0.3;

  // Sunlight adjustment
  if (sunExposure === "Direct")
    requiredTon += 0.2;
  else if (sunExposure === "Normal")
    requiredTon += 0.1;

  // Humidity adjustment
  if (humidCities.includes(city))
    requiredTon += 0.1;

  // Round to nearest 0.5
  requiredTon = Math.round(requiredTon * 2) / 2;

  //-------------------------------------------------
  // Determine recommendation
  //-------------------------------------------------

  let status;

  if (currentTon < requiredTon)
    status = "Undersized";
  else if (currentTon > requiredTon)
    status = "Oversized";
  else
    status = "Correct";

  //-------------------------------------------------
  // Runtime reduction estimate
  //-------------------------------------------------

  let runtimeReduction = 0;

  if (status === "Undersized")
    runtimeReduction = 2.5;

  if (status === "Oversized")
    runtimeReduction = 1;

  //-------------------------------------------------
  // Approx Power
  //-------------------------------------------------

  const powerMap = {
    1: 1.1,
    1.5: 1.5,
    2: 2.0
  };

  const power =
    powerMap[currentTon] || 1.5;

  const unitsSaved =
    runtimeReduction * power * 30;

  const estimatedUnitsSaved = Number(unitsSaved.toFixed(1));

// Replace this with your slab calculator function
const estimatedMoneySaved = estimatedUnitsSaved * 12; // TEMP ₹12/unit

let recommendation = "";

if (status === "Undersized") {
  recommendation = `Your room requires approximately a ${requiredTon}-Ton AC. The current ${currentTon}-Ton AC is undersized, causing longer compressor operation and higher electricity consumption. Upgrading to a ${requiredTon}-Ton 5-Star Inverter AC can significantly improve cooling efficiency and reduce your electricity usage.`;
} else if (status === "Oversized") {
  recommendation = `Your current AC has a higher capacity than required. While cooling is faster, frequent compressor cycling can reduce efficiency.`;
} else {
  recommendation = "Your AC capacity is correctly sized for your room.";
}

return {
  requiredTon,
  status,
  runtimeReduction,
  estimatedUnitsSaved,
  estimatedMoneySaved,
  recommendation
};
}

module.exports = {
  calculateACTonnage
};