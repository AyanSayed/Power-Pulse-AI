import { useEffect, useRef, useState } from "react";
import apiClient from "../services/apiClient";

const HIGHLIGHT_DURATION = 900; // ms, how long a value stays highlighted after changing

// Visual identity per appliance: icon, colored badge, and a short subtitle.
const APPLIANCE_META = {
  AC: { label: "Air Conditioner", icon: "ac_unit" },
  WaterHeater: { label: "Water Heater", icon: "water_heater" },
  Refrigerator: { label: "Refrigerator", icon: "kitchen" },
  WashingMachine: { label: "Washing Machine", icon: "local_laundry_service" },
  TV: { label: "TV", icon: "tv" },
  Lights: { label: "Lights", icon: "lightbulb" },
  Others: { label: "Other Appliances", icon: "bolt" },
};

// Consistent dark navy blue for every appliance icon box.
const ICON_BG = "bg-[#1E3A8A]";
const ICON_FG = "text-white";

function getMeta(name) {
  return APPLIANCE_META[name] || { label: name, icon: "bolt" };
}

function AppliancePastReadingsModal({ onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiClient.get("/api/meter-reading");
        const docs = Array.isArray(res.data) ? res.data : [];

        const todayStr = new Date().toDateString();
        const todaysDocs = docs.filter(
          (d) => d.receivedAt && new Date(d.receivedAt).toDateString() === todayStr
        );

        // Flatten into one row per appliance reading, newest first.
        const flat = [];
        todaysDocs.forEach((doc) => {
          (doc.readings || []).forEach((r) => {
            flat.push({ ...r, receivedAt: doc.receivedAt });
          });
        });
        flat.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));

        setRows(flat);
        setLoading(false);
      } catch (err) {
        console.error("History fetch failed:", err);
        setError("Could not load past readings.");
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Today's Past Readings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-grow">
          {loading && <p className="p-6 text-gray-500">Loading history...</p>}
          {error && <p className="p-6 text-red-500">{error}</p>}
          {!loading && !error && rows.length === 0 && (
            <p className="p-6 text-gray-500">No readings recorded today yet.</p>
          )}
          {!loading && !error && rows.length > 0 && (
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Appliance</th>
                  <th className="px-6 py-3">Voltage (V)</th>
                  <th className="px-6 py-3">Current (A)</th>
                  <th className="px-6 py-3">Power (W)</th>
                  <th className="px-6 py-3">Fault</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${r.fault ? "bg-red-50/50" : ""}`}>
                    <td className="px-6 py-2 text-gray-500">
                      {new Date(r.receivedAt).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-2 font-medium text-gray-900">{getMeta(r.appliance).label}</td>
                    <td className="px-6 py-2">{r.voltage}</td>
                    <td className="px-6 py-2">{r.current}</td>
                    <td className={`px-6 py-2 font-semibold ${r.fault ? "text-red-600" : ""}`}>{r.power}</td>
                    <td className="px-6 py-2">
                      {r.fault ? (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          Fault
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function LiveMeter() {
  const [readings, setReadings] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // { [appliance]: { power: timestamp, ... } } — tracks which values just changed, to flash them
  const [flash, setFlash] = useState({});
  const prevReadingsRef = useRef({});

  // Ticks every second purely to re-render the "updated Xs ago" freshness label —
  // without this, that label would only update when a new reading arrives, which
  // is exactly the ambiguity we're trying to remove (is it live, or just stuck?).
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const tick = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchLatest = async () => {
      try {
        const res = await apiClient.get("/api/meter-reading?limit=1");
        const data = Array.isArray(res.data) ? res.data : [];
        const latest = data[0];
        if (!isMounted) return;

        if (!latest || !Array.isArray(latest.readings)) {
          setLoading(false);
          return;
        }

        const prevByAppliance = prevReadingsRef.current;
        const now = Date.now();
        const newFlash = {};

        latest.readings.forEach((r) => {
          const prev = prevByAppliance[r.appliance];
          if (prev) {
            const changed = {};
            if (prev.voltage !== r.voltage) changed.voltage = now;
            if (prev.current !== r.current) changed.current = now;
            if (prev.power !== r.power) changed.power = now;
            if (prev.fault !== r.fault) changed.fault = now;
            if (Object.keys(changed).length > 0) newFlash[r.appliance] = changed;
          }
        });

        const nextPrev = {};
        latest.readings.forEach((r) => {
          nextPrev[r.appliance] = r;
        });
        prevReadingsRef.current = nextPrev;

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
    const interval = setInterval(fetchLatest, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (Object.keys(flash).length === 0) return;
    const timeout = setTimeout(() => {
      setFlash((old) => {
        const now = Date.now();
        const next = {};
        for (const appliance of Object.keys(old)) {
          const kept = {};
          for (const field of Object.keys(old[appliance])) {
            if (now - old[appliance][field] < HIGHLIGHT_DURATION) kept[field] = old[appliance][field];
          }
          if (Object.keys(kept).length > 0) next[appliance] = kept;
        }
        return next;
      });
    }, HIGHLIGHT_DURATION);
    return () => clearTimeout(timeout);
  }, [flash]);

  const isFlashing = (appliance, field) => Boolean(flash[appliance]?.[field]);

  if (loading) return <p className="text-gray-400 p-6">Loading live readings...</p>;
  if (error) return <p className="text-red-500 p-6">{error}</p>;

  return (
    <div className="p-6 md:p-8 w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Live Smart Meter</h1>
        <p className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
          <span>Polling every 1.5 seconds</span>
          {lastUpdated && (() => {
            const secondsAgo = Math.max(0, Math.round((nowTick - new Date(lastUpdated).getTime()) / 1000));
            const isStale = secondsAgo > 20;
            return (
              <span className={`inline-flex items-center gap-1.5 font-medium ${isStale ? "text-amber-600" : "text-emerald-600"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isStale ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
                {isStale
                  ? `No new data in ${secondsAgo}s — check the simulator/backend`
                  : `Updated ${secondsAgo}s ago`}
              </span>
            );
          })()}
        </p>
      </div>

      {readings.length === 0 && (
        <p className="text-gray-400">No readings yet. Make sure your ESP32 simulator is running.</p>
      )}

      <div className="space-y-4">
        {readings.map((r) => {
          const meta = getMeta(r.appliance);
          const flashing = isFlashing(r.appliance, "power");
          return (
            <div
              key={r.appliance}
              className={`bg-white rounded-2xl border shadow-sm hover:shadow-md p-6 flex items-center justify-between transition-all duration-300 ${
                r.fault ? "border-red-200 bg-red-50/40" : "border-gray-100"
              } ${flashing ? "ring-2 ring-amber-300" : ""}`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${ICON_BG}`}>
                  <span className={`material-symbols-outlined text-3xl ${ICON_FG}`}>{meta.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{meta.label}</h3>
                  <p className="text-base text-gray-500 mt-0.5">
                    {r.voltage}V &middot; {r.current}A
                  </p>
                  <span
                    className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      r.fault ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {r.fault ? "Fault detected" : "Running normally"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Current Draw</p>
                <p className={`text-3xl font-extrabold mt-1 ${r.fault ? "text-red-600" : "text-emerald-600"}`}>
                  {r.power}
                  <span className="text-lg font-semibold ml-1">W</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {readings.length > 0 && (
        <button
          onClick={() => setShowHistory(true)}
          className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          See your past readings today
        </button>
      )}

      {showHistory && <AppliancePastReadingsModal onClose={() => setShowHistory(false)} />}
    </div>
  );
}

export default LiveMeter;
