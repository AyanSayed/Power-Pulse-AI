import { useEffect, useState } from "react";
import { FaTriangleExclamation } from "react-icons/fa6";
import ViewMoreButton from "./ViewMoreButton";

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

function AlertPreview() {
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
        console.error("Alert preview fetch failed:", err);
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
  const alert = faulted[0] || null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
          <FaTriangleExclamation />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Active Alert</h2>
          <p className="text-sm text-gray-500">Latest detected issue</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Checking live meter status...</p>
      ) : alert ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900">{getLabel(alert.appliance)}</h3>
          <p className="text-gray-600 mt-2 leading-6">
            Fault flagged by your smart meter —{" "}
            <span className="font-semibold text-red-600">{alert.power}W</span> at{" "}
            {alert.voltage}V, {alert.current}A.
          </p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900">All Systems Normal</h3>
          <p className="text-gray-600 mt-2 leading-6">
            No faults detected by your smart meter.
          </p>
        </div>
      )}

      <ViewMoreButton to="/ai-insights" accent="red" />
    </div>
  );
}

export default AlertPreview;