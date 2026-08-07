import { useEffect, useRef, useState } from "react";
import apiClient from "../services/apiClient";
import { billForUnits } from "../utils/slabRates";

const HIGHLIGHT_DURATION = 900;
const HISTORY_LIMIT = 12;

function elapsedLabel(timestamp) {
  if (!timestamp) return "Awaiting a meter connection";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000));
  if (seconds < 10) return "Connected just now";
  if (seconds < 60) return `Last reading ${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Last reading ${minutes}m ago`;
  return `Last reading ${Math.floor(minutes / 60)}h ago`;
}

function totalWatts(reading) {
  return Math.round((reading?.readings || []).reduce((sum, item) => sum + (item.power || 0), 0) * 100) / 100;
}

function formatPower(watts) {
  if (watts >= 1000) return `${(watts / 1000).toFixed(2)} kW`;
  return `${watts.toFixed(0)} W`;
}

function buildMeterHistory(readings, unitsSoFar) {
  const chronological = [...readings].reverse();
  const increments = chronological.map((reading, index) => {
    if (index === 0) return 0;
    const previous = chronological[index - 1];
    const hours = (new Date(reading.receivedAt) - new Date(previous.receivedAt)) / 3600000;
    if (hours <= 0 || hours > 1) return 0;
    return ((totalWatts(previous) + totalWatts(reading)) / 2 * hours) / 1000;
  });
  const shownUnits = increments.reduce((total, value) => total + value, 0);
  let cumulative = Math.max(0, Number(unitsSoFar) - shownUnits);
  return chronological.map((reading, index) => {
    cumulative += increments[index];
    return { ...reading, meterUnits: Number(cumulative.toFixed(3)) };
  });
}

export default function LiveMeter() {
  const [totalPower, setTotalPower] = useState(null);
  const [billSoFar, setBillSoFar] = useState(null);
  const [lastReadingAt, setLastReadingAt] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashPower, setFlashPower] = useState(false);
  const [, setClock] = useState(Date.now());
  const previousWatts = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [historyResponse, rateResponse] = await Promise.all([
          apiClient.get(`/api/meter-reading?limit=${HISTORY_LIMIT}`),
          apiClient.get("/api/meter-reading/run-rate"),
        ]);
        if (!mounted) return;
        const readings = Array.isArray(historyResponse.data) ? historyResponse.data : [];
        const latest = readings[0] || null;
        if (latest) {
          const watts = totalWatts(latest);
          if (previousWatts.current !== null && previousWatts.current !== watts) {
            setFlashPower(true);
            setTimeout(() => setFlashPower(false), HIGHLIGHT_DURATION);
          }
          previousWatts.current = watts;
          setTotalPower(watts);
          setLastReadingAt(latest.receivedAt);
        }
        const unitsSoFar = rateResponse.data?.unitsSoFar || 0;
        setHistory(buildMeterHistory(readings, unitsSoFar));
        setBillSoFar(billForUnits(unitsSoFar));
        setError(null);
      } catch {
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
  const connected = !!lastReadingAt;

  return <div className="p-6 md:p-8 w-full space-y-6">
    <section className="rounded-3xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-8 text-white shadow-lg">
      <p className="text-sm font-semibold uppercase tracking-wide text-cyan-100">Live meter</p>
      <h1 className="mt-1 text-3xl font-bold">Household power at a glance</h1>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm"><span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-300 animate-pulse" : "bg-amber-300"}`} />{elapsedLabel(lastReadingAt)}</div>
    </section>

    <div className="grid md:grid-cols-2 gap-6">
      <section className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-all duration-300 ${flashPower ? "ring-2 ring-amber-300" : ""}`}><p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Current power</p><p className="text-4xl font-extrabold text-emerald-600 mt-2">{formatPower(totalPower ?? 0)}</p></section>
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"><p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Bill so far</p><p className="text-4xl font-extrabold text-emerald-600 mt-2">{"\u20B9"}{billSoFar ?? 0}</p></section>
    </div>

    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Meter reading history</h2><p className="text-sm text-gray-500 mt-1">Cumulative energy readings, oldest to newest.</p></div>
      {history.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-500"><tr><th className="px-6 py-3 font-medium">Time</th><th className="px-6 py-3 font-medium">Meter reading</th></tr></thead><tbody>{history.map((reading) => <tr key={reading._id} className="border-t border-gray-100"><td className="px-6 py-3 text-gray-600">{reading.receivedAt ? new Date(reading.receivedAt).toLocaleString() : "Unknown"}</td><td className="px-6 py-3 font-semibold text-gray-900">{reading.meterUnits.toFixed(3)} kWh</td></tr>)}</tbody></table></div> : <p className="px-6 py-8 text-sm text-gray-500">No meter readings are available yet. Connect the meter to start recording history.</p>}
    </section>
  </div>;
}
