import { useBill } from "../context/BillContext";
import CarbonFootprint from "../components/CarbonFootprint";

function CarbonPage() {
  const { carbonKg, trendPercent } = useBill();

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold">Carbon Footprint</h1>
        <p className="mt-3 text-green-100 max-w-3xl leading-7">
          Your estimated CO₂ emissions from electricity usage this month.
        </p>
      </div>

      <CarbonFootprint kg={carbonKg} trendPercent={trendPercent} />
    </div>
  );
}

export default CarbonPage;