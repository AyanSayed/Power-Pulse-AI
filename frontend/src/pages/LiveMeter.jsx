import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// How long a cell stays highlighted after its value changes (ms)
const HIGHLIGHT_DURATION = 900;

function LiveMeter() {
  const [readings, setReadings] = useState([]); // current appliance readings array
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tracks which cells recently changed, so we can flash them.
  // Shape: { [appliance]: { voltage: timestamp, current: timestamp, power: timestamp, fault: timestamp } }
  const [flash, setFlash] = useState({});

  // Keep the previous reading around (without triggering re-renders) so we can diff against it.
  const prevReadingsRef = useRef({});

  useEffect(() => {
    let isMounted = true;

    const fetchLatest = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/meter-reading?limit=1`);
        const data = Array.isArray(res.data) ? res.data : [];
        const latest = data[0];

        if (!isMounted) return;

        if (!latest || !Array.isArray(latest.readings)) {
          setLoading(false);
          return;
        }

        // Diff against previous values, per appliance, per field.
        const prevByAppliance = prevReadingsRef.current;
        const newFlash = {};
        const now = Date.now();

        latest.readings.forEach((r) => {
          const prev = prevByAppliance[r.appliance];
          if (prev) {
            const changed = {};
            if (prev.voltage !== r.voltage) changed.voltage = now;
            if (prev.current !== r.current) changed.current = now;
            if (prev.power !== r.power) changed.power = now;
            if (prev.fault !== r.fault) changed.fault = now;
            if (Object.keys(changed).length > 0) {
              newFlash[r.appliance] = changed;
            }
          }
        });

        // Update the "previous" snapshot for next time.
        const nextPrevByAppliance = {};
        latest.readings.forEach((r) => {
          nextPrevByAppliance[r.appliance] = r;
        });
        prevReadingsRef.current = nextPrevByAppliance;

        setReadings(latest.readings);
        setLastUpdated(latest.receivedAt);
        setFlash((old) => ({ ...old, ...newFlash }));
        setError(null);
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error("Live meter fetch failed:", err);
        setError("Could not load live readings.");
        setLoading(false);
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Clear individual cell flashes after the highlight duration elapses.
  useEffect(() => {
    if (Object.keys(flash).length === 0) return;
    const timeout = setTimeout(() => {
      setFlash((old) => {
        const now = Date.now();
        const next = {};
        for (const appliance of Object.keys(old)) {
          const fields = old[appliance];
          const keptFields = {};
          for (const field of Object.keys(fields)) {
            if (now - fields[field] < HIGHLIGHT_DURATION) {
              keptFields[field] = fields[field];
            }
          }
          if (Object.keys(keptFields).length > 0) {
            next[appliance] = keptFields;
          }
        }
        return next;
      });
    }, HIGHLIGHT_DURATION);
    return () => clearTimeout(timeout);
  }, [flash]);

  const isFlashing = (appliance, field) => Boolean(flash[appliance]?.[field]);

  if (loading) return <p className="text-gray-400 p-6">Loading live readings...</p>;
  if (error) return <p className="text-red-400 p-6">{error}</p>;
  if (readings.length === 0)
    return (
      <p className="text-gray-400 p-6">
        No readings yet. Make sure your ESP32 simulator is running.
      </p>
    );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Live Smart Meter</h1>
      <p className="text-sm text-slate">
        Auto-refreshes every 5 seconds
        {lastUpdated && (
          <span className="text-gray-500">
            {" "}
            &middot; Last update: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </p>

      <div className="bg-navy-light rounded-xl p-4 border border-navy-border overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead>
            <tr className="text-slate border-b border-navy-border">
              <th className="py-2">Appliance</th>
              <th>Voltage (V)</th>
              <th>Current (A)</th>
              <th>Power (W)</th>
              <th>Fault</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((r) => (
              <tr
                key={r.appliance}
                className={r.fault ? "text-red-400" : ""}
              >
                <td className="py-2">{r.appliance}</td>
                <td
                  className={`transition-colors duration-700 rounded px-1 ${
                    isFlashing(r.appliance, "voltage")
                      ? "bg-yellow-400/30 text-white"
                      : ""
                  }`}
                >
                  {r.voltage}
                </td>
                <td
                  className={`transition-colors duration-700 rounded px-1 ${
                    isFlashing(r.appliance, "current")
                      ? "bg-yellow-400/30 text-white"
                      : ""
                  }`}
                >
                  {r.current}
                </td>
                <td
                  className={`transition-colors duration-700 rounded px-1 ${
                    isFlashing(r.appliance, "power")
                      ? "bg-yellow-400/30 text-white"
                      : ""
                  }`}
                >
                  {r.power}
                </td>
                <td
                  className={`transition-colors duration-700 rounded px-1 ${
                    isFlashing(r.appliance, "fault")
                      ? "bg-yellow-400/30 text-white"
                      : ""
                  }`}
                >
                  {r.fault ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LiveMeter;