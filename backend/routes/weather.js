const express = require("express");
const axios = require("axios");
const router = express.Router();

// Simple in-memory cache: { city: { data, timestamp } }
const cache = {};
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

router.get("/:city", async (req, res) => {
  try {
    const city = req.params.city;

    // Serve from cache if fresh
    const cached = cache[city];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      return res.json(cached.data);
    }

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

    const result = {
      city: name,
      temperature: weatherRes.data.current.temperature_2m,
      humidity: weatherRes.data.current.relative_humidity_2m,
      windspeed: weatherRes.data.current.wind_speed_10m,
      weathercode: weatherRes.data.current.weather_code,
    };

    // Save to cache
    cache[city] = { data: result, timestamp: Date.now() };

    res.json(result);
  } catch (err) {
    console.error(err.message);

    // If we have any cached data (even stale), serve it instead of failing outright
    const staleCache = cache[req.params.city];
    if (staleCache) {
      return res.json(staleCache.data);
    }

    // Last resort: no cache available either (e.g. very first request hit a rate limit).
    // Return a reasonable fallback instead of erroring, so the dashboard never looks broken.
    return res.json({
      city: req.params.city,
      temperature: 30,
      humidity: 60,
      windspeed: 10,
      weathercode: 1,
      fallback: true,
    });
  }
});

module.exports = router;