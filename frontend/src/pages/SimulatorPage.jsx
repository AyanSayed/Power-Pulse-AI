import { useState } from "react";
import { useBill } from "../context/BillContext";
import { FaSliders, FaBoltLightning } from "react-icons/fa6";

// Baseline hours the "current" bill is assumed to reflect for each
// adjustable appliance — sliders scale cost proportionally against these.
const BASELINE_HOURS = {
  ac: 6,
  heater: 1,
  lighting: 5,
};

function SimulatorPage() {
  const { predictedBill, applianceBreakdown } = useBill();

  const acPct = applianceBreakdown?.find((a) => a.name === "AC Unit")?.pct ?? 35;
  const heaterPct = applianceBreakdown?.find((a) => a.name === "Water Heater")?.pct ?? 20;
  const lightingPct = applianceBreakdown?.find((a) => a.name === "Lighting")?.pct ?? 10;
  const fixedPct = Math.max(0, 100 - acPct - heaterPct - lightingPct);

  const [acHours, setAcHours] = useState(BASELINE_HOURS.ac);
  const [heaterHours, setHeaterHours] = useState(BASELINE_HOURS.heater);
  const [lightingHours, setLightingHours] = useState(BASELINE_HOURS.lighting);
  const [acAge, setAcAge] = useState(0);
  const [heaterAge, setHeaterAge] = useState(0);
  const [lightingAge, setLightingAge] = useState(0);

  const base = predictedBill || 0;

  const ageFactor = (years) => 1 + Math.min(0.2, Math.max(0, years) * 0.015);
  const acCost = ((base * acPct) / 100) * (acHours / BASELINE_HOURS.ac) * ageFactor(acAge);
  const heaterCost = ((base * heaterPct) / 100) * (heaterHours / BASELINE_HOURS.heater) * ageFactor(heaterAge);
  const lightingCost = ((base * lightingPct) / 100) * (lightingHours / BASELINE_HOURS.lighting) * ageFactor(lightingAge);
  const fixedCost = (base * fixedPct) / 100;

  const simulatedBill = acCost + heaterCost + lightingCost + fixedCost;
  const diff = simulatedBill - base;
  const isSaving = diff < 0;

  function reset() {
    setAcHours(BASELINE_HOURS.ac);
    setHeaterHours(BASELINE_HOURS.heater);
    setLightingHours(BASELINE_HOURS.lighting);
    setAcAge(0);
    setHeaterAge(0);
    setLightingAge(0);
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 rounded-3xl p-8 text-white shadow-lg">
       <h1 className="text-4xl font-bold flex items-center gap-3">
        <FaSliders /> What-If Simulator
        </h1>
        <p className="mt-3 text-blue-100 max-w-3xl leading-7">
          Drag the sliders to see how changing your daily appliance usage
          would affect your monthly bill — based on your current usage pattern.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-8">
          <SliderRow
            label="AC usage"
            value={acHours}
            min={0}
            max={12}
            step={0.5}
            unit="hrs/day"
            onChange={setAcHours}
          />
          <AgeField label="AC age" value={acAge} onChange={setAcAge} />
          <SliderRow
            label="Water heater usage"
            value={heaterHours}
            min={0}
            max={4}
            step={0.25}
            unit="hrs/day"
            onChange={setHeaterHours}
          />
          <AgeField label="Water heater age" value={heaterAge} onChange={setHeaterAge} />
          <SliderRow
            label="Lighting usage"
            value={lightingHours}
            min={0}
            max={12}
            step={0.5}
            unit="hrs/day"
            onChange={setLightingHours}
          />
          <AgeField label="Lighting age" value={lightingAge} onChange={setLightingAge} />

          <button
            onClick={reset}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Reset to current usage
          </button>

          <p className="text-xs text-gray-400 leading-5">
            Estimate only — assumes fridge and other fixed appliances stay
            constant, and scales AC/heater/lighting cost proportionally to
            hours used versus your current pattern.
          </p>
        </div>

        {/* Result */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <FaBoltLightning />
              </span>
              <h3 className="text-lg font-semibold text-gray-900">Estimated Bill</h3>
            </div>

            <p className="text-sm text-gray-500">Current predicted bill</p>
            <p className="text-2xl font-bold text-gray-900 mb-4">
              ₹{Math.round(base)}
            </p>

            <p className="text-sm text-gray-500">Simulated bill</p>
            <p className="text-3xl font-bold text-indigo-600 mb-4">
              ₹{Math.round(simulatedBill)}
            </p>
          </div>

          <div
            className={`rounded-xl p-4 border ${
              diff === 0
                ? "bg-gray-50 border-gray-200"
                : isSaving
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p className="text-sm text-gray-700">
              {diff === 0 && "No change from your current usage."}
              {isSaving && (
                <>
                  You'd save{" "}
                  <span className="font-bold text-green-600">
                    ₹{Math.abs(Math.round(diff))}
                  </span>{" "}
                  per month with this usage pattern.
                </>
              )}
              {!isSaving && diff !== 0 && (
                <>
                  This would cost{" "}
                  <span className="font-bold text-red-600">
                    ₹{Math.round(diff)}
                  </span>{" "}
                  more per month.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderRow({ label, value, min, max, step, unit, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-gray-900">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-teal-600"
      />
    </div>
  );
}

function AgeField({ label, value, onChange }) {
  return <label className="block text-sm font-medium text-gray-700">{label}<input type="number" min="0" max="30" value={value} onChange={(e) => onChange(Number(e.target.value))} className="ml-3 w-24 rounded-lg border border-gray-300 px-2 py-1" /> <span className="text-gray-500">years</span></label>;
}

export default SimulatorPage;
