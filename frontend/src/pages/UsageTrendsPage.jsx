import { useBill } from "../context/BillContext";
import UsageChart from "../components/UsageChart";

function UsageTrendsPage() {
  const { bills } = useBill();

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold">Usage Trends</h1>
        <p className="mt-3 text-orange-100 max-w-3xl leading-7">
          Your monthly electricity consumption over time.
        </p>
      </div>

      <UsageChart data={bills} />
    </div>
  );
}

export default UsageTrendsPage;