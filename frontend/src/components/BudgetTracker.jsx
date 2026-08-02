import { useEffect, useState } from "react";
import axios from "axios";
import { FaWallet, FaPen } from "react-icons/fa";
import { useBill } from "../context/BillContext";

const API_URL = import.meta.env.VITE_API_URL;
const RATE_PER_UNIT = 8.2; // ₹/unit — matches the rate used elsewhere in the app
const BUDGET_KEY = "pp_budget_target";
const DEFAULT_TARGET = 3000;

function BudgetTracker() {
  const { weatherTemp } = useBill();

  const [target, setTarget] = useState(() => {
    const saved = localStorage.getItem(BUDGET_KEY);
    return saved ? Number(saved) : DEFAULT_TARGET;
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(target);

  const [runRate, setRunRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchRunRate() {
      try {
        const res = await axios.get(`${API_URL}/api/meter-reading/run-rate`);
        if (!cancelled) {
          setRunRate(res.data);
          setError(false);
        }
      } catch (err) {
        console.error("Budget tracker fetch error:", err.message);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRunRate();
    const interval = setInterval(fetchRunRate, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  function saveTarget() {
    const value = Math.max(0, Number(draft) || 0);
    setTarget(value);
    localStorage.setItem(BUDGET_KEY, String(value));
    setEditing(false);
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-pulse">
        <div className="h-4 w-48 bg-gray-200 rounded mb-4" />
        <div className="h-8 w-32 bg-gray-200 rounded" />
      </div>
    );
  }

  if (error || !runRate) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <p className="text-sm text-gray-500">
          Couldn't load your budget tracker. Check back shortly.
        </p>
      </div>
    );
  }

  const { unitsSoFar, daysElapsed, daysInMonth } = runRate;

  const spentSoFar = unitsSoFar * RATE_PER_UNIT;
  const remaining = Math.max(target - spentSoFar, 0);
  const daysLeft = Math.max(daysInMonth - daysElapsed, 0.5);
  const isLastDay = daysLeft < 1;

  const dailyAllowanceRs = remaining / daysLeft;
  const dailyAllowanceUnits = dailyAllowanceRs / RATE_PER_UNIT;

  const isOverBudget = spentSoFar > target;
  const isHot = weatherTemp !== null && weatherTemp > 30;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
            <FaWallet />
          </span>
          <h3 className="text-lg font-semibold text-gray-900">
            Remaining Budget Tracker
          </h3>
        </div>

        {!editing && (
          <button
            onClick={() => {
              setDraft(target);
              setEditing(true);
            }}
            className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <FaPen size={12} /> Edit target
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-gray-500">₹</span>
          <input
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 w-32 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            autoFocus
          />
          <button
            onClick={saveTarget}
            className="text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          Monthly target: <span className="font-semibold text-gray-700">₹{target}</span>
        </p>
      )}

      {isOverBudget ? (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4">
          <p className="text-sm text-gray-700">
            🔴 You've already spent{" "}
            <span className="font-bold text-red-600">₹{Math.round(spentSoFar)}</span>, over
            your ₹{target} target with {Math.round(daysLeft)} days left this month.
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-teal-50 border border-teal-100 p-4">
          <p className="text-sm text-gray-700">
            To stay under ₹{target}, your safe daily allowance is{" "}
            <span className="font-bold text-teal-700">
              {dailyAllowanceUnits.toFixed(1)} units (₹{Math.round(dailyAllowanceRs)})
            </span>{" "}
            per day for the next {Math.round(daysLeft)} days.
          </p>
        </div>
      )}

      {isHot && !isOverBudget && (
        <p className="text-xs text-gray-500 mt-3">
          🌡 It's {Math.round(weatherTemp)}°C right now — AC-driven days tend to run above
          this allowance, so keep an eye on today's usage.
        </p>
      )}
    </div>
  );
}

export default BudgetTracker;