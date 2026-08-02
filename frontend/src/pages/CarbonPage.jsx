import { useBill } from "../context/BillContext";
import CarbonFootprint from "../components/CarbonFootprint";
import { Link } from "react-router-dom";

function CarbonPage() {
  const { carbonKg, trendPercent, dataTier } = useBill();

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold">Carbon Footprint</h1>
        <p className="mt-3 text-green-100 max-w-3xl leading-7">
          Your estimated CO₂ emissions from electricity usage this month.
        </p>
      </div>

      {dataTier >= 2 ? (
        <CarbonFootprint kg={carbonKg} trendPercent={trendPercent} />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unlock your carbon footprint
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-5">
            This estimate is based on your appliance mix, which we don't have
            enough signal for yet. Complete a quick appliance checklist to
            unlock it.
          </p>
          <Link
            to="/profile/appliance-profile"
            className="inline-block bg-green-600 text-white font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition"
          >
            Complete Appliance Checklist
          </Link>
        </div>
      )}
    </div>
  );
}

export default CarbonPage;