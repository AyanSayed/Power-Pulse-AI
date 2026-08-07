import { Link } from "react-router-dom";
import { FaBolt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useBill } from "../context/BillContext";
import { APPLIANCE_CATALOG } from "../utils/nilmEngine";
import { calculateApplianceCost } from "../utils/auditEngine";

const AUDIT_SETTINGS = {
  AC: { mode: "ac", tonnage: 1.5 },
  Refrigerator: { mode: "fridge", category: "Double Door" },
  WashingMachine: { mode: "generic" },
  WaterHeater: { mode: "generic" },
  TV: { mode: "generic" },
  Lights: { mode: "generic" },
};
const TIER_STATUS = {
  1: { title: "Tier 1 · Profile needed", text: "Add appliance details to unlock formula-based cost scorecards.", classes: "bg-slate-50 border-slate-200 text-slate-800" },
  2: { title: "Tier 2 · Appliance profile", text: "Costs below are calculated from the appliance details you entered.", classes: "bg-indigo-50 border-indigo-200 text-indigo-900" },
  3: { title: "Tier 3 · Live meter connected", text: "Live meter data is available; these appliance scorecards still use only the details you entered.", classes: "bg-emerald-50 border-emerald-200 text-emerald-900" },
};

function efficiency(detail) {
  const rating = Number(detail?.starRating);
  if (detail?.inverter || rating >= 4) return { label: "Efficient", className: "bg-emerald-100 text-emerald-700", icon: <FaCheckCircle /> };
  if (rating === 3) return { label: "Average", className: "bg-amber-100 text-amber-700", icon: <FaBolt /> };
  return { label: "Needs Upgrade", className: "bg-rose-100 text-rose-700", icon: <FaExclamationTriangle /> };
}

function scorecards(profile, billedUnits) {
  return Object.entries(APPLIANCE_CATALOG)
    .filter(([key]) => Number(profile?.[key]) > 0)
    .map(([key, catalog]) => {
      const detail = profile.details?.[key] || {};
      if (!(Number(detail.hours) > 0)) return null;
      const settings = AUDIT_SETTINGS[key];
      const entry = {
        ...settings,
        key,
        label: catalog.label,
        hours: Number(detail.hours),
        quantity: Number(profile[key]),
        starRating: Number(detail.starRating) || 0,
        inverter: !!detail.inverter,
        watts: catalog.watts,
        ageYears: 0,
      };
      return { key, count: Number(profile[key]), score: calculateApplianceCost(entry, billedUnits), efficiency: efficiency(detail) };
    })
    .filter(Boolean)
    .sort((a, b) => b.score.monthlyCost - a.score.monthlyCost);
}

export default function AppliancesPage() {
  const { applianceProfile, latestBill, hasApplianceProfile, dataTier } = useBill();
  const entered = Object.entries(APPLIANCE_CATALOG).filter(([key]) => Number(applianceProfile?.[key]) > 0);
  const cards = scorecards(applianceProfile, latestBill?.units ?? 0);
  const missingDetails = entered.length > cards.length;
  const tier = TIER_STATUS[dataTier] || TIER_STATUS[1];

  return <div className="space-y-8">
    <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 rounded-3xl p-8 text-white shadow-lg">
      <h1 className="text-4xl font-bold">Appliance Cost &amp; Efficiency Scorecard</h1>
      <p className="mt-3 text-purple-100 max-w-3xl leading-7">Calculated from your appliance details using standard wattage-based formulas and your current marginal electricity rate.</p>
    </div>

    <div className={`rounded-2xl border p-5 ${tier.classes}`}><p className="font-semibold">{tier.title}</p><p className="mt-1 text-sm">{tier.text}</p></div>

    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
      <div><p className="font-semibold text-emerald-900">Want real numbers, not an estimate?</p><p className="text-sm text-emerald-700">Enter your appliances' actual tonnage, star rating, and run hours for an independently computed cost â€” reconciled against your real bill.</p></div>
      <Link to="/ai-insights/audit-matrix" className="whitespace-nowrap bg-emerald-600 text-white font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition">Open Audit Matrix</Link>
    </div>

    {!hasApplianceProfile ? <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center"><h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock your appliance scorecard</h3><p className="text-sm text-gray-500 max-w-md mx-auto mb-5">Complete your appliance checklist first. We will only calculate costs from details you provide.</p><Link to="/profile/appliance-profile" className="inline-block bg-purple-600 text-white font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition">Complete Appliance Checklist</Link></div> : !cards.length ? <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6"><h2 className="font-semibold text-amber-900">Add usage details to calculate your scorecard</h2><p className="text-sm text-amber-800 mt-2">Enter daily hours for every appliance in your profile. Add its star rating or inverter status too for an efficiency badge.</p><Link to="/profile/appliance-profile" className="inline-block mt-4 font-semibold text-amber-900 underline">Complete appliance details</Link></div> : <>
      {missingDetails && <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">Some selected appliances are excluded until you add their daily hours in your profile. <Link to="/profile/appliance-profile" className="font-semibold underline">Complete their details</Link>.</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{cards.map(({ key, count, score, efficiency: badge }) => <article key={key} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"><div className="flex justify-between gap-3"><div><h2 className="font-semibold text-gray-900">{score.label}</h2><p className="text-sm text-gray-500 mt-1">{count} unit{count > 1 ? "s" : ""} · {score.watts}W each</p></div><span className={`inline-flex h-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>{badge.icon}{badge.label}</span></div><div className="mt-5 grid grid-cols-2 gap-4 border-t pt-4"><div><p className="text-xs uppercase tracking-wide text-gray-400">Estimated units/day</p><p className="mt-1 text-xl font-bold text-gray-900">{score.dailyKwh} kWh</p></div><div><p className="text-xs uppercase tracking-wide text-gray-400">Estimated cost/month</p><p className="mt-1 text-xl font-bold text-indigo-700">₹{score.monthlyCost.toLocaleString("en-IN")}</p></div></div></article>)}</div>
      <p className="text-xs text-gray-500">Costs use wattage × hours/day × quantity and the marginal rate for your latest bill. They are planning estimates, not appliance-level measurements.</p>
    </>}
  </div>;
}
