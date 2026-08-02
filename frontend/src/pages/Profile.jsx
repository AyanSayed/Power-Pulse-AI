import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBolt,
  FaHome,
  FaAward,
  FaLeaf,
  FaIdCard,
  FaTrophy,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import { useBill } from "../context/BillContext";
import EnergyScoreRing from "../components/EnergyScoreRing";
import QuickLinkCard from "../components/QuickLinkCard";

const sections = [
  {
    to: "/profile/home-details",
    title: "Home Details",
    desc: "House type, residents, and edit your info",
    icon: <FaIdCard />,
    iconBg: "bg-indigo-100 text-indigo-600",
    accent: "indigo",
  },
  {
    to: "/profile/achievements",
    title: "Achievements",
    desc: "Badges you've earned so far",
    icon: <FaTrophy />,
    iconBg: "bg-yellow-100 text-yellow-600",
    accent: "amber",
  },
];

function Profile() {
  const { user } = useAuth();
  const { bills, energyScore, carbonKg } = useBill();

  const name = user?.name || "Ayan Sharma";
  const email = user?.email || "ayan@example.com";
  const initial = name.charAt(0);

  const totalUnits = bills.reduce((sum, bill) => sum + bill.units, 0);
  const billsUploaded = bills.length;
  const totalCarbon = bills.reduce((sum, bill) => sum + bill.units * 0.82, 0);

  const performance =
    energyScore >= 85
      ? { title: "Excellent Energy Efficiency", color: "text-green-600" }
      : energyScore >= 70
      ? { title: "Good Energy Efficiency", color: "text-emerald-600" }
      : energyScore >= 50
      ? { title: "Average Performance", color: "text-yellow-600" }
      : { title: "Needs Improvement", color: "text-red-600" };

  return (
    <div className="space-y-8">

      {/* HERO */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-5xl font-bold border-4 border-white/30">
              {initial}
            </div>
            <div>
              <h1 className="text-4xl font-bold">{name}</h1>
              <p className="text-blue-100 mt-2">PowerPulse AI Member</p>
              <div className="flex flex-wrap gap-5 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <FaEnvelope />
                  {email}
                </div>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt />
                  Navi Mumbai
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt />
                  Member Since 2026
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 text-gray-900 min-w-[260px]">
            <EnergyScoreRing score={energyScore} />
            <div className="text-center mt-5">
              <p className={`font-semibold ${performance.color}`}>{performance.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaBolt className="text-yellow-500 text-xl" />
            <h3 className="font-semibold text-gray-900">Lifetime Usage</h3>
          </div>
          <p className="text-3xl font-bold">{totalUnits}</p>
          <p className="text-gray-500 mt-2">kWh Consumed</p>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaHome className="text-indigo-600 text-xl" />
            <h3 className="font-semibold">Bills Uploaded</h3>
          </div>
          <p className="text-3xl font-bold">{billsUploaded}</p>
          <p className="text-gray-500 mt-2">Bills Processed</p>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaAward className="text-green-600 text-xl" />
            <h3 className="font-semibold">Energy Score</h3>
          </div>
          <p className="text-3xl font-bold">{energyScore}/100</p>
          <p className={`mt-2 ${performance.color}`}>{performance.title}</p>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaLeaf className="text-emerald-600 text-xl" />
            <h3 className="font-semibold">Carbon Saved</h3>
          </div>
          <p className="text-3xl font-bold">{Math.round(totalCarbon)} kg</p>
          <p className="text-gray-500 mt-2">Estimated CO₂ Offset</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {sections.map((s) => (
          <QuickLinkCard key={s.to} {...s} />
        ))}
      </div>

    </div>
  );
}

export default Profile;