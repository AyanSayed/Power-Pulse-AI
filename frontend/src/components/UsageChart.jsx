import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

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

function UsageChart({ data }) {
  const chartData = Array.isArray(data) ? data.map((b) => ({ month: b.month, units: b.units })) : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-amber p-6 card-lift">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl font-semibold text-ink">Monthly Usage</h2>
        <span className="text-xs text-slate tabular">Units in kWh</span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5B400" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#F5B400" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#F5B400", strokeWidth: 1, strokeDasharray: "4 4" }} />
          <Area
            type="monotone"
            dataKey="units"
            stroke="#F5B400"
            strokeWidth={3}
            fill="url(#usageFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default UsageChart;
