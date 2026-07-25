import { NavLink } from "react-router-dom";
import {
  FaBolt,
  FaHome,
  FaFileInvoiceDollar,
  FaBrain,
  FaUser,
  FaTimes,
  FaHistory,
} from "react-icons/fa";

const links = [
  {
    to: "/",
    label: "Dashboard",
    icon: <FaHome />,
  },
  {
    to: "/bills",
    label: "Bills",
    icon: <FaFileInvoiceDollar />,
  },
  {
    to: "/ai-insights",
    label: "AI Insights",
    icon: <FaBrain />,
  },
  {
    to: "/profile",
    label: "Profile",
    icon: <FaUser />,
  },
];

function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-64 min-h-screen bg-navy text-white transition-transform duration-300 ${
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
            <h1 className="text-lg font-bold">
              PowerPulse
            </h1>

            <p className="text-xs text-slate">
              AI Energy Guardian
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-gray-300 hover:text-white"
        >
          <FaTimes />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2">

        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            onClick={() => {
              if (window.innerWidth < 768) onClose();
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-amber text-navy font-semibold"
                  : "text-gray-300 hover:bg-navy-light hover:text-white"
              }`
            }
          >
            <span className="text-lg">
              {link.icon}
            </span>

            <span>
              {link.label}
            </span>
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