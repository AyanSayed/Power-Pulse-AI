const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/:city", async (req, res) => {
  try {
    const city = req.params.city;

    // Step 1: convert city name to lat/lon (geocoding, no key needed)
    const geoRes = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );

    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      return res.status(404).json({ error: "City not found" });
    }

    const { latitude, longitude, name } = geoRes.data.results[0];

    // Step 2: get current weather for that lat/lon
    const weatherRes = await axios.get(
  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
);

res.json({
  city: name,
  temperature: weatherRes.data.current.temperature_2m,
  humidity: weatherRes.data.current.relative_humidity_2m,
  windspeed: weatherRes.data.current.wind_speed_10m,
  weathercode: weatherRes.data.current.weather_code,
});
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

module.exports = router;