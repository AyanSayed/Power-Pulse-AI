import { useState } from "react";
import { useBill } from "../context/BillContext";
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
  FaCloudUploadAlt,
  FaChartBar,
  FaIdCard,
  FaTrophy,
  FaCalculator,
  FaTools,
  FaShieldAlt,
} from "react-icons/fa";

const navSections = [
  { to: "/", label: "Dashboard", labelKey: "nav_dashboard", icon: <FaHome />, end: true },
  {
    key: "bills",
    label: "Bills",
    labelKey: "nav_bills",
    icon: <FaFileInvoiceDollar />,
    base: "/bills",
    children: [
      { to: "/bills/upload", label: "Upload Bill", labelKey: "nav_uploadBill", icon: <FaCloudUploadAlt /> },
      { to: "/bills/daily-usage", label: "Daily Usage", labelKey: "nav_dailyUsage", icon: <FaChartBar /> },
      { to: "/bills/history", label: "Bill History", labelKey: "nav_billHistory", icon: <FaHistory /> },
      { to: "/bills/health-check", label: "Bill Health Check", labelKey: "nav_billHealth", icon: <FaShieldAlt /> },
    ],
  },
  { to: "/budget", label: "Budget", labelKey: "nav_budget", icon: <FaWallet /> },
  {
    key: "ai-insights",
    label: "AI Insights",
    labelKey: "nav_aiInsights",
    icon: <FaBrain />,
    base: "/ai-insights",
    children: [
      { to: "/ai-insights", label: "Insights", labelKey: "nav_insights", icon: <FaBrain />, end: true },
      { to: "/ai-insights/appliances", label: "Appliances", labelKey: "nav_appliances", icon: <FaPlug /> },
      { to: "/ai-insights/audit-matrix", label: "Audit Matrix", labelKey: "nav_auditMatrix", icon: <FaCalculator /> },
      { to: "/ai-insights/carbon", label: "Carbon Footprint", labelKey: "nav_carbon", icon: <FaLeaf /> },
      { to: "/ai-insights/usage-trends", label: "Usage Trends", labelKey: "nav_usageTrends", icon: <FaChartArea /> },
    ],
  },
  { to: "/simulator", label: "Simulator", labelKey: "nav_simulator", icon: <FaSlidersH /> },
  { to: "/energy-tools", label: "Energy Tools", labelKey: "nav_energyTools", icon: <FaTools /> },
  { to: "/ac-advisor", label: "AC Advisor", labelKey: "nav_acAdvisor", icon: <FaCalculator /> },
  {
    key: "profile",
    label: "Profile",
    labelKey: "nav_profile",
    icon: <FaUser />,
    base: "/profile",
    children: [
      { to: "/profile", label: "Overview", labelKey: "nav_profileOverview", icon: <FaUser />, end: true },
      { to: "/profile/home-details", label: "Home Details", labelKey: "nav_homeDetails", icon: <FaIdCard /> },
      { to: "/profile/appliance-profile", label: "Appliance Profile", labelKey: "nav_applianceProfile", icon: <FaPlug /> },
      { to: "/profile/achievements", label: "Achievements", labelKey: "nav_achievements", icon: <FaTrophy /> },
    ],
  },
];

function Sidebar({ isOpen, onClose }) {
  const { dataTier } = useBill();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    navSections.forEach((s) => {
      if (s.children) initial[s.key] = location.pathname.startsWith(s.base);
    });
    return initial;
  });

  function toggleGroup(key) {
    setOpenGroups((prev) => ({ [key]: !prev[key] }));
  }

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
      className={`fixed top-0 left-0 z-40 w-64 h-dvh flex flex-col bg-navy text-white transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="shrink-0 flex items-center justify-between px-6 py-6 border-b border-navy-border">
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
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-6 space-y-2">
        {[
          ...navSections,
          { to: "/live-meter", label: "Live Meter", labelKey: "nav_liveMeter", icon: <FaChartLine /> },
        ].map((section) => {
          if (!section.children) {
            return (
              <NavLink
                key={section.to}
                to={section.to}
                end={section.end}
                onClick={handleChildClick}
                className={linkClass}
              >
                <span className="text-lg">{section.icon}</span>
                <span>{section.label}</span>
              </NavLink>
            );
          }

          const isOnSection = location.pathname.startsWith(section.base);
          const isOpen = !!openGroups[section.key];

          return (
            <div key={section.key}>
              <button
                onClick={() => toggleGroup(section.key)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isOnSection
                    ? "bg-navy-light text-white font-semibold"
                    : "text-gray-300 hover:bg-navy-light hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">{section.icon}</span>
                  <span>{section.label}</span>
                </span>
                <span className="text-sm">
                  {isOpen ? <FaAngleDown /> : <FaAngleRight />}
                </span>
              </button>

              {isOpen && (
                <div className="mt-1 ml-4 pl-3 border-l border-navy-border space-y-1">
                  {section.children.map((child) => (
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
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 px-6 py-5 border-t border-navy-border text-xs text-slate">
        <div className="flex items-center gap-2">
          <FaHistory />
          <span>Last synced 2 min ago</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
