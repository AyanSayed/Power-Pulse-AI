import {
  FaRobot,
  FaArrowTrendUp,
  FaTemperatureHigh,
  FaTriangleExclamation,
  FaCircleCheck,
} from "react-icons/fa6";

function AIInsights({
  explanation,
  trendPercent,
  predictedBill,
  weatherTemp,
  faultAlert,
}) {
  const status =
    trendPercent > 5
      ? {
          text: "🔴 High Usage",
          color: "bg-red-100 text-red-600",
        }
      : trendPercent < -3
      ? {
          text: "🟢 Excellent",
          color: "bg-green-100 text-green-600",
        }
      : {
          text: "🟡 Moderate",
          color: "bg-yellow-100 text-yellow-700",
        };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full hover:shadow-lg transition-all duration-300">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl">
            <FaRobot />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              AI Analysis
            </h2>
            <p className="text-sm text-gray-500">
              Smart insights generated from your usage
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}
        >
          {status.text}
        </span>
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border">
        <p className="text-[17px] leading-8 text-gray-700">
          {explanation}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">

        <div className="border rounded-xl p-4 hover:shadow-sm transition">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <FaArrowTrendUp />
            <span className="text-sm font-medium">
              Predicted Bill
            </span>
          </div>

          <p className="text-3xl font-bold text-gray-900">
            ₹{(predictedBill ?? 0).toLocaleString("en-IN")}
          </p>

          <p className="text-xs text-gray-500 mt-2">
            Expected next billing cycle
          </p>
        </div>

        <div className="border rounded-xl p-4 hover:shadow-sm transition">
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <FaTemperatureHigh />
            <span className="text-sm font-medium">
              Weather
            </span>
          </div>

          <p className="text-3xl font-bold text-gray-900">
            {weatherTemp}°C
          </p>

          <p className="text-xs text-gray-500 mt-2">
            Outdoor temperature
          </p>
        </div>

      </div>

      {/* Bottom Status */}
      <div className="border-t pt-5">

        {faultAlert ? (
          <div className="flex gap-3">

            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <FaTriangleExclamation />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                {faultAlert.appliance}
              </h3>

              <p className="text-sm text-gray-600 leading-6">
                Usage is{" "}
                <span className="font-semibold text-red-600">
                  {faultAlert.percent}% higher
                </span>{" "}
                than normal. This could indicate abnormal consumption or an
                appliance fault.
              </p>
            </div>

          </div>
        ) : (
          <div className="flex gap-3">

            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <FaCircleCheck />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                System Healthy
              </h3>

              <p className="text-sm text-gray-600 leading-6">
                No unusual appliance activity detected. Your home's energy
                consumption appears normal.
              </p>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default AIInsights;