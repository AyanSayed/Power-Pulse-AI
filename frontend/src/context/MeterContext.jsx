import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const MeterContext = createContext(null);

const DEMO_MODE = true; // flip to false for "real" 30-min cadence
const TICK_INTERVAL_MS = DEMO_MODE ? 3000 : 30 * 60 * 1000;
const NIGHT_START_HOUR = 23; // 11pm
const NIGHT_END_HOUR = 6;    // 6am
const ALERT_DELTA_THRESHOLD = 0; // demo: any nonzero usage triggers it; tune for real meter noise

function isNightWindow(date = new Date()) {
  const h = date.getHours();
  return h >= NIGHT_START_HOUR || h < NIGHT_END_HOUR;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function MeterProvider({ children }) {
  const [readings, setReadings] = useState([]);
  const [awayMode, setAwayMode] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const cumulativeRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      // --- simulate a meter tick; swap this block for a real fetch() later ---
      const delta = Math.round((Math.random() * (DEMO_MODE ? 2 : 0.4)) * 100) / 100;
      cumulativeRef.current += delta;
      const now = new Date();

      const newReading = { timestamp: now, reading: cumulativeRef.current, delta };
      setReadings((prev) => [...prev, newReading]);

      const nightNow = isNightWindow(now);
      if ((awayMode || nightNow) && delta > ALERT_DELTA_THRESHOLD) {
        setAlerts((prev) => [
          {
            id: `${now.getTime()}`,
            timestamp: now,
            delta,
            reason: awayMode && nightNow ? "away + night" : awayMode ? "away" : "night",
          },
          ...prev,
        ]);
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(id);
  }, [awayMode]);

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const todayUsage = readings
    .filter((r) => isSameDay(r.timestamp, now))
    .reduce((sum, r) => sum + r.delta, 0);

  const yesterdayUsage = readings
    .filter((r) => isSameDay(r.timestamp, yesterday))
    .reduce((sum, r) => sum + r.delta, 0);

  const dismissAlert = (id) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  return (
    <MeterContext.Provider
      value={{
        readings,
        currentReading: cumulativeRef.current,
        todayUsage,
        yesterdayUsage,
        awayMode,
        setAwayMode,
        alerts,
        dismissAlert,
        isNightWindow: isNightWindow(now),
      }}
    >
      {children}
    </MeterContext.Provider>
  );
}

export function useMeter() {
  const ctx = useContext(MeterContext);
  if (!ctx) throw new Error("useMeter must be used within MeterProvider");
  return ctx;
}