import { FaLightbulb } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useBill } from "../context/BillContext";
import { generateRecommendations } from "../utils/recommendationEngine";

function Recommendations({ limit, showViewAll = false }) {
  const { weatherTemp, latestBill, trendPercent, applianceBreakdown } = useBill();

  const recommendations = generateRecommendations({
    weatherTemp,
    latestBill,
    trendPercent,
    applianceBreakdown,
  });

  const visible = limit ? recommendations.slice(0, limit) : recommendations;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            AI Recommendations
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Personalized suggestions to lower your electricity bill.
          </p>
        </div>

        {showViewAll && recommendations.length > 0 && (
          <Link
            to="/ai-insights/recommendations"
            className="text-sm text-teal-600 hover:text-teal-700 font-medium whitespace-nowrap"
          >
            View All →
          </Link>
        )}
      </div>

      {visible.length > 0 ? (
        <div className="space-y-4">
          {visible.map((item) => (
            <div
              key={item.id}
              className="border rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg text-yellow-600 bg-yellow-100 shrink-0">
                  <FaLightbulb />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-lg font-bold text-green-600 whitespace-nowrap">
                      ₹{item.estimatedSaving}/mo
                    </p>
                  </div>

                  <p className="text-sm text-gray-500 mt-1 leading-6">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Upload a bill to unlock personalized recommendations.
        </p>
      )}
    </div>
  );
}

export default Recommendations;