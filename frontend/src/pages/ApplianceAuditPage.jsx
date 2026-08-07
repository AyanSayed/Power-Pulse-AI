import { useMemo, useState } from "react";
import axios from "axios";
import { FaCalculator, FaTrash, FaPlus } from "react-icons/fa";

import { useBill } from "../context/BillContext";
import {
  AUDIT_APPLIANCE_TYPES,
  fridgeCategories,
  emptyEntry,
  runAudit,
} from "../utils/auditEngine";
import { currentSlabIndex, marginalRate } from "../utils/slabRates";

const STAR_OPTIONS = [3, 4, 5];

function EntryEditor({ entry, onChange, onRemove }) {
  function set(field, value) {
    onChange({ ...entry, [field]: value });
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900">{entry.label}</p>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition"
          aria-label="Remove appliance"
        >
          <FaTrash />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        {entry.mode === "ac" && (
          <>
            <label className="flex flex-col gap-1">
              <span className="text-gray-500">Tonnage</span>
              <select
                value={entry.tonnage}
                onChange={(e) => set("tonnage", Number(e.target.value))}
                className="border rounded-lg px-2 py-1.5"
              >
                {[1, 1.5, 2].map((t) => (
                  <option key={t} value={t}>{t} Ton</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-gray-500">Star Rating</span>
              <select
                value={entry.starRating}
                onChange={(e) => set("starRating", Number(e.target.value))}
                className="border rounded-lg px-2 py-1.5"
              >
                {STAR_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s} Star</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 mt-5">
              <input
                type="checkbox"
                checked={entry.inverter}
                onChange={(e) => set("inverter", e.target.checked)}
              />
              <span className="text-gray-700">Inverter</span>
            </label>
          </>
        )}

        {entry.mode === "fridge" && (
          <>
            <label className="flex flex-col gap-1 col-span-2">
              <span className="text-gray-500">Category</span>
              <select
                value={entry.category}
                onChange={(e) => set("category", e.target.value)}
                className="border rounded-lg px-2 py-1.5"
              >
                {fridgeCategories().map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-gray-500">Star Rating</span>
              <select
                value={entry.starRating}
                onChange={(e) => set("starRating", Number(e.target.value))}
                className="border rounded-lg px-2 py-1.5"
              >
                {STAR_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s} Star</option>
                ))}
              </select>
            </label>
          </>
        )}

        {entry.mode === "generic" && (
          <label className="flex flex-col gap-1">
            <span className="text-gray-500">Watts (each)</span>
            <input
              type="number"
              min="1"
              value={entry.watts}
              onChange={(e) => set("watts", e.target.value)}
              className="border rounded-lg px-2 py-1.5"
            />
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-gray-500">Hours/day</span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={entry.hours}
            onChange={(e) => set("hours", e.target.value)}
            className="border rounded-lg px-2 py-1.5"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-500">Quantity</span>
          <input
            type="number"
            min="1"
            value={entry.quantity}
            onChange={(e) => set("quantity", e.target.value)}
            className="border rounded-lg px-2 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-500">Appliance age (years)</span>
          <input type="number" min="0" max="30" value={entry.ageYears} onChange={(e) => set("ageYears", e.target.value)} className="border rounded-lg px-2 py-1.5" />
        </label>
      </div>
    </div>
  );
}

function ApplianceAuditPage() {
  const { latestBill } = useBill();
  const billedUnits = latestBill?.units ?? 0;

  const [entries, setEntries] = useState([emptyEntry(AUDIT_APPLIANCE_TYPES[0])]);
  const [addType, setAddType] = useState(AUDIT_APPLIANCE_TYPES[0].key);
  const [acResult, setAcResult] = useState(null);
  const result = useMemo(() => runAudit(entries, billedUnits), [entries, billedUnits]);
  const slabIdx = currentSlabIndex(billedUnits);
  const rate = marginalRate(billedUnits);

  function addEntry() {
    const type = AUDIT_APPLIANCE_TYPES.find((t) => t.key === addType) || AUDIT_APPLIANCE_TYPES[0];
    setEntries((prev) => [...prev, emptyEntry(type)]);
  }

  function updateEntry(id, updated) {
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
  }

  function removeEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    async function analyzeAC(entry) {
  try {
    const res = await axios.post("http://localhost:5000/api/ac/analyze", {
      area: 180,
      ceilingHeight: 10,
      city: "Mumbai",
      sunExposure: "Direct",
      floor: "Top",
      currentTon: entry.tonnage,
      starRating: entry.starRating,
      hoursPerDay: entry.hours,
    });

    setAcResult(res.data);
  } catch (err) {
    console.error(err);
  }
}
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 rounded-3xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <FaCalculator className="text-2xl" />
          <span className="text-sm font-semibold uppercase tracking-wide text-emerald-100">
            Real Math, Not a Bill-Calibrated Guess
          </span>
        </div>
        <h1 className="text-3xl font-bold">Appliance Energy Audit Matrix</h1>
        <p className="mt-3 text-emerald-100 max-w-2xl leading-7">
          Enter the actual spec of what you own — tonnage, star rating, hours run — and this
          computes real kWh and cost from scratch, independently of your bill. The reconciliation
          below shows how closely it lands against what you were actually charged.
        </p>
      </div>

      {billedUnits > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-gray-500">Latest bill: </span>
            <span className="font-semibold text-gray-900">{billedUnits} units</span>
          </div>
          <div>
            <span className="text-gray-500">Current slab: </span>
            <span className="font-semibold text-gray-900">Slab {slabIdx}</span>
          </div>
          <div>
            <span className="text-gray-500">Marginal rate: </span>
            <span className="font-semibold text-gray-900">₹{rate.toFixed(2)}/unit</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {entries.map((entry) => (
          <EntryEditor
            key={entry.id}
            entry={entry}
            onChange={(updated) => updateEntry(entry.id, updated)}
            onRemove={() => removeEntry(entry.id)}
          />
        ))}

        <div className="flex items-center gap-3">
          <select
            value={addType}
            onChange={(e) => setAddType(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {AUDIT_APPLIANCE_TYPES.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addEntry}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 transition text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <FaPlus /> Add Appliance
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Computed Breakdown</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4">Appliance</th>
                <th className="py-2 pr-4">Watts</th>
                <th className="py-2 pr-4">kWh/month</th>
                <th className="py-2 pr-4">Cost/month</th>
                <th className="py-2 pr-4">Share</th>
              </tr>
            </thead>
            <tbody>
              {result.entries.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-900">
                    {e.label}{e.quantity > 1 ? ` × ${e.quantity}` : ""}
                  </td>
                  <td className="py-2 pr-4 text-gray-600">{e.watts}W</td>
                  <td className="py-2 pr-4 text-gray-600">{e.monthlyKwh}</td>
                  <td className="py-2 pr-4 text-gray-900 font-semibold">₹{e.monthlyCost}</td>
                  <td className="py-2 pr-4 text-gray-600">{e.sharePct}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-semibold text-gray-900">
                <td className="py-2 pr-4">Total</td>
                <td className="py-2 pr-4"></td>
                <td className="py-2 pr-4">{result.totalKwh}</td>
                <td className="py-2 pr-4">₹{result.totalCost}</td>
                <td className="py-2 pr-4">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {result.matchPct !== null && (
          <div className="mt-5 bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
            Your entered appliances add up to <strong>{result.totalKwh} kWh/month</strong>, against{" "}
            <strong>{billedUnits} units</strong> on your actual bill — a{" "}
            <strong>{result.matchPct}% match</strong>. A gap usually means either an appliance is
            missing from the list above, or one is running fewer/more hours than entered — either
            way, this is a real, checkable number, not an estimate forced to fit the bill.
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplianceAuditPage;
