import { useEffect, useState } from "react";
import apiClient from "../services/apiClient";

const NIGHT_START_HOUR = 23;
const NIGHT_END_HOUR = 6;
const ALERT_WATT_THRESHOLD = 50;

function isNightWindow(date = new Date()) {
  const h = date.getHours();
  return h >= NIGHT_START_HOUR || h < NIGHT_END_HOUR;
}

function MeterWidget() {
  const [summary, setSummary] = useState({ todayUnits: 0, yesterdayUnits: 0 });
  const [awayMode, setAwayMode] = useState(() => localStorage.getItem("awayMode") === "true");
  const [totalPower, setTotalPower] = useState(0);
  const [alert, setAlert] = useState(null);
  const [nightNow, setNightNow] = useState(isNightWindow());

  useEffect(() => {
    localStorage.setItem("awayMode", awayMode);
  }, [awayMode]);

  useEffect(() => {
    let isMounted = true;

    const fetchSummary = async () => {
      try {
        const res = await apiClient.get("/api/meter-reading/daily-summary");
        if (isMounted) setSummary(res.data);
      } catch (err) {
        console.error("Daily summary fetch failed:", err);
      }
    };

    const fetchLatestPower = async () => {
      try {
        const res = await apiClient.get("/api/meter-reading?limit=1");
        const data = Array.isArray(res.data) ? res.data : [];
        const latest = data[0];
        if (!isMounted || !latest) return;

        const watts = (latest.readings || []).reduce((sum, r) => sum + (r.power || 0), 0);
        setTotalPower(watts);

        const nowNight = isNightWindow();
        setNightNow(nowNight);

        if ((awayMode || nowNight) && watts > ALERT_WATT_THRESHOLD) {
          setAlert({
            watts,
            reason: awayMode && nowNight ? "away + night" : awayMode ? "away" : "night",
            time: new Date(latest.receivedAt).toLocaleTimeString(),
          });
        } else {
          setAlert(null);
        }
      } catch (err) {
        console.error("Live power fetch failed:", err);
      }
    };

    fetchSummary();
    fetchLatestPower();
    const summaryInterval = setInterval(fetchSummary, 60000);
    const powerInterval = setInterval(fetchLatestPower, 1500);

    return () => {
      isMounted = false;
      clearInterval(summaryInterval);
      clearInterval(powerInterval);
    };
  }, [awayMode]);

  const diff = summary.todayUnits - summary.yesterdayUnits;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Live Meter</h3>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={awayMode}
            onChange={(e) => setAwayMode(e.target.checked)}
          />
          Away from home
        </label>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span>Today: <strong>{summary.todayUnits}</strong> units</span>
        <span>Yesterday: <strong>{summary.yesterdayUnits}</strong> units</span>
        <span className={diff > 0 ? "text-red-600" : "text-green-600"}>
          {diff === 0 ? "same as yesterday" : `${diff > 0 ? "+" : ""}${diff.toFixed(2)} vs yesterday`}
        </span>
      </div>

      {nightNow && (
        <div className="text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full px-3 py-1 inline-block">
          Night mode active (11pm–6am)
        </div>
      )}

      {alert && (
        <div className="border border-amber-200 bg-amber-50 rounded-xl p-3 text-sm text-amber-800 flex items-center justify-between">
          <span>⚠ {alert.watts}W drawn ({alert.reason}) at {alert.time}</span>
        </div>
      )}
    </div>
  );
}

export default MeterWidget;