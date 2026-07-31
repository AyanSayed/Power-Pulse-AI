import { useBill } from "../context/BillContext";
import ApplianceBreakdown from "../components/ApplianceBreakdown";

function AppliancesPage() {
  const { applianceBreakdown } = useBill();

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold">Appliance Breakdown</h1>
        <p className="mt-3 text-purple-100 max-w-3xl leading-7">
          See exactly where your electricity is going, appliance by appliance.
        </p>
      </div>

      <ApplianceBreakdown data={applianceBreakdown} />
    </div>
  );
}

export default AppliancesPage;