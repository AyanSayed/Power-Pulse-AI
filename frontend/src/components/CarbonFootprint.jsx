import { FaLeaf, FaCarSide, FaTree } from "react-icons/fa6";
import CountUp from "./CountUp";

function CarbonFootprint({ kg, trendPercent }) {
  const better = trendPercent <= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 text-xl">
          <FaLeaf />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Carbon Footprint
          </h2>

          <p className="text-sm text-gray-500">
            Your environmental impact this month
          </p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-4xl font-bold text-gray-900">
          <CountUp end={kg} suffix=" kg" />
        </p>

        <p
          className={`mt-2 text-sm font-medium ${
            better ? "text-green-600" : "text-red-600"
          }`}
        >
          {better ? "↓ Lower than last month" : "↑ Higher than last month"}
        </p>
      </div>

      <div className="space-y-3">

        <div className="flex items-center gap-3 border rounded-xl p-3">
          <FaCarSide className="text-blue-600" />
          <div>
            <p className="font-medium text-gray-900">
              Equivalent to driving
            </p>
            <p className="text-sm text-gray-500">
              ~{Math.round(kg * 5.5)} km by petrol car
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border rounded-xl p-3">
          <FaTree className="text-green-600" />
          <div>
            <p className="font-medium text-gray-900">
              Sustainability
            </p>
            <p className="text-sm text-gray-500">
              {better
                ? "Great! Your emissions decreased."
                : "Reducing AC usage can lower emissions."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CarbonFootprint;