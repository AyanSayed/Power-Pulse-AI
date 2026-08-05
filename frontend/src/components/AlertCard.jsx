import { useEffect, useState } from "react";
import {
  FaTriangleExclamation,
  FaCircleCheck,
  FaBoltLightning,
} from "react-icons/fa6";

import apiClient from "../services/apiClient";

function AlertCard() {
  const [spike, setSpike] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSpike = async () => {
      try {
        const res = await apiClient.get("/api/meter-reading/spike-check");
        if (isMounted) {
          setSpike(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Spike check fetch failed:", err);
        if (isMounted) setLoading(false);
      }
    };

    fetchSpike();
    const interval = setInterval(fetchSpike, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 text-xl">
          <FaBoltLightning />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Alerts & Status</h2>
          <p className="text-sm text-gray-500">Total power draw vs your usual pattern</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Checking live meter status...</p>
      ) : !spike || spike.baselineWatts === null ? (
        <div className="border rounded-xl p-4 bg-gray-50 border-gray-200">
          <p className="text-sm text-gray-500">
            Not enough history yet to detect unusual usage. Check back once your meter has been running a bit longer.
          </p>
        </div>
      ) : spike.isSpike ? (
        <div className="border rounded-xl p-4 bg-red-50 border-red-200">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <FaTriangleExclamation />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Unusual power spike</h3>
              <p className="text-sm text-gray-600 leading-6 mt-1">
                Drawing <span className="font-semibold text-red-600">{spike.currentWatts}W</span> right now —{" "}
                <span className="font-semibold text-red-600">{spike.diffPct}% higher</span> than your{" "}
                {spike.comparedTo} (~{spike.baselineWatts}W). Worth checking what's running.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-xl p-4 bg-green-50 border-green-200">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <FaCircleCheck />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">All Systems Normal</h3>
              <p className="text-sm text-gray-600 leading-6 mt-1">
                Drawing {spike.currentWatts}W — in line with your {spike.comparedTo} (~{spike.baselineWatts}W).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlertCard;