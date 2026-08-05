import { useEffect, useRef, useState } from "react";
import apiClient from "../services/apiClient";
import MeterWidget from "../components/MeterWidget";
import { billForUnits } from "../utils/slabRates";

const HIGHLIGHT_DURATION = 900; // ms, how long the total-power value stays highlighted after changing
const HISTORY_LIMIT = 100; // how many past readings to pull for the history table

function ReadingsHistoryModal({ onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiClient.get(`/api/meter-reading?limit=${HISTORY_LIMIT}`);
        const docs = Array.isArray(res.data) ? res.data : [];

        const todayStr = new Date().toDateString();
        const todaysDocs = docs.filter(
          (d) => d.receivedAt && new Date(d.receivedAt).toDateString() === todayStr
        );

        // Oldest-first so we can accumulate a running total, then reverse for display.
        const sorted = [...todaysDocs].sort(
          (a, b) => new Date(a.receivedAt) - new Date(b.receivedAt)
        );

        let cumulativeUnits = 0;
        const built = sorted.map((doc, i) => {
          const totalWatts = (doc.readings || []).reduce((sum, r) => sum + (r.power || 0), 0);

          if (i > 0) {
            const prev = sorted[i - 1];
            const prevWatts = (prev.readings || []).reduce((sum, r) => sum + (r.power || 0), 0);
            const dtHours = (new Date(doc.receivedAt) - new Date(prev.receivedAt)) / (1000 * 60 * 60);
            if (dtHours > 0 && dtHours <= 1) {
              cumulativeUnits += ((prevWatts + totalWatts) / 2 * dtHours) / 1000;
            }
          }

          return {
            receivedAt: doc.receivedAt,
            totalWatts: Math.round(totalWatts * 100) / 100,
            cumulativeUnits: Math.round(cumulativeUnits * 1000) / 1000,
            billSoFar: billForUnits(cumulativeUnits),
            fault: (doc.readings || []).some((r) => r.fault),
          };
        });

        setRows(built.reverse()); // newest first for display
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Today's Reading History</h3>
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
                  <th className="px-6 py-3">Total Draw (W)</th>
                  <th className="px-6 py-3">Units So Far Today</th>
                  <th className="px-6 py-3">Bill So Far Today</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${r.fault ? "bg-red-50/50" : ""}`}>
                    <td className="px-6 py-2 text-gray-500">
                      {new Date(r.receivedAt).toLocaleTimeString()}
                    </td>
                    <td className={`px-6 py-2 font-semibold ${r.fault ? "text-red-600" : "text-gray-900"}`}>
                      {r.totalWatts}
                    </td>
                    <td className="px-6 py-2">{r.cumulativeUnits}</td>
                    <td className="px-6 py-2">₹{r.billSoFar}</td>
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
  const [totalWatts, setTotalWatts] = useState(null);
  const [hasFault, setHasFault] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [runRate, setRunRate] = useState(null);

  const [flashPower, setFlashPower] = useState(false);
  const prevWattsRef = useRef(null);

  // Ticks every second purely to re-render the "updated Xs ago" freshness label —
  // without this, that label would only update when a new reading arrives, which
  // is exactly the ambiguity we're trying to remove (is it live, or just stuck?).
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const tick = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Total units consumed + bill so far this month, from the run-rate endpoint.
  useEffect(() => {
    let isMounted = true;

    const fetchRunRate = async () => {
      try {
        const res = await apiClient.get("/api/meter-reading/run-rate");
        if (isMounted) setRunRate(res.data);
      } catch (err) {
        console.error("Run-rate fetch failed:", err);
      }
    };

    fetchRunRate();
    const interval = setInterval(fetchRunRate, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
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

        const watts = latest.readings.reduce((sum, r) => sum + (r.power || 0), 0);
        const roundedWatts = Math.round(watts * 100) / 100;
        const fault = latest.readings.some((r) => r.fault);

        if (prevWattsRef.current !== null && prevWattsRef.current !== roundedWatts) {
          setFlashPower(true);
          setTimeout(() => setFlashPower(false), HIGHLIGHT_DURATION);
        }
        prevWattsRef.current = roundedWatts;

        setTotalWatts(roundedWatts);
        setHasFault(fault);
        setLastUpdated(latest.receivedAt);
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

      {runRate && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Total Power Consumed</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">
              {runRate.unitsSoFar} <span className="text-lg font-semibold">units</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Day {Math.round(runRate.daysElapsed)} of {runRate.daysInMonth}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Bill So Far</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">
              ₹{billForUnits(runRate.unitsSoFar)}
            </p>
          </div>
        </div>
      )}

      {totalWatts !== null && (
        <div
          className={`bg-white rounded-2xl border shadow-sm p-6 flex items-center justify-between transition-all duration-300 ${
            hasFault ? "border-red-200 bg-red-50/40" : "border-gray-100"
          } ${flashPower ? "ring-2 ring-amber-300" : ""}`}
        >
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Current Total Draw</p>
            <p className={`text-3xl font-extrabold mt-1 ${hasFault ? "text-red-600" : "text-emerald-600"}`}>
              {totalWatts}
              <span className="text-lg font-semibold ml-1">W</span>
            </p>
          </div>
          {hasFault && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              Fault detected
            </span>
          )}
        </div>
      )}

      <MeterWidget />

      {totalWatts === null && (
        <p className="text-gray-400">No readings yet. Make sure your ESP32 simulator is running.</p>
      )}

      <button
        onClick={() => setShowHistory(true)}
        className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
      >
        See your reading history today
      </button>

      {showHistory && <ReadingsHistoryModal onClose={() => setShowHistory(false)} />}
    </div>
  );
}

export default LiveMeter;