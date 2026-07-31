import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaBolt,
  FaHome,
  FaFileInvoiceDollar,
  FaBrain,
  FaUser,
  FaTimes,
  FaHistory,
  FaChartLine,
  FaWallet,
  FaSlidersH,
  FaAngleDown,
  FaAngleRight,
  FaLightbulb,
  FaExclamationTriangle,
  FaPlug,
  FaCloud,
  FaLeaf,
  FaChartArea,
} from "react-icons/fa";

const topLinks = [
  { to: "/", label: "Dashboard", icon: <FaHome /> },
  { to: "/bills", label: "Bills", icon: <FaFileInvoiceDollar /> },
  { to: "/budget", label: "Budget", icon: <FaWallet /> },
];

const aiInsightsChildren = [
  { to: "/ai-insights", label: "Overview", icon: <FaBrain />, end: true },
  { to: "/ai-insights/analysis", label: "AI Analysis", icon: <FaBrain /> },
  { to: "/ai-insights/recommendations", label: "Recommendations", icon: <FaLightbulb /> },
  { to: "/ai-insights/alerts", label: "Alerts", icon: <FaExclamationTriangle /> },
  { to: "/ai-insights/appliances", label: "Appliances", icon: <FaPlug /> },
  { to: "/ai-insights/weather", label: "Weather", icon: <FaCloud /> },
  { to: "/ai-insights/carbon", label: "Carbon Footprint", icon: <FaLeaf /> },
  { to: "/ai-insights/usage-trends", label: "Usage Trends", icon: <FaChartArea /> },
];

const bottomLinks = [
  { to: "/simulator", label: "Simulator", icon: <FaSlidersH /> },
  { to: "/live-meter", label: "Live Meter", icon: <FaChartLine /> },
  { to: "/profile", label: "Profile", icon: <FaUser /> },
];

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const isOnAiInsights = location.pathname.startsWith("/ai-insights");
  const [aiOpen, setAiOpen] = useState(isOnAiInsights);

  function handleChildClick() {
    if (window.innerWidth < 768) onClose();
  }

  function linkClass({ isActive }) {
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-amber text-navy font-semibold"
        : "text-gray-300 hover:bg-navy-light hover:text-white"
    }`;
  }

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-64 min-h-screen bg-navy text-white transition-transform duration-300 overflow-y-auto ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-navy-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center">
            <FaBolt className="text-amber text-xl bolt-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold">PowerPulse</h1>
            <p className="text-xs text-slate">AI Energy Guardian</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-white">
          <FaTimes />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {topLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            onClick={handleChildClick}
            className={linkClass}
          >
            <span className="text-lg">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}

        {/* AI Insights — expandable */}
        <div>
          <button
            onClick={() => setAiOpen((v) => !v)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isOnAiInsights
                ? "bg-navy-light text-white font-semibold"
                : "text-gray-300 hover:bg-navy-light hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="text-lg">
                <FaBrain />
              </span>
              <span>AI Insights</span>
            </span>
            <span className="text-sm">
              {aiOpen ? <FaAngleDown /> : <FaAngleRight />}
            </span>
          </button>

          {aiOpen && (
            <div className="mt-1 ml-4 pl-3 border-l border-navy-border space-y-1">
              {aiInsightsChildren.map((child) => (
                <NavLink
                  key={child.to}
                  to={child.to}
                  end={child.end}
                  onClick={handleChildClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-amber text-navy font-semibold"
                        : "text-gray-400 hover:bg-navy-light hover:text-white"
                    }`
                  }
                >
                  <span className="text-sm">{child.icon}</span>
                  <span>{child.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {bottomLinks.map((link) => (
          <NavLink key={link.to} to={link.to} onClick={handleChildClick} className={linkClass}>
            <span className="text-lg">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-navy-border text-xs text-slate">
        <div className="flex items-center gap-2">
          <FaHistory />
          <span>Last synced 2 min ago</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;