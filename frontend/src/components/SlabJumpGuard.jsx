import { useEffect, useState } from "react";
import { FaBolt, FaPen } from "react-icons/fa";
import { computeSlabGuard } from "../utils/slabGuard";
import { useLanguage } from "../context/LanguageContext";

const STORAGE_KEY = "pp_slabguard_inputs";

const DEFAULTS = {
  unitsSoFar: 180,
  daysElapsed: 20,
  daysInCycle: 30,
};

const ZONE_STYLES = {
  green: {
    soft: "bg-teal-50 border-teal-100",
    text: "text-teal-700",
    bar: "bg-teal-500",
    dot: "🟢",
    label: "On Track",
  },
  yellow: {
    soft: "bg-yellow-50 border-yellow-100",
    text: "text-yellow-700",
    bar: "bg-yellow-400",
    dot: "🟡",
    label: "Near Slab Border",
  },
  red: {
    soft: "bg-red-50 border-red-100",
    text: "text-red-700",
    bar: "bg-red-500",
    dot: "🔴",
    label: "Will Breach Slab",
  },
};

function SlabJumpGuard() {
  const { t } = useLanguage();
  const [inputs, setInputs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(inputs);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs]);

  const result = computeSlabGuard(inputs);
  const zoneStyle = ZONE_STYLES[result.zone] || ZONE_STYLES.green;
  const barPercent = result.isTopSlab
    ? 100
    : Math.min((result.projected / result.ceiling) * 100, 100);

  function saveDraft() {
    setInputs({
      unitsSoFar: Math.max(0, Number(draft.unitsSoFar) || 0),
      daysElapsed: Math.max(0.5, Number(draft.daysElapsed) || 0.5),
      daysInCycle: Math.max(1, Number(draft.daysInCycle) || 30),
    });
    setEditing(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <FaBolt />
          </span>
          <h3 className="text-lg font-semibold text-gray-900">{t("slabGuard")}</h3>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${zoneStyle.text}`}>
            {zoneStyle.dot} {zoneStyle.label}
          </span>
          {!editing && (
            <button
              onClick={() => {
                setDraft(inputs);
                setEditing(true);
              }}
              className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <FaPen size={12} /> {t("editReading")}
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {t("manualReading")}
      </p>

      {editing ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <label className="text-xs text-gray-500">
            {t("unitsUsed")}
            <input
              type="number"
              value={draft.unitsSoFar}
              onChange={(e) => setDraft({ ...draft, unitsSoFar: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>
          <label className="text-xs text-gray-500">
            {t("daysElapsed")}
            <input
              type="number"
              value={draft.daysElapsed}
              onChange={(e) => setDraft({ ...draft, daysElapsed: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>
          <label className="text-xs text-gray-500">
            {t("cycleDays")}
            <input
              type="number"
              value={draft.daysInCycle}
              onChange={(e) => setDraft({ ...draft, daysInCycle: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </label>
          <div className="sm:col-span-3 flex gap-3">
            <button
              onClick={saveDraft}
              className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
            >
              {t("update")}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          {t("dayUsage", { elapsed: inputs.daysElapsed, cycle: inputs.daysInCycle, units: inputs.unitsSoFar, slab: result.slabIndex })}
        </p>
      )}

      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full ${zoneStyle.bar} transition-all duration-700`}
          style={{ width: `${barPercent}%` }}
        />
      </div>

      <div className={`rounded-xl border p-4 ${zoneStyle.soft}`}>
        {result.isTopSlab ? (
          <p className="text-sm text-gray-700">
            {t("topSlab", { projected: result.projected })}
          </p>
        ) : result.willBreach ? (
          <p className="text-sm text-gray-700">
            {t("breachSlab", { projected: result.projected, slab: result.slabIndex, ceiling: result.ceiling, allowance: result.safeDailyAllowance, days: result.daysLeft, saving: result.potentialSavings })}
          </p>
        ) : (
          <p className="text-sm text-gray-700">
            {t("safeSlab", { left: result.unitsLeftInSlab, slab: result.slabIndex, days: result.daysLeft, allowance: result.safeDailyAllowance })}
          </p>
        )}
      </div>
    </div>
  );
}

export default SlabJumpGuard;
