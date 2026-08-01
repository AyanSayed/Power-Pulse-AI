import { FaTriangleExclamation } from "react-icons/fa6";
import { useBill } from "../context/BillContext";
import { generateDiagnostics } from "../utils/diagnosticsEngine";
import ViewMoreButton from "./ViewMoreButton";

function AlertPreview() {
  const { trendPercent, applianceBreakdown, weatherTemp, latestBill } = useBill();

  const alert = generateDiagnostics({ trendPercent, applianceBreakdown, weatherTemp, latestBill });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
          <FaTriangleExclamation />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Active Alert</h2>
          <p className="text-sm text-gray-500">Latest detected issue</p>
        </div>
      </div>

      {alert ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900">
            {alert.appliance}
            {alert.appliance !== "Unusual usage" && " health check"}
          </h3>
          <p className="text-gray-600 mt-2 leading-6">
            <span className="font-semibold text-red-600">{alert.percent}% higher</span> than a healthy
            baseline. {alert.cause}
          </p>
          <p className="text-sm text-gray-500 mt-3">
            Potential monthly impact:{" "}
            <span className="font-semibold text-red-600">₹{alert.impactRs}</span>
          </p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900">All Systems Normal</h3>
          <p className="text-gray-600 mt-2 leading-6">
            No unusual electricity usage has been detected this month.
          </p>
        </div>
      )}

      <ViewMoreButton to="/ai-insights/alerts" accent="red" />
    </div>
  );
}

export default AlertPreview;