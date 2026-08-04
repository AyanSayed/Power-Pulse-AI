import { useEffect, useState } from "react";
import apiClient from "../services/apiClient";
import { FaBolt } from "react-icons/fa";

const ZONE_STYLES = {
  green: {
    bar: "bg-green-500",
    text: "text-green-600",
    soft: "bg-green-50",
    dot: "🟢",
    label: "Safe",
  },
  yellow: {
    bar: "bg-yellow-400",
    text: "text-yellow-600",
    soft: "bg-yellow-50",
    dot: "🟡",
    label: "Approaching Border",
  },
  red: {
    bar: "bg-red-500",
    text: "text-red-600",
    soft: "bg-red-50",
    dot: "🔴",
    label: "Slab Breach",
  },
};

function RunRateGauge() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchRunRate() {
      try {
        const res = await apiClient.get("/api/meter-reading/run-rate");
        if (!cancelled) {
          setData(res.data);
          setError(false);
        }
      } catch (err) {
        console.error("Run-rate fetch error:", err.message);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRunRate();
    const interval = setInterval(fetchRunRate, 30000); // refresh every 30s

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-pulse">
        <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
        <div className="h-3 w-full bg-gray-200 rounded-full mb-4" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <p className="text-sm text-gray-500">
          Couldn't load your energy run rate. Check back shortly.
        </p>
      </div>
    );
  }

  const { unitsSoFar, projected, slabLimit, zone, daysElapsed, daysInMonth } = data;
  const zoneStyle = ZONE_STYLES[zone] || ZONE_STYLES.green;

  // Bar shows progress of PROJECTED usage against the slab, capped at 100% visually
  const barPercent = Math.min((projected / slabLimit) * 100, 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <FaBolt />
          </span>
          <h3 className="text-lg font-semibold text-gray-900">
            Energy Budget Run Rate
          </h3>
        </div>

        <span className={`text-sm font-semibold ${zoneStyle.text}`}>
          {zoneStyle.dot} {zoneStyle.label}
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Day {Math.round(daysElapsed)} of {daysInMonth} · {unitsSoFar} units used so far
      </p>

      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full ${zoneStyle.bar} transition-all duration-700`}
          style={{ width: `${barPercent}%` }}
        />
      </div>

      <div className="flex items-baseline justify-between">
        <p className="text-sm text-gray-600">
          On your current trajectory, you'll finish the month at{" "}
          <span className={`font-bold ${zoneStyle.text}`}>{projected} units</span>
        </p>
        <p className="text-xs text-gray-400">Slab limit: {slabLimit}</p>
      </div>
    </div>
  );
}

export default RunRateGauge;
