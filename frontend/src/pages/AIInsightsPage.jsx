import { useBill } from "../context/BillContext";
import AIInsights from "../components/AIInsights";
import Recommendations from "../components/Recommendations";
import ApplianceBreakdown from "../components/ApplianceBreakdown";
import AlertCard from "../components/AlertCard";
import WeatherCard from "../components/WeatherCard";
import CarbonFootprint from "../components/CarbonFootprint";

function AIInsightsPage() {
  const {
    aiExplanation,
    trendPercent,
    predictedBill,
    weatherTemp,
    faultAlert,
    applianceBreakdown,
    carbonKg,
  } = useBill();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold">
          AI Insights
        </h1>
        <p className="mt-3 text-blue-100 max-w-3xl leading-7">
          Your personal AI energy assistant analyzes electricity usage,
          predicts future bills, detects abnormal consumption and provides
          personalized recommendations to help reduce costs.
        </p>
      </div>

      {/* AI Analysis */}
      <AIInsights
        explanation={aiExplanation}
        trendPercent={trendPercent}
        predictedBill={predictedBill}
        weatherTemp={weatherTemp}
        faultAlert={faultAlert}
      />

      {/* Recommendations + Alerts (previews) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Recommendations limit={2} showViewAll />
        <AlertCard limit={1} showViewAll />
      </div>

      {/* Appliances + Weather */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ApplianceBreakdown
          data={applianceBreakdown}
        />
        <WeatherCard />
      </div>

      {/* Carbon */}
      <CarbonFootprint
        kg={carbonKg}
        trendPercent={trendPercent}
      />
    </div>
  );
}

export default AIInsightsPage;