import { Link } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { FaArrowRight } from "react-icons/fa";

function UsageMiniChart({ data }) {
  const chartData = Array.isArray(data)
    ? data.map((b) => ({ month: b.month, units: b.units }))
    : [];

  return (
    <Link
      to="/ai-insights/usage-trends"
      className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-amber p-6 card-lift block hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg font-semibold text-ink">Monthly Usage</h2>
        <span className="flex items-center gap-2 text-amber font-medium text-sm">
          View trends <FaArrowRight size={12} />
        </span>
      </div>

      <ResponsiveContainer width="100%" height={90}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="usageMiniFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5B400" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#F5B400" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="units"
            stroke="#F5B400"
            strokeWidth={2.5}
            fill="url(#usageMiniFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Link>
  );
}

export default UsageMiniChart;