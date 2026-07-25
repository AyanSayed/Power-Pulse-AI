import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts";

const DAY_LABELS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
// Rough weekday shape (weekend usage tends to run higher) applied to the
// latest bill's average daily units. Replace with real daily meter data
// once that feed exists.
const MULTIPLIERS = [0.9, 0.95, 0.85, 1.05, 1.0, 1.25, 0.95];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-navy text-white rounded-lg px-4 py-2.5 shadow-lg border border-navy-border">
      <p className="text-xs text-gray-300 mb-1">{label}</p>
      <p className="tabular text-sm font-semibold">
        <span className="inline-block w-2 h-2 rounded-full bg-amber mr-2" />
        {payload[0].value} kWh
      </p>
    </div>
  );
}

function DailyUsageChart({ latestUnits = 0 }) {
  const base = latestUnits / 7;
  const data = DAY_LABELS.map((day, i) => ({
    day,
    units: Math.round(base * MULTIPLIERS[i]),
  }));
  const peakIndex = data.reduce((maxIdx, d, i, arr) => (d.units > arr[maxIdx].units ? i : maxIdx), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-teal p-6 card-lift">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl font-semibold text-ink">Daily Consumption</h2>
        <span className="text-xs text-slate tabular">This week, kWh</span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F3" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(245,180,0,0.08)" }} />
          <Bar dataKey="units" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === peakIndex ? "#2DD4BF" : "#F5B400"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DailyUsageChart;
