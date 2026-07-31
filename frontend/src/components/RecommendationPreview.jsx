import { Link } from "react-router-dom";
import { FaLightbulb, FaArrowRight } from "react-icons/fa6";
import { useBill } from "../context/BillContext";
import { generateRecommendations } from "../utils/recommendationEngine";

function RecommendationPreview() {
  const { weatherTemp, latestBill, trendPercent, applianceBreakdown } = useBill();

  const recommendations = generateRecommendations({
    weatherTemp,
    latestBill,
    trendPercent,
    applianceBreakdown,
  });

  const top = recommendations[0];

  if (!top) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <p className="text-sm text-gray-500">
          Upload a bill to unlock personalized recommendations.
        </p>
      </div>
    );
  }

  return (
    <Link
      to="/ai-insights"
      className="block bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
          <FaLightbulb />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Top Recommendation
          </h2>

          <p className="text-sm text-gray-500">
            Highest potential saving
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900">
          {top.title}
        </h3>

        <p className="text-gray-600 mt-2 leading-6">
          {top.description}
        </p>
      </div>

      <div className="flex justify-between items-center mt-5">
        <div>
          <p className="text-xs text-gray-500">
            Estimated Saving
          </p>

          <p className="text-2xl font-bold text-green-600">
            ₹{top.estimatedSaving}/month
          </p>
        </div>

        <div className="flex items-center gap-2 text-indigo-600 font-medium">
          View More
          <FaArrowRight />
        </div>
      </div>
    </Link>
  );
}

export default RecommendationPreview;