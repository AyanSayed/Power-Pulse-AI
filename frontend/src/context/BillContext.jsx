import { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../services/apiClient";
import { useAuth } from "./AuthContext";
import { estimateApplianceBreakdown, estimateProfileMonthlyUnits, getDataTier, getTierInfo } from "../utils/nilmEngine";
import { billForUnits } from "../utils/slabRates";
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CITY = "Mumbai"; // hardcoded for demo — no user location settings yet

export function BillProvider({ children }) {
  const { token } = useAuth();
  const [bills, setBills] = useState([]);

  const [weather, setWeather] = useState(null); // { temperature, humidity, windspeed, weathercode }
  const [aiData, setAiData] = useState(null);    // { stats, insights } from /api/analysis

  // --- Three-Tier Data Pyramid state ---
  const [applianceProfile, setApplianceProfileState] = useState(() => loadApplianceProfile());
  const [pincode, setPincodeState] = useState(() => loadPincode());
  const [latestMeterDoc, setLatestMeterDoc] = useState(null); // most recent /api/meter-reading doc, if any

  useEffect(() => {
    if (!token) {
      setLatestMeterDoc(null);
      return undefined;
    }

    const fetchLatestReading = async () => {
      try {
        const res = await apiClient.get("/api/meter-reading?limit=1");
        const docs = Array.isArray(res.data) ? res.data : [];
        setLatestMeterDoc(docs[0] || null);
      } catch (err) {
        // No sensors connected yet — perfectly normal, just stay on Tier 1/2.
        setLatestMeterDoc(null);
      }
    };
    fetchLatestReading();
    const interval = setInterval(fetchLatestReading, 15000);
    return () => clearInterval(interval);
  }, [token]);

  function setApplianceProfile(profile) {
    persistApplianceProfile(profile);
    setApplianceProfileState(profile);
  }

  function setPincode(value) {
    persistPincode(value);
    setPincodeState(value);
  }

  async function refreshBills() {
    try {
      const res = await apiClient.get("/api/bills");
      setBills(res.data);
    } catch (err) {
      console.error("Bill fetch failed:", err);
    }
  }

  // Fetch bills on load
  useEffect(() => {
    if (!token) {
      setBills([]);
      setAiData(null);
      return;
    }
    refreshBills();
  }, [token]);

  // Fetch weather once
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await apiClient.get(`/api/weather/${CITY}`);
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
        const res = await apiClient.get("/api/analysis");
        setAiData(res.data);
      } catch (err) {
        console.error("AI analysis fetch failed:", err);
      }
    };
    fetchAnalysis();
  }, [bills.length]);

  const latestBill = bills.length ? bills[bills.length - 1] : null;
  const previousBill = bills.length > 1 ? bills[bills.length - 2] : null;


  const hasBill = !!latestBill;

  // --- Three-Tier Data Pyramid: tier detection (available even with no bill yet) ---
  const hasApplianceProfile = isApplianceProfileMeaningful(applianceProfile);
  const hasLiveSensorData =
    !!latestMeterDoc?.receivedAt &&
    Date.now() - new Date(latestMeterDoc.receivedAt).getTime() < LIVE_SENSOR_FRESHNESS_MS;
  const dataTier = getDataTier({ hasApplianceProfile, hasLiveSensorData });
  const tierInfo = getTierInfo(dataTier);

  // Defined here (not inside the !latestBill branch) so it works correctly
  // for a brand-new user's very first bill upload, not just subsequent ones.
  function generateExtraction() {
    if (!latestBill) {
      // No prior bill to base an estimate on yet — this is only used by the
      // demo "simulate next month" flow, not the real upload path.
      return null;
    }
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
      const status =
        latestBill && extracted.units > latestBill.units * 1.08 ? "High" : "Normal";

      await apiClient.post("/api/bills", {
        month: extracted.month,
        units: extracted.units,
        bill: extracted.bill,
        status,
        consumerNumber: extracted.consumerNumber,
      });

      await refreshBills();
      return true;
    } catch (err) {
      console.error("Confirm bill failed:", err);
      throw err;
    }
  }

  if (!latestBill) {
  return (
    <BillContext.Provider
      value={{
        bills: [],
        hasBill,
        ...
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

  const trendPercent = aiData?.stats?.percentChange
    ? Number(aiData.stats.percentChange)
    : previousBill
    ? ((latestBill.units - previousBill.units) / previousBill.units) * 100
    : 0;
  const weatherTemp = weather?.temperature ?? null;
  

  // Forecasts are ranges, not promises. Tier 2 narrows uncertainty using the
  // declared appliance profile; it does not pretend to measure appliances.
  const recentBills = bills.slice(-3);
  const historicalUnits = recentBills.reduce((sum, bill) => sum + bill.units, 0) / recentBills.length;
  const profileUnits = dataTier >= 2 ? estimateProfileMonthlyUnits({ applianceProfile, weatherTemp }) : 0;
  const expectedUnits = profileUnits > 0 ? historicalUnits * 0.75 + profileUnits * 0.25 : historicalUnits;
  const tariffBaseline = billForUnits(historicalUnits);
  const actualBaseline = recentBills.reduce((sum, bill) => sum + bill.bill, 0) / recentBills.length;
  const billAdjustment = tariffBaseline > 0 ? actualBaseline / tariffBaseline : 1;
  const estimatedBill = Math.round(billForUnits(expectedUnits) * billAdjustment);
  const uncertainty = dataTier >= 2 ? 0.12 : 0.22;
  const estimatedBillRange = {
    low: Math.round(estimatedBill * (1 - uncertainty)),
    high: Math.round(estimatedBill * (1 + uncertainty)),
    midpoint: estimatedBill,
    confidence: dataTier >= 2 ? "Personalised estimate" : "Baseline estimate",
  };
  // Retained as the midpoint for the simulator until it becomes range-aware.
  const predictedBill = estimatedBillRange.midpoint;
  const aiExplanation = aiData?.insights?.summary
    ?? (previousBill
      ? "Loading AI insights..."
      : "Upload a few more bills so I can start comparing month-to-month trends.");


const weatherPenalty =
  weatherTemp && weatherTemp > 30 ? 6 : 0;

const trendPenalty =
  latestBill ? Math.max(trendPercent, 0) * 1.4 : 0;

const energyScore = latestBill
  ? Math.max(
      0,
      Math.min(
        100,
        Math.round(100 - trendPenalty - weatherPenalty)
      )
    )
  : 0;

  const applianceBreakdown = estimateApplianceBreakdown({
  hasApplianceProfile,
  applianceProfile,
  weatherTemp,
});


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
        estimatedBillRange,
        aiExplanation,
        weatherTemp,
        weatherHumidity: weather?.humidity ?? null,
        weatherCondition: weather?.weathercode ?? null,
        applianceBreakdown,
        generateExtraction,
        confirmBill,
        dataTier,
        hasApplianceProfile,
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
