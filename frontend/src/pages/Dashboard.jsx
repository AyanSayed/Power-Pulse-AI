import { useState, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaBolt,
  FaChartLine,
  FaFileUpload,
} from "react-icons/fa";

import WeatherCard from "../components/WeatherCard";
import SummaryCard from "../components/SummaryCard";
import EnergyScoreRing from "../components/EnergyScoreRing";
import RunRateGauge from "../components/RunRateGauge";
import DashboardHero from "../components/DashboardHero";
import BudgetMiniCard from "../components/BudgetMiniCard";
import UsageMiniChart from "../components/UsageMiniChart";
import AISummaryPreview from "../components/AISummaryPreview";
import RecommendationPreview from "../components/RecommendationPreview";
import AlertPreview from "../components/AlertPreview";

import EmptyState from "../components/EmptyState";
import CountUp from "../components/CountUp";
import { SkeletonCard, SkeletonBlock } from "../components/Skeleton";

import { useBill } from "../context/BillContext";

function Dashboard() {
  const [loading, setLoading] = useState(true);

  const {
    hasBill,
    bills,
    latestBill,
    trendPercent,
    energyScore,
    predictedBill,
    estimatedBillRange,
  } = useBill();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <SkeletonBlock height="h-56" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonBlock height="h-60" />
          <SkeletonBlock height="h-60" />
          <SkeletonBlock height="h-60" />
        </div>
      </div>
    );
  }

  if (!hasBill) {
    return (
      <EmptyState
  icon={<FaFileUpload />}
  title="No bill uploaded yet"
  message="Upload your first electricity bill to unlock AI insights and smart recommendations."
  actionLabel="Upload Bill"
  actionTo="/bills/upload"
/>
    );
  }

  return (
    <div className="space-y-8">

      {/* Hero */}
      <DashboardHero trendPercent={trendPercent} />

      {/* Live Run Rate */}
      <RunRateGauge />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard
          title="Current Bill"
          value={<CountUp end={latestBill?.bill ?? 0} prefix="₹" />}
          icon={<FaMoneyBillWave />}
          accent="amber"
        />

        <SummaryCard
          title="Units Consumed"
          value={<CountUp end={latestBill?.units ?? 0} suffix=" kWh" />}
          icon={<FaBolt />}
          accent="navy"
        />

        <SummaryCard
          title="Estimated Next Bill"
          value={<span className="text-xl">₹{estimatedBillRange.low.toLocaleString("en-IN")}–₹{estimatedBillRange.high.toLocaleString("en-IN")}</span>}
          icon={<FaChartLine />}
          accent="coral"
          subtitle={estimatedBillRange.confidence}
        />

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center justify-center">
          <EnergyScoreRing score={energyScore} />
        </div>
      </div>

      {/* Budget + Usage teasers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetMiniCard />
        <UsageMiniChart data={bills} />
      </div>

      {/* Weather */}
      <WeatherCard />

      {/* AI Preview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AISummaryPreview />
        <RecommendationPreview />
        <AlertPreview />
      </div>

    </div>
  );
}

export default Dashboard;
