import { useMemo, useState } from "react";
import { FaSnowflake } from "react-icons/fa";

const humidCities = ["Mumbai", "Chennai", "Kolkata", "Goa", "Kochi", "Visakhapatnam"];

function calculate(form) {
  let required = Number(form.area) / 120;
  if (Number(form.ceilingHeight) > 10) required += 0.2;
  if (form.floor === "Top") required += 0.3;
  if (form.sunExposure === "Direct") required += 0.2;
  else if (form.sunExposure === "Normal") required += 0.1;
  if (humidCities.includes(form.city)) required += 0.1;
  required = Math.ceil(required * 2) / 2;
  const current = Number(form.currentTon);
  const undersized = current < required;
  const hoursSaved = undersized ? Math.min(2.5, (required - current) * 2.5) : 0;
  const currentPower = current * 1.2;
  const unitsSaved = hoursSaved * currentPower * 30;
  return { required, undersized, hoursSaved, unitsSaved, savings: Math.round(unitsSaved * 8) };
}

function Field({ label, children }) {
  return <label className="flex flex-col gap-1 text-sm font-medium text-gray-700"><span>{label}</span>{children}</label>;
}
const input = "border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500";

export default function ACAdvisor() {
  const [form, setForm] = useState({ area: 180, ceilingHeight: 10, city: "Mumbai", sunExposure: "Direct", floor: "Top", currentTon: 1, starRating: 3, hoursPerDay: 8 });
  const result = useMemo(() => calculate(form), [form]);
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  return <div className="space-y-6">
    <section className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg">
      <div className="flex items-center gap-3"><FaSnowflake className="text-3xl" /><div><p className="text-cyan-100 text-sm font-semibold uppercase tracking-wide">Thermodynamic sizing</p><h1 className="text-3xl font-bold">AC Capacity Advisor</h1></div></div>
      <p className="mt-3 text-cyan-50 max-w-2xl">Size an AC for the heat your room actually receives, not just its floor area.</p>
    </section>
    <div className="grid lg:grid-cols-5 gap-6">
      <section className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-5">Room and current AC</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Room area (sq ft)"><input className={input} min="50" type="number" value={form.area} onChange={(e) => set("area", e.target.value)} /></Field>
          <Field label="Ceiling height (ft)"><input className={input} min="7" type="number" value={form.ceilingHeight} onChange={(e) => set("ceilingHeight", e.target.value)} /></Field>
          <Field label="Location"><select className={input} value={form.city} onChange={(e) => set("city", e.target.value)}>{["Mumbai", "Delhi", "Chennai", "Bengaluru", "Kolkata", "Jaipur"].map((city) => <option key={city}>{city}</option>)}</select></Field>
          <Field label="Sun exposure"><select className={input} value={form.sunExposure} onChange={(e) => set("sunExposure", e.target.value)}>{["Shaded", "Normal", "Direct"].map((v) => <option key={v}>{v}</option>)}</select></Field>
          <Field label="Floor"><select className={input} value={form.floor} onChange={(e) => set("floor", e.target.value)}><option>Middle</option><option>Top</option></select></Field>
          <Field label="Current capacity"><select className={input} value={form.currentTon} onChange={(e) => set("currentTon", e.target.value)}>{[1, 1.5, 2, 2.5].map((v) => <option value={v} key={v}>{v} Ton</option>)}</select></Field>
        </div>
      </section>
      <aside className="lg:col-span-2 rounded-2xl border border-cyan-100 bg-cyan-50 p-6">
        <p className="text-sm font-semibold text-cyan-800">Recommended capacity</p><p className="text-5xl font-bold text-cyan-700 mt-2">{result.required} Ton</p>
        <p className={`mt-4 font-semibold ${result.undersized ? "text-red-600" : "text-emerald-700"}`}>{result.undersized ? `Your ${form.currentTon}-Ton AC is undersized` : "Your installed capacity is adequate"}</p>
        {result.undersized && <p className="mt-3 text-sm text-gray-700">A {result.required}-Ton 5-Star inverter can cut estimated compressor runtime by <strong>{result.hoursSaved.toFixed(1)} hours/day</strong>, saving about <strong>₹{result.savings.toLocaleString()}/month</strong> ({result.unitsSaved.toFixed(0)} units).</p>}
        <p className="mt-4 text-xs text-gray-500">Estimate uses area ÷ 120 with heat, height, top-floor and humidity adjustments. Actual performance also depends on insulation and occupancy.</p>
      </aside>
    </div>
  </div>;
}
