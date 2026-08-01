import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { estimateApplianceBreakdown, getDataTier, getTierInfo } from "../utils/nilmEngine";
import {
  loadApplianceProfile,
  saveApplianceProfile as persistApplianceProfile,
  loadPincode,
  savePincode as persistPincode,
  isApplianceProfileMeaningful,
} from "../utils/applianceProfileStorage";

const BillContext = createContext(null);

// A live sensor reading only counts as "Tier 3" if it's recent — a device
// that hasn't reported in a while shouldn't silently keep claiming the
// highest, most-trusted tier.
const LIVE_SENSOR_FRESHNESS_MS = 30 * 60 * 1000; // 30 minutes

const API_URL = import.meta.env.VITE_API_URL;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CITY = "Mumbai"; // hardcoded for demo — no user location settings yet

export function BillProvider({ children }) {
  const [bills, setBills] = useState([]);

  const [weather, setWeather] = useState(null); // { temperature, humidity, windspeed, weathercode }
  const [aiData, setAiData] = useState(null);    // { stats, insights } from /api/analysis

  // --- Three-Tier Data Pyramid state ---
  const [applianceProfile, setApplianceProfileState] = useState(() => loadApplianceProfile());
  const [pincode, setPincodeState] = useState(() => loadPincode());
  const [latestMeterDoc, setLatestMeterDoc] = useState(null); // most recent /api/meter-reading doc, if any

  // Fetch the most recent live sensor reading once, to detect Tier 3 eligibility.
  // Poll for the most recent live sensor reading, to detect Tier 3 eligibility.
  // A one-time fetch on mount isn't enough — the smart meter can come online
  // (or drop off) at any point during a session, so we re-check periodically
  // the same way LiveMeter.jsx polls for live readings.
  useEffect(() => {
    const fetchLatestReading = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/meter-reading?limit=1`);
        const docs = Array.isArray(res.data) ? res.data : [];
        setLatestMeterDoc(docs[0] || null);
      } catch (err) {
        // No sensors connected yet — perfectly normal, just stay on Tier 1/2.
        setLatestMeterDoc(null);
      }
    };
    fetchLatestReading();
    const interval = setInterval(fetchLatestReading, 15000); // re-check every 15s
    return () => clearInterval(interval);
  }, []);

  function setApplianceProfile(profile) {
    persistApplianceProfile(profile);
    setApplianceProfileState(profile);
  }

  function setPincode(value) {
    persistPincode(value);
    setPincodeState(value);
  }

  // Fetch bills on load
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/bills`);
        setBills(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBills();
  }, []);

  // Fetch weather once
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/weather/${CITY}`);
        setWeather(res.data);
      } catch (err) {
        console.error("Weather fetch failed:", err);
      }
    };
    fetchWeather();
  }, []);

  // Fetch AI analysis whenever bills change (new bill uploaded -> refresh insights)
  useEffect(() => {
    if (bills.length === 0) return;
    const fetchAnalysis = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/analysis`);
        setAiData(res.data);
      } catch (err) {
        console.error("AI analysis fetch failed:", err);
      }
    };
    fetchAnalysis();
  }, [bills.length]);

  const latestBill = bills.length ? bills[bills.length - 1] : null;
  const previousBill = bills.length > 1 ? bills[bills.length - 2] : null;

  // Always derived live from real data — can never drift out of sync,
  // no matter how many times bills are added or deleted.
  const hasBill = !!latestBill;

  // --- Three-Tier Data Pyramid: tier detection (available even with no bill yet) ---
  const hasApplianceProfile = isApplianceProfileMeaningful(applianceProfile);
  const hasLiveSensorData =
    !!latestMeterDoc?.receivedAt &&
    Date.now() - new Date(latestMeterDoc.receivedAt).getTime() < LIVE_SENSOR_FRESHNESS_MS;
  const dataTier = getDataTier({ hasApplianceProfile, hasLiveSensorData });
  const tierInfo = getTierInfo(dataTier);

  if (!latestBill) {
    return (
      <BillContext.Provider
        value={{
          bills: [],
          hasBill,
          latestBill: null,
          previousBill: null,
          trendPercent: 0,
          energyScore: 0,
          predictedBill: 0,
          aiExplanation: "Upload a bill to get started.",
          weatherTemp: weather?.temperature ?? null,
          weatherHumidity: weather?.humidity ?? null,
          weatherCondition: weather?.weathercode ?? null,
          carbonKg: 0,
          applianceBreakdown: [],
          faultAlert: null,
          generateExtraction: () => null,
          confirmBill: async () => {},
          dataTier,
          tierInfo,
          applianceProfile,
          setApplianceProfile,
          pincode,
          setPincode,
        }}
      >
        {children}
      </BillContext.Provider>
    );
  }

  // Prefer real backend-computed values (from /api/analysis) when available,
  // fall back to a simple client-side estimate while the AI call is in flight.
  const trendPercent = aiData?.stats?.percentChange
    ? Number(aiData.stats.percentChange)
    : previousBill
    ? ((latestBill.units - previousBill.units) / previousBill.units) * 100
    : 0;

  const predictedBill = aiData?.stats?.predictedNextBill
    ? Number(aiData.stats.predictedNextBill)
    : Math.round(latestBill.bill * (1 + Math.max(trendPercent, 0) / 100 + 0.03));

  const aiExplanation = aiData?.insights?.summary
    ?? (previousBill
      ? "Loading AI insights..."
      : "Upload a few more bills so I can start comparing month-to-month trends.");

  const weatherTemp = weather?.temperature ?? null;
  const weatherPenalty = weatherTemp && weatherTemp > 30 ? 6 : 0;
  const trendPenalty = Math.max(trendPercent, 0) * 1.4;
  const energyScore = Math.max(0, Math.min(100, Math.round(100 - trendPenalty - weatherPenalty)));

  const EMISSION_FACTOR = 0.82;
  const carbonKg = Math.round(latestBill.units * EMISSION_FACTOR);

  // Three-Tier Data Pyramid: Tier 3 uses real sensor readings, Tier 2 infers
  // the split via NILM/Virtual Sub-Metering from the appliance checklist +
  // weather, Tier 1 falls back to a generic weather-nudged estimate.
  const applianceBreakdown = estimateApplianceBreakdown({
    tier: dataTier,
    applianceProfile,
    weatherTemp,
    latestReadings: latestMeterDoc?.readings,
  });

  const faultAlert = aiData?.insights?.alert
    ? { appliance: "Unusual usage", percent: Math.round(Math.abs(trendPercent)) }
    : trendPercent > 8
    ? { appliance: "Water Heater", percent: Math.min(60, Math.round(trendPercent * 2.2)) }
    : null;

  function generateExtraction() {
    const nextMonthIndex = (MONTHS.indexOf(latestBill.month) + 1) % 12;
    const variance = 0.9 + Math.random() * 0.3;
    const units = Math.round(latestBill.units * variance);
    const bill = Math.round(units * 8.2);
    return {
      month: MONTHS[nextMonthIndex],
      units,
      bill,
      consumerNumber: "PP-88213",
    };
  }

  async function confirmBill(extracted) {
    try {
      const status = extracted.units > latestBill.units * 1.08 ? "High" : "Normal";

      await axios.post(`${API_URL}/api/bills`, {
        user: latestBill.user,
        month: extracted.month,
        units: extracted.units,
        bill: extracted.bill,
        status,
        consumerNumber: extracted.consumerNumber,
      });

      const res = await axios.get(`${API_URL}/api/bills`);
      setBills(res.data);
      // hasBill is derived from bills/latestBill above — no manual flag to set.
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <BillContext.Provider
      value={{
        bills,
        hasBill,
        latestBill,
        previousBill,
        trendPercent,
        energyScore,
        predictedBill,
        aiExplanation,
        weatherTemp,
        weatherHumidity: weather?.humidity ?? null,
        weatherCondition: weather?.weathercode ?? null,
        carbonKg,
        applianceBreakdown,
        faultAlert,
        generateExtraction,
        confirmBill,
        dataTier,
        tierInfo,
        applianceProfile,
        setApplianceProfile,
        pincode,
        setPincode,
      }}
    >
      {children}
    </BillContext.Provider>
  );
}

export function useBill() {
  const ctx = useContext(BillContext);
  if (!ctx) throw new Error("useBill must be used inside BillProvider");
  return ctx;
}