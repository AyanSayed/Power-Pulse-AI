import {
  FaTriangleExclamation,
  FaCircleCheck,
  FaBoltLightning,
} from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useBill } from "../context/BillContext";
import { generateAllDiagnostics } from "../utils/diagnosticsEngine";

function AlertCard({ limit, showViewAll = false }) {
  const { trendPercent, applianceBreakdown, weatherTemp, latestBill } = useBill();

  const diagnostics = generateAllDiagnostics({
    trendPercent,
    applianceBreakdown,
    weatherTemp,
    latestBill,
  });

  const visible = limit ? diagnostics.slice(0, limit) : diagnostics;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full hover:shadow-lg transition-all duration-300">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 text-xl">
            <FaBoltLightning />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Alerts & Status
            </h2>
            <p className="text-sm text-gray-500">
              Monitor unusual energy usage
            </p>
          </div>
        </div>

        {showViewAll && diagnostics.length > 0 && (
          <Link
            to="/ai-insights/alerts"
            className="text-sm text-red-600 hover:text-red-700 font-medium whitespace-nowrap"
          >
            View All →
          </Link>
        )}
      </div>

      {visible.length > 0 ? (
        <div className="space-y-4">
          {visible.map((d, index) => (
            <div key={index} className="border rounded-xl p-4 bg-red-50 border-red-200">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <FaTriangleExclamation />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    🔴 {d.appliance}
                    {d.appliance !== "Unusual usage" && " health check"}
                  </h3>

                  <p className="text-sm text-gray-600 leading-6 mt-1">
                    <span className="font-semibold text-red-600">
                      {d.percent}% higher
                    </span>{" "}
                    than a healthy baseline. {d.cause}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Potential monthly impact:{" "}
                    <span className="font-semibold text-red-600">₹{d.impactRs}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-xl p-4 bg-green-50 border-green-200">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <FaCircleCheck />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                All Systems Normal
              </h3>

              <p className="text-sm text-gray-600 leading-6 mt-1">
                No abnormal appliance usage detected.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AlertCard;