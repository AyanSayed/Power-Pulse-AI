import CountUp from "./CountUp";

function SummaryCard({
  title,
  value,
  unit = "",
  icon,
  color = "indigo",
  subtitle,
}) {
  const colors = {
    indigo: "bg-indigo-100 text-indigo-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <h2 className="text-3xl font-bold text-gray-900 mt-2">
            {typeof value === "number" ? (
              <>
                <CountUp end={value} />
                {unit}
              </>
            ) : (
              value
            )}
          </h2>

          {subtitle && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${colors[color]}`}
        >
          {icon}
        </div>
      </div>

    </div>
  );
}

export default SummaryCard;