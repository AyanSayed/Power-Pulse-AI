import { FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaBolt, FaHome, FaAward, FaIdCard } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useBill } from "../context/BillContext";
import EnergyScoreRing from "../components/EnergyScoreRing";
import QuickLinkCard from "../components/QuickLinkCard";

const sections = [{ to: "/profile/home-details", title: "Home Details", desc: "House type, residents, and edit your info", icon: <FaIdCard />, iconBg: "bg-indigo-100 text-indigo-600", accent: "indigo" }];

export default function Profile() {
  const { user } = useAuth();
  const { bills, energyScore } = useBill();
  const name = user?.name || "Ayan Sharma";
  const performance = energyScore >= 85 ? { title: "Excellent Energy Efficiency", color: "text-green-600" } : energyScore >= 70 ? { title: "Good Energy Efficiency", color: "text-emerald-600" } : energyScore >= 50 ? { title: "Average Performance", color: "text-yellow-600" } : { title: "Needs Improvement", color: "text-red-600" };
  const stats = [
    { icon: <FaBolt className="text-yellow-500 text-xl" />, title: "Lifetime Usage", value: bills.reduce((sum, bill) => sum + bill.units, 0), note: "kWh Consumed" },
    { icon: <FaHome className="text-indigo-600 text-xl" />, title: "Bills Uploaded", value: bills.length, note: "Bills Processed" },
    { icon: <FaAward className="text-green-600 text-xl" />, title: "Energy Score", value: `${energyScore}/100`, note: performance.title, noteClass: performance.color },
  ];
  return <div className="space-y-8">
    <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-8 text-white shadow-lg"><div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8"><div className="flex items-center gap-6"><div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-5xl font-bold border-4 border-white/30">{name.charAt(0)}</div><div><h1 className="text-4xl font-bold">{name}</h1><p className="text-blue-100 mt-2">PowerPulse AI Member</p><div className="flex flex-wrap gap-5 mt-6 text-sm"><span className="flex items-center gap-2"><FaEnvelope />{user?.email || "ayan@example.com"}</span><span className="flex items-center gap-2"><FaMapMarkerAlt />Navi Mumbai</span><span className="flex items-center gap-2"><FaCalendarAlt />Member Since 2026</span></div></div></div><div className="bg-white rounded-2xl p-6 text-gray-900 min-w-[260px]"><EnergyScoreRing score={energyScore} /><p className={`text-center mt-5 font-semibold ${performance.color}`}>{performance.title}</p></div></div></div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{stats.map((stat) => <div key={stat.title} className="bg-white rounded-2xl border shadow-sm p-6"><div className="flex items-center gap-3 mb-4">{stat.icon}<h3 className="font-semibold text-gray-900">{stat.title}</h3></div><p className="text-3xl font-bold">{stat.value}</p><p className={`mt-2 ${stat.noteClass || "text-gray-500"}`}>{stat.note}</p></div>)}</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{sections.map((section) => <QuickLinkCard key={section.to} {...section} />)}</div>
  </div>;
}
