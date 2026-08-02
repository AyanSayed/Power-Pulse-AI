import { useEffect, useState } from "react";
import {
  FaTriangleExclamation,
  FaCircleCheck,
  FaBoltLightning,
} from "react-icons/fa6";
import { Link } from "react-router-dom";

import apiClient from "../services/apiClient";

const APPLIANCE_LABELS = {
  AC: "Air Conditioner",
  WaterHeater: "Water Heater",
  Refrigerator: "Refrigerator",
  WashingMachine: "Washing Machine",
  TV: "TV",
  Lights: "Lights",
  Others: "Other Appliances",
};

function getLabel(name) {
  return APPLIANCE_LABELS[name] || name;
}

function AlertCard({ limit, showViewAll = false }) {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLatest = async () => {
      try {
        const res = await apiClient.get("/api/meter-reading?limit=1");
        const data = Array.isArray(res.data) ? res.data : [];
        const latest = data[0];
        if (!isMounted) return;
        setReadings(Array.isArray(latest?.readings) ? latest.readings : []);
        setLoading(false);
      } catch (err) {
        console.error("Alert fetch failed:", err);
        if (isMounted) setLoading(false);
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const faulted = readings.filter((r) => r.fault);
  const visible = limit ? faulted.slice(0, limit) : faulted;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full hover:shadow-lg transition-all duration-300">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 text-xl">
            <FaBoltLightning />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Alerts & Status
            </h2>
            <p className="text-sm text-gray-500">
              Live faults from your smart meter
            </p>
          </div>
        </div>

        {showViewAll && faulted.length > 0 && (
          <Link
            to="/ai-insights"
            className="text-sm text-red-600 hover:text-red-700 font-medium whitespace-nowrap"
          >
            View All →
          </Link>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Checking live meter status...</p>
      ) : visible.length > 0 ? (
        <div className="space-y-4">
          {visible.map((r, index) => (
            <div key={index} className="border rounded-xl p-4 bg-red-50 border-red-200">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <FaTriangleExclamation />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    🔴 {getLabel(r.appliance)}
                  </h3>

                  <p className="text-sm text-gray-600 leading-6 mt-1">
                    Fault flagged by your smart meter —{" "}
                    <span className="font-semibold text-red-600">{r.power}W</span> at{" "}
                    {r.voltage}V, {r.current}A.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-xl p-4 bg-green-50 border-green-200">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <FaCircleCheck />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                All Systems Normal
              </h3>

              <p className="text-sm text-gray-600 leading-6 mt-1">
                No faults detected by your smart meter.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AlertCard;