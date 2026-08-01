import { FaBolt, FaFire, FaCalendarWeek, FaCloudSun } from "react-icons/fa";
import { useBill } from "../context/BillContext";
import DailyUsageChart, { buildDailyUsageData } from "../components/DailyUsageChart";

function DailyUsagePage() {
  const { latestBill, weatherTemp } = useBill();

  if (!latestBill) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Usage</h1>
          <p className="text-gray-500 mt-2">Your day-by-day electricity consumption this billing cycle.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
          Loading your usage data...
        </div>
      </div>
    );
  }

  const data = buildDailyUsageData(latestBill.units);
  const peak = data.reduce((max, d) => (d.units > max.units ? d : max), data[0]);
  const lightest = data.reduce((min, d) => (d.units < min.units ? d : min), data[0]);
  const avgDaily = Math.round(data.reduce((s, d) => s + d.units, 0) / data.length);

  const weekdayTotal = data.slice(0, 5).reduce((s, d) => s + d.units, 0);
  const weekendTotal = data[5].units + data[6].units;
  const weekendVsWeekdayPct = weekdayTotal > 0
    ? Math.round(((weekendTotal / 2 - weekdayTotal / 5) / (weekdayTotal / 5)) * 100)
    : 0;

  const cap = (s) => s.charAt(0) + s.slice(1).toLowerCase();

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold">Daily Usage</h1>
        <p className="mt-3 text-blue-100 max-w-3xl leading-7">
          A day-by-day view of this billing cycle, modeled from your latest bill's average —
          so you can see which days are quietly driving the total up.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-xl bg-coral/10 text-coral flex items-center justify-center">
              <FaFire />
            </span>
            <span className="text-sm text-gray-500">Peak Day</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{cap(peak.day)}</p>
          <p className="text-sm text-gray-500 mt-1">{peak.units} kWh</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center">
              <FaBolt />
            </span>
            <span className="text-sm text-gray-500">Lightest Day</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{cap(lightest.day)}</p>
          <p className="text-sm text-gray-500 mt-1">{lightest.units} kWh</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <FaCalendarWeek />
            </span>
            <span className="text-sm text-gray-500">Daily Average</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgDaily} kWh</p>
          <p className="text-sm text-gray-500 mt-1">Across 7 days</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-xl bg-amber/10 text-amber flex items-center justify-center">
              <FaCloudSun />
            </span>
            <span className="text-sm text-gray-500">Weekend vs Weekday</span>
          </div>
          <p className={`text-2xl font-bold ${weekendVsWeekdayPct >= 0 ? "text-coral" : "text-teal"}`}>
            {weekendVsWeekdayPct >= 0 ? "+" : ""}{weekendVsWeekdayPct}%
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {weekendVsWeekdayPct >= 0 ? "Higher on weekends" : "Lower on weekends"}
          </p>
        </div>
      </div>

      <DailyUsageChart latestUnits={latestBill.units} />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <p className="text-sm text-gray-500 leading-6">
          This chart models a typical weekday/weekend usage pattern applied to your latest
          bill's daily average{weatherTemp != null ? ` — current local weather is around ${Math.round(weatherTemp)}°C` : ""}.
          Once appliance-level or smart-meter data is available, this view will switch to your
          actual day-by-day consumption instead of a modeled estimate.
        </p>
      </div>
    </div>
  );
}

export default DailyUsagePage;