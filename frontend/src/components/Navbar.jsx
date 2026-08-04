import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaBell, FaSearch, FaBars, FaUser, FaSignOutAlt, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useBill } from "../context/BillContext";
import { LANGUAGES, useLanguage } from "../context/LanguageContext";

function Navbar({ onMenuClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { latestBill, estimatedBillRange, aiExplanation, weatherTemp } = useBill();
  const { language, setLanguage, t } = useLanguage();

  const notifications = [
    ...(latestBill
      ? [
          {
            id: 1,
            icon: "⚡",
            title: "Bill Uploaded",
            summary: "Bill uploaded successfully.",
           detail: `Your electricity bill for ${latestBill.month} was processed successfully. Units: ${latestBill.units} kWh, Amount: ₹${(latestBill.bill ?? 0).toLocaleString("en-IN")}, Status: ${latestBill.status}.`,
          },
        ]
      : []),
    ...(latestBill && estimatedBillRange?.high
      ? [
          {
            id: 2,
            icon: "📈",
            title: "Bill estimate",
            summary: `Estimated next bill: ₹${estimatedBillRange.low.toLocaleString("en-IN")}–₹${estimatedBillRange.high.toLocaleString("en-IN")}.`,
            detail: `${aiExplanation} This is an estimate range, not a guaranteed bill.`,
          },
        ]
      : []),
    ...(weatherTemp !== null && weatherTemp !== undefined
      ? [
          {
            id: 3,
            icon: "🌦",
            title: "Weather Alert",
            summary: "Weather may increase electricity usage today.",
            detail: `Current temperature is ${weatherTemp}°C. Higher temperatures typically increase AC usage, which can raise your electricity bill this month.`,
          },
        ]
      : []),
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    showToast("Logged out", "info");
    navigate("/login");
  };

  const handleBellClick = () => {
    setNotificationOpen((v) => !v);
    setHasUnread(false);
  };

  const handleNotificationClick = (n) => {
    setSelectedNotification(n);
    setNotificationOpen(false);
  };

  const firstName = user?.name?.split(" ")[0] || "there";
  const initial = user?.name?.charAt(0) || "A";

  return (
    <>
      <header className="energy-topbar flex items-center justify-between bg-white border-b border-gray-200 px-4 md:px-8 py-5">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="text-ink text-lg hover:text-amber transition">
            <FaBars />
          </button>
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-ink">
              Good evening, {firstName} 👋
            </h2>
            <p className="text-slate text-sm mt-0.5 hidden sm:block">
              Here's your electricity overview for today.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <label className="hidden sm:flex items-center gap-2 text-sm text-slate">
            <span className="sr-only">{t("language")}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="bg-mist border border-gray-200 rounded-lg px-2 py-2 text-sm text-ink outline-none"
              aria-label={t("language")}
            >
              {LANGUAGES.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}
            </select>
          </label>
          <div className="hidden md:flex items-center gap-2 bg-mist px-4 py-2 rounded-lg border border-gray-200">
            <FaSearch className="text-slate text-sm" />
            <input
              type="text"
              placeholder="Search bills, tips..."
              className="bg-transparent outline-none text-sm placeholder:text-slate w-40"
            />
          </div>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={handleBellClick}
              className="relative text-slate hover:text-ink transition"
            >
              <FaBell className="text-lg" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-coral rounded-full" />
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                <div className="px-4 py-3 border-b border-gray-100 font-display font-semibold text-sm text-ink">
                  Notifications
                </div>
                <div className="p-2">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg hover:bg-mist transition text-sm text-ink text-left"
                    >
                      <span className="text-base shrink-0">{n.icon}</span>
                      <span>{n.summary}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="w-10 h-10 rounded-full bg-amber flex items-center justify-center font-display font-bold text-navy"
            >
              {initial}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1.5 z-50">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-mist transition"
                >
                  <FaUser className="text-slate" /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-coral hover:bg-mist transition text-left"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {selectedNotification && (
        <div
          onClick={() => setSelectedNotification(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full md:w-1/2 max-w-xl p-8 relative"
          >
            <button
              onClick={() => setSelectedNotification(null)}
              className="absolute top-5 right-5 text-slate hover:text-ink transition"
            >
              <FaTimes className="text-lg" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedNotification.icon}</span>
              <h3 className="font-display text-xl font-semibold text-ink">
                {selectedNotification.title}
              </h3>
            </div>

            <p className="text-ink text-sm leading-relaxed">{selectedNotification.detail}</p>

            <button
              onClick={() => setSelectedNotification(null)}
              className="mt-6 bg-amber text-navy font-display font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
