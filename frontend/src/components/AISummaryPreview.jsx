import { Link } from "react-router-dom";
import { FaRobot } from "react-icons/fa6";
import { useBill } from "../context/BillContext";
import ViewMoreButton from "./ViewMoreButton";

function AISummaryPreview() {
  const { aiExplanation, estimatedBillRange, trendPercent } = useBill();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
          <FaRobot />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI Summary</h2>
          <p className="text-sm text-gray-500">Quick overview</p>
        </div>
      </div>

      <p className="text-gray-700 leading-7 line-clamp-2">{aiExplanation}</p>

      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        <div>
          <p className="text-xs text-gray-500">Estimated next bill</p>
          <p className="text-xl font-bold text-indigo-600">
            ₹{estimatedBillRange.low.toLocaleString("en-IN")}–₹{estimatedBillRange.high.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-500">{estimatedBillRange.confidence}</p>
        </div>
        <div className={`text-sm font-semibold ${trendPercent > 0 ? "text-red-600" : "text-green-600"}`}>
          {trendPercent > 0 ? "+" : ""}
          {trendPercent.toFixed(0)}%
        </div>
      </div>

      <ViewMoreButton to="/ai-insights" label="View Full AI Insights" accent="indigo" />
    </div>
  );
}

export default AISummaryPreview;
