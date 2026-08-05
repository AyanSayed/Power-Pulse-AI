import { useBill } from "../context/BillContext";
import ApplianceBreakdown from "../components/ApplianceBreakdown";
import DataTierBadge from "../components/DataTierBadge";
import { Link } from "react-router-dom";

function AppliancesPage() {
  const { applianceBreakdown, tierInfo, dataTier } = useBill();

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold">Appliance Breakdown</h1>
        <p className="mt-3 text-purple-100 max-w-3xl leading-7">
          See exactly where your electricity is going, appliance by appliance.
        </p>
      </div>

      <DataTierBadge tierInfo={tierInfo} />

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-emerald-900">Want real numbers, not an estimate?</p>
          <p className="text-sm text-emerald-700">
            Enter your appliances' actual tonnage, star rating, and run hours for an
            independently computed cost — reconciled against your real bill.
          </p>
        </div>
        <Link
          to="/ai-insights/audit-matrix"
          className="whitespace-nowrap bg-emerald-600 text-white font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition"
        >
          Open Audit Matrix
        </Link>
      </div>

      {hasApplianceProfile ? (
  <>
    <p className="text-xs text-gray-400 -mt-4 mb-2">
      Estimated from your appliance checklist — not measured per-device.
    </p>
    <ApplianceBreakdown data={applianceBreakdown} />
    {dataTier === 3 && (
      <p className="text-sm text-gray-500 mt-4">
        Your smart meter measures total household draw, not individual appliances.
        See live totals on the{" "}
        <Link to="/live-meter" className="text-purple-600 font-medium hover:underline">
          Live Meter page
        </Link>.
      </p>
    )}
  </>
) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unlock your appliance breakdown
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-5">
            We don't have enough signal yet to estimate which appliances are
            driving your bill. Complete a quick appliance checklist to unlock
            this — or connect a smart meter for fully real per-appliance data.
          </p>
          <Link
            to="/profile/appliance-profile"
            className="inline-block bg-purple-600 text-white font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition"
          >
            Complete Appliance Checklist
          </Link>
        </div>
      )}
    </div>
  );
}

export default AppliancesPage;