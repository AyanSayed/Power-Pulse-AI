import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const accentStyles = {
  indigo: "bg-indigo-600 hover:bg-indigo-700 text-white",
  amber: "bg-amber-500 hover:bg-amber-600 text-navy",
  red: "bg-red-500 hover:bg-red-600 text-white",
  teal: "bg-teal-600 hover:bg-teal-700 text-white",
  purple: "bg-purple-600 hover:bg-purple-700 text-white",
  sky: "bg-sky-500 hover:bg-sky-600 text-white",
  green: "bg-green-600 hover:bg-green-700 text-white",
  orange: "bg-orange-500 hover:bg-orange-600 text-white",
  yellow: "bg-yellow-500 hover:bg-yellow-600 text-navy",
};

function QuickLinkCard({ to, icon, iconBg, title, desc, accent = "indigo", buttonLabel = "Open" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${iconBg}`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{desc}</p>
      </div>

      <Link
        to={to}
        className={`w-full flex items-center justify-center gap-2 mt-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${accentStyles[accent]}`}
      >
        {buttonLabel} <FaArrowRight size={12} />
      </Link>
    </div>
  );
}

export default QuickLinkCard;