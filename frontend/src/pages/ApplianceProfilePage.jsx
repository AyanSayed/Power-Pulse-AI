import { useState } from "react";
import { FaSnowflake, FaTint, FaBlender, FaTshirt, FaTv, FaLightbulb, FaLayerGroup } from "react-icons/fa";

import { useBill } from "../context/BillContext";
import { useToast } from "../context/ToastContext";
import { APPLIANCE_CATALOG } from "../utils/nilmEngine";
import { emptyApplianceProfile } from "../utils/applianceProfileStorage";
import DataTierBadge from "../components/DataTierBadge";

const ICONS = {
  AC: <FaSnowflake />,
  WaterHeater: <FaTint />,
  Refrigerator: <FaBlender />,
  WashingMachine: <FaTshirt />,
  TV: <FaTv />,
  Lights: <FaLightbulb />,
};

const COLORS = {
  AC: "bg-blue-100 text-blue-600",
  WaterHeater: "bg-amber-100 text-amber-600",
  Refrigerator: "bg-teal-100 text-teal-600",
  WashingMachine: "bg-indigo-100 text-indigo-600",
  TV: "bg-purple-100 text-purple-600",
  Lights: "bg-yellow-100 text-yellow-600",
};

function ApplianceProfilePage() {
  const { applianceProfile, setApplianceProfile, pincode, setPincode, tierInfo } = useBill();
  const { showToast } = useToast();

  const [form, setForm] = useState(() => ({ ...emptyApplianceProfile(), ...applianceProfile, details: applianceProfile?.details || {} }));
  const [pin, setPin] = useState(pincode || "");

  function updateCount(key, value) {
    const n = Math.max(0, Math.min(20, Number(value) || 0));
    setForm((prev) => ({ ...prev, [key]: n }));
  }

  function updateDetail(key, field, value) {
    setForm((prev) => ({ ...prev, details: { ...prev.details, [key]: { ...prev.details[key], [field]: value } } }));
  }

  function handleSave(e) {
    e.preventDefault();
    setApplianceProfile(form);
    setPincode(pin.trim());
    showToast("Appliance profile saved — your breakdown is now personalized", "success");
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 rounded-3xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <FaLayerGroup className="text-2xl" />
          <span className="text-sm font-semibold uppercase tracking-wide text-blue-100">
            Zero-Hardware Setup
          </span>
        </div>
        <h1 className="text-3xl font-bold">Tell us what's plugged in</h1>
        <p className="mt-3 text-blue-100 max-w-2xl leading-7">
          30 seconds of checkboxes replaces a house full of sensors. We combine this with
          your local weather to estimate — via Virtual Sub-Metering (NILM) — how much each
          appliance is really costing you, no smart plugs required.
        </p>
      </div>

      <DataTierBadge tierInfo={tierInfo} hideCta />

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div>
          <label className="block mb-2 font-medium text-gray-900">Pincode</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 400614"
            className="w-full md:w-64 border rounded-xl px-4 py-3"
          />
          <p className="text-xs text-gray-500 mt-1.5">
            Used to pull accurate local weather data for the AC-usage estimate.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Your appliances</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(APPLIANCE_CATALOG).map(([key, meta]) => (
              <div
                key={key}
                className="border rounded-xl p-4 hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${COLORS[key]}`}>
                    {ICONS[key]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{meta.label}</p>
                    <p className="text-xs text-gray-500">~{meta.watts}W each</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateCount(key, form[key] - 1)}
                    className="w-8 h-8 rounded-lg border text-gray-600 hover:bg-gray-50"
                  >
                    –
                  </button>
                  <span className="w-6 text-center font-semibold">{form[key]}</span>
                  <button
                    type="button"
                    onClick={() => updateCount(key, form[key] + 1)}
                    className="w-8 h-8 rounded-lg border text-gray-600 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                </div>
              {form[key] > 0 && <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-sm">
                <label className="flex flex-col gap-1"><span className="text-gray-500">Hours/day</span><input type="number" min="0" max="24" step="0.5" value={form.details?.[key]?.hours ?? ""} onChange={(e) => updateDetail(key, "hours", e.target.value)} className="border rounded-lg px-2 py-1.5" /></label>
                <label className="flex flex-col gap-1"><span className="text-gray-500">Star rating</span><select value={form.details?.[key]?.starRating ?? ""} onChange={(e) => updateDetail(key, "starRating", e.target.value)} className="border rounded-lg px-2 py-1.5"><option value="">Not rated</option>{[3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} Star</option>)}</select></label>
                {key === "AC" && <label className="flex items-center gap-2 mt-6"><input type="checkbox" checked={!!form.details?.AC?.inverter} onChange={(e) => updateDetail("AC", "inverter", e.target.checked)} />Inverter AC</label>}
              </div>}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-8 py-3 rounded-xl font-semibold"
        >
          Save & Unlock Tier 2
        </button>
      </form>
    </div>
  );
}

export default ApplianceProfilePage;
