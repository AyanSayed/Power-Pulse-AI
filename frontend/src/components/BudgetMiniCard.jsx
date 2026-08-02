import { useEffect, useState } from "react";
import apiClient from "../services/apiClient";
import { FaWallet } from "react-icons/fa";
import ViewMoreButton from "./ViewMoreButton";

const RATE_PER_UNIT = 8.2;
const BUDGET_KEY = "pp_budget_target";
const DEFAULT_TARGET = 3000;

function BudgetMiniCard() {
  const [target] = useState(() => {
    const saved = localStorage.getItem(BUDGET_KEY);
    return saved ? Number(saved) : DEFAULT_TARGET;
  });
  const [runRate, setRunRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchRunRate() {
      try {
        const res = await apiClient.get("/api/meter-reading/run-rate");
        if (!cancelled) {
          setRunRate(res.data);
          setError(false);
        }
      } catch (err) {
        console.error("Budget mini card fetch error:", err.message);
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
        <div className="h-3 w-full bg-gray-200 rounded" />
      </div>
    );
  }

  if (error || !runRate) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <p className="text-sm text-gray-500">Budget data unavailable right now.</p>
      </div>
    );
  }

  const spentSoFar = runRate.unitsSoFar * RATE_PER_UNIT;
  const percent = Math.min((spentSoFar / target) * 100, 100);
  const isOverBudget = spentSoFar > target;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
          <FaWallet />
        </span>
        <h3 className="text-lg font-semibold text-gray-900">Budget</h3>
      </div>
      <p className="text-sm text-gray-500 mb-2">
        <span className={`font-semibold ${isOverBudget ? "text-red-600" : "text-gray-700"}`}>
          ₹{Math.round(spentSoFar)}
        </span>{" "}
        of ₹{target} spent this month
      </p>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${isOverBudget ? "bg-red-500" : "bg-teal-500"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <ViewMoreButton to="/budget" label="Manage Budget" accent="teal" />
    </div>
  );
}

export default BudgetMiniCard;