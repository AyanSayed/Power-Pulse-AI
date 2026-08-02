import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const accentStyles = {
  indigo: "bg-indigo-600 hover:bg-indigo-700 text-white",
  amber: "bg-amber-500 hover:bg-amber-600 text-navy",
  red: "bg-red-500 hover:bg-red-600 text-white",
  teal: "bg-teal-600 hover:bg-teal-700 text-white",
};

function ViewMoreButton({ to, label = "View More", accent = "indigo" }) {
  return (
    <Link
      to={to}
      className={`w-full flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${accentStyles[accent]}`}
    >
      {label} <FaArrowRight size={12} />
    </Link>
  );
}

export default ViewMoreButton;