import { useBill } from "../context/BillContext";
import DailyUsageChart from "../components/DailyUsageChart";

function DailyUsagePage() {
  const { latestBill } = useBill();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Daily Usage</h1>
        <p className="text-gray-500 mt-2">Your day-by-day electricity consumption this billing cycle.</p>
      </div>

      {!latestBill ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
          Loading your usage data...
        </div>
      ) : (
        <DailyUsageChart latestUnits={latestBill.units} />
      )}
    </div>
  );
}

export default DailyUsagePage;