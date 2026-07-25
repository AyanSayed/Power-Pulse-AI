import { useEffect, useState } from "react";
import CountUp from "./CountUp";

function EnergyScoreRing({ score = 82 }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimatedScore(score));
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const getStatus = () => {
    if (score >= 85)
      return {
        text: "🟢 Excellent",
        color: "text-green-600",
        change: "+8 from last month",
      };

    if (score >= 70)
      return {
        text: "🟢 Good",
        color: "text-green-600",
        change: "+6 from last month",
      };

    if (score >= 50)
      return {
        text: "🟡 Average",
        color: "text-yellow-600",
        change: "-2 from last month",
      };

    return {
      text: "🔴 Poor",
      color: "text-red-600",
      change: "-8 from last month",
    };
  };

  const status = getStatus();

  return (
    <div className="flex items-center gap-6">

      <div className="relative">
        <svg
          width="110"
          height="110"
          viewBox="0 0 100 100"
          className="-rotate-90"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="9"
            fill="none"
          />

          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#4F46E5"
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s ease",
            }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">
            <CountUp end={score} duration={1000} />
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Energy Score
        </h3>

        <p className="text-sm text-gray-500">
          Out of 100
        </p>

        <p className={`mt-3 font-semibold ${status.color}`}>
          {status.text}
        </p>

        <p className="text-sm text-gray-500 mt-1">
          {status.change}
        </p>
      </div>

    </div>
  );
}

export default EnergyScoreRing;