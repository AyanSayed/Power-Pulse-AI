import { Link } from "react-router-dom";
import {
  FaBrain,
  FaLightbulb,
  FaExclamationTriangle,
  FaPlug,
  FaCloud,
  FaLeaf,
  FaChartArea,
  FaArrowRight,
} from "react-icons/fa";

const sections = [
  {
    to: "/ai-insights/analysis",
    title: "AI Analysis",
    desc: "Trend, prediction, and what the AI is seeing this month",
    icon: <FaBrain />,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    to: "/ai-insights/recommendations",
    title: "Recommendations",
    desc: "Personalized tips to lower your bill",
    icon: <FaLightbulb />,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    to: "/ai-insights/alerts",
    title: "Alerts & Diagnostics",
    desc: "Appliance issues flagged by the diagnostics engine",
    icon: <FaExclamationTriangle />,
    color: "bg-red-100 text-red-600",
  },
  {
    to: "/ai-insights/appliances",
    title: "Appliance Breakdown",
    desc: "Where your electricity is actually going",
    icon: <FaPlug />,
    color: "bg-purple-100 text-purple-600",
  },
  {
    to: "/ai-insights/weather",
    title: "Weather Impact",
    desc: "How local weather is affecting your usage",
    icon: <FaCloud />,
    color: "bg-sky-100 text-sky-600",
  },
  {
    to: "/ai-insights/carbon",
    title: "Carbon Footprint",
    desc: "Your estimated CO₂ emissions this month",
    icon: <FaLeaf />,
    color: "bg-green-100 text-green-600",
  },
  {
    to: "/ai-insights/usage-trends",
    title: "Usage Trends",
    desc: "Your monthly consumption over time",
    icon: <FaChartArea />,
    color: "bg-orange-100 text-orange-600",
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
          <Link
            key={s.to}
            to={s.to}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${s.color}`}
              >
                {s.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            </div>
            <div className="flex items-center gap-2 text-indigo-600 font-medium mt-4">
              Open <FaArrowRight />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AIInsightsPage;