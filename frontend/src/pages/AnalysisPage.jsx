import { useBill } from "../context/BillContext";
import AIInsights from "../components/AIInsights";

function AnalysisPage() {
  const { aiExplanation, trendPercent, predictedBill, weatherTemp, faultAlert } = useBill();

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold">AI Analysis</h1>
        <p className="mt-3 text-blue-100 max-w-3xl leading-7">
          A full breakdown of what the AI is seeing in your usage this month.
        </p>
      </div>

      <AIInsights
        explanation={aiExplanation}
        trendPercent={trendPercent}
        predictedBill={predictedBill}
        weatherTemp={weatherTemp}
        faultAlert={faultAlert}
      />
    </div>
  );
}

export default AnalysisPage;