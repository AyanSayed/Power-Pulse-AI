import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function LiveMeter() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReadings = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/meter-reading?limit=10`);
        setReadings(Array.isArray(res.data) ? res.data : []);
        setError(null);
      } catch (err) {
        console.error("Live meter fetch failed:", err);
        setError("Could not load live readings.");
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
    const interval = setInterval(fetchReadings, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-gray-400 p-6">Loading live readings...</p>;
  if (error) return <p className="text-red-400 p-6">{error}</p>;
  if (readings.length === 0) return <p className="text-gray-400 p-6">No readings yet. Make sure your ESP32 simulator is running.</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Live Smart Meter</h1>
      <p className="text-sm text-slate">Auto-refreshes every 5 seconds</p>

      {readings.map((entry) => (
        <div key={entry._id} className="bg-navy-light rounded-xl p-4 border border-navy-border">
          <p className="text-xs text-slate mb-2">
            Received: {new Date(entry.receivedAt).toLocaleString()}
          </p>
          <table className="w-full text-sm text-left text-gray-300">
            <thead>
              <tr className="text-slate border-b border-navy-border">
                <th className="py-1">Appliance</th>
                <th>Voltage (V)</th>
                <th>Current (A)</th>
                <th>Power (W)</th>
                <th>Fault</th>
              </tr>
            </thead>
            <tbody>
              {entry.readings.map((r) => (
                <tr key={r._id} className={r.fault ? "text-red-400" : ""}>
                  <td className="py-1">{r.appliance}</td>
                  <td>{r.voltage}</td>
                  <td>{r.current}</td>
                  <td>{r.power}</td>
                  <td>{r.fault ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default LiveMeter;
