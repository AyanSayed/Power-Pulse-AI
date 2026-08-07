import { useEffect, useRef, useState } from "react";
import apiClient from "../services/apiClient";
import { billForUnits } from "../utils/slabRates";

const HIGHLIGHT_DURATION = 900;

export default function LiveMeter() {
  const [totalWatts, setTotalWatts] = useState(null);
  const [billSoFar, setBillSoFar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashPower, setFlashPower] = useState(false);
  const previousWatts = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [readingResponse, rateResponse] = await Promise.all([
          apiClient.get("/api/meter-reading?limit=1"),
          apiClient.get("/api/meter-reading/run-rate"),
        ]);
        const latest = Array.isArray(readingResponse.data) ? readingResponse.data[0] : null;
        if (!mounted) return;
        if (latest?.readings) {
          const watts = Math.round(latest.readings.reduce((sum, reading) => sum + (reading.power || 0), 0) * 100) / 100;
          if (previousWatts.current !== null && previousWatts.current !== watts) {
            setFlashPower(true);
            setTimeout(() => setFlashPower(false), HIGHLIGHT_DURATION);
          }
          previousWatts.current = watts;
          setTotalWatts(watts);
        }
        setBillSoFar(billForUnits(rateResponse.data?.unitsSoFar || 0));
        setError(null);
      } catch (err) {
        if (mounted) setError("Could not load live meter data.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 1500);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (loading) return <p className="text-gray-400 p-6">Loading live meter...</p>;
  if (error) return <p className="text-red-500 p-6">{error}</p>;
  return <div className="p-6 md:p-8 w-full space-y-6">
    <div><h1 className="text-2xl font-bold text-gray-900">Live Smart Meter</h1><p className="text-sm text-gray-500">Live household power and current bill.</p></div>
    <div className="grid md:grid-cols-2 gap-6">
      <section className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-all duration-300 ${flashPower ? "ring-2 ring-amber-300" : ""}`}><p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Current power</p><p className="text-4xl font-extrabold text-emerald-600 mt-2">{totalWatts ?? 0}<span className="text-xl ml-1">W</span></p></section>
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"><p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Bill so far</p><p className="text-4xl font-extrabold text-emerald-600 mt-2">₹{billSoFar ?? 0}</p></section>
    </div>
  </div>;
}
