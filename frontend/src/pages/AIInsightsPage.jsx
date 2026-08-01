import {
  FaBrain,
  FaLightbulb,
  FaExclamationTriangle,
  FaPlug,
  FaCloud,
  FaLeaf,
  FaChartArea,
} from "react-icons/fa";
import QuickLinkCard from "../components/QuickLinkCard";

const sections = [
  {
    to: "/ai-insights/analysis",
    title: "AI Analysis",
    desc: "Trend, prediction, and what the AI is seeing this month",
    icon: <FaBrain />,
    iconBg: "bg-indigo-100 text-indigo-600",
    accent: "indigo",
  },
  {
    to: "/ai-insights/recommendations",
    title: "Recommendations",
    desc: "Personalized tips to lower your bill",
    icon: <FaLightbulb />,
    iconBg: "bg-yellow-100 text-yellow-600",
    accent: "amber",
  },
  {
    to: "/ai-insights/alerts",
    title: "Alerts & Diagnostics",
    desc: "Appliance issues flagged by the diagnostics engine",
    icon: <FaExclamationTriangle />,
    iconBg: "bg-red-100 text-red-600",
    accent: "red",
  },
  {
    to: "/ai-insights/appliances",
    title: "Appliance Breakdown",
    desc: "Where your electricity is actually going",
    icon: <FaPlug />,
    iconBg: "bg-purple-100 text-purple-600",
    accent: "purple",
  },
  {
    to: "/ai-insights/weather",
    title: "Weather Impact",
    desc: "How local weather is affecting your usage",
    icon: <FaCloud />,
    iconBg: "bg-sky-100 text-sky-600",
    accent: "sky",
  },
  {
    to: "/ai-insights/carbon",
    title: "Carbon Footprint",
    desc: "Your estimated CO₂ emissions this month",
    icon: <FaLeaf />,
    iconBg: "bg-green-100 text-green-600",
    accent: "green",
  },
  {
    to: "/ai-insights/usage-trends",
    title: "Usage Trends",
    desc: "Your monthly consumption over time",
    icon: <FaChartArea />,
    iconBg: "bg-orange-100 text-orange-600",
    accent: "orange",
  },
];

function AIInsightsPage() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold">AI Insights</h1>
        <p className="mt-3 text-blue-100 max-w-3xl leading-7">
          Your personal AI energy assistant — pick an area below to dig in.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {sections.map((s) => (
          <QuickLinkCard key={s.to} {...s} buttonLabel="Open" />
        ))}
      </div>
    </div>
  );
}

export default AIInsightsPage;