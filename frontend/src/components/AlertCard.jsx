import {
  FaTriangleExclamation,
  FaCircleCheck,
  FaBoltLightning,
} from "react-icons/fa6";

function AlertCard({ faultAlert }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full hover:shadow-lg transition-all duration-300">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
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

      {faultAlert ? (
        <div className="space-y-4">

  {/* Alert 1 */}
  <div className="border rounded-xl p-4 bg-red-50 border-red-200">
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
        <FaTriangleExclamation />
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          🔴 Water Cooler
        </h3>

        <p className="text-sm text-gray-600 leading-6 mt-1">
          Consuming{" "}
          <span className="font-semibold text-red-600">
            {faultAlert.percent}% more electricity
          </span>{" "}
          than normal. Possible cooling inefficiency or prolonged usage.
        </p>
      </div>
    </div>
  </div>

  {/* Alert 2 */}
  <div className="border rounded-xl p-4 bg-yellow-50 border-yellow-200">
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
        <FaBoltLightning />
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          🟡 Peak Hour Usage
        </h3>

        <p className="text-sm text-gray-600 leading-6 mt-1">
          High electricity usage detected between <span className="font-semibold">6:00 PM – 9:00 PM</span>. Running heavy appliances during off-peak hours may reduce your bill.
        </p>
      </div>
    </div>
  </div>

  {/* Alert 3 */}
  <div className="border rounded-xl p-4 bg-blue-50 border-blue-200">
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
        <FaCircleCheck />
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          🔵 AI Recommendation
        </h3>

        <p className="text-sm text-gray-600 leading-6 mt-1">
          Setting your AC temperature between <span className="font-semibold">24°C–26°C</span> could reduce energy consumption by up to <span className="font-semibold text-green-600">10%</span>.
        </p>
      </div>
    </div>
  </div>

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