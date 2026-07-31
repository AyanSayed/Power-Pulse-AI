import { useState, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaBolt,
  FaChartLine,
  FaFileUpload,
} from "react-icons/fa";

import SummaryCard from "../components/SummaryCard";
import EnergyScoreRing from "../components/EnergyScoreRing";
import UsageChart from "../components/UsageChart";
import RunRateGauge from "../components/RunRateGauge";
import BudgetTracker from "../components/BudgetTracker";
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
  } = useBill();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <SkeletonBlock height="h-72" />

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
        actionTo="/bills"
      />
    );
  }

  return (
    <div className="space-y-8">

      {/* Energy Budget Run Rate */}

      <RunRateGauge />
      <BudgetTracker />
      {/* Summary Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <SummaryCard
          title="Current Bill"
          value={<CountUp end={latestBill.bill} prefix="₹" />}
          icon={<FaMoneyBillWave />}
          accent="amber"
        />

        <SummaryCard
          title="Units Consumed"
          value={<CountUp end={latestBill.units} suffix=" kWh" />}
          icon={<FaBolt />}
          accent="navy"
        />

        <SummaryCard
          title="Predicted Bill"
          value={<CountUp end={predictedBill} prefix="₹" />}
          icon={<FaChartLine />}
          accent="coral"
          trend={{
            up: trendPercent > 0,
            label: `${Math.abs(trendPercent).toFixed(0)}% vs last month`,
          }}
        />

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center justify-center">
          <EnergyScoreRing score={energyScore} />
        </div>

      </div>

      {/* Monthly Usage */}

      <UsageChart data={bills} />

      {/* Dashboard Preview Cards */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <AISummaryPreview />

        <RecommendationPreview />

        <AlertPreview />

      </div>

    </div>
  );
}

export default Dashboard;