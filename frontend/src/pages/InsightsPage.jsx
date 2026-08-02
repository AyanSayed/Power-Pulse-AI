import { useBill } from "../context/BillContext";
import AIInsights from "../components/AIInsights";
import Recommendations from "../components/Recommendations";
import AlertCard from "../components/AlertCard";

function InsightsPage() {
  const { aiExplanation, trendPercent, predictedBill, weatherTemp, faultAlert } = useBill();

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold">AI Insights</h1>
        <p className="mt-3 text-blue-100 max-w-3xl leading-7">
          Analysis, recommendations, and alerts based on your current usage pattern.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis</h2>
        <AIInsights
          explanation={aiExplanation}
          trendPercent={trendPercent}
          predictedBill={predictedBill}
          weatherTemp={weatherTemp}
          faultAlert={faultAlert}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommendations</h2>
        <Recommendations />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Alerts</h2>
        <AlertCard />
      </div>
    </div>
  );
}

export default InsightsPage;