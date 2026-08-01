import { Link } from "react-router-dom";
import { FaLayerGroup, FaArrowRight, FaCheckCircle } from "react-icons/fa";

const TIER_STYLES = {
  1: { bg: "bg-slate-50", border: "border-slate-200", dot: "bg-slate-400", text: "text-slate-700" },
  2: { bg: "bg-indigo-50", border: "border-indigo-200", dot: "bg-indigo-500", text: "text-indigo-700" },
  3: { bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-700" },
};

// tierInfo comes from useBill() -> { tier, name, short, desc }
function DataTierBadge({ tierInfo, compact = false }) {
  const tier = tierInfo?.tier ?? 1;
  const style = TIER_STYLES[tier] || TIER_STYLES[1];

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${style.bg} ${style.border} ${style.text}`}
      >
        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
        {tierInfo?.name}
      </span>
    );
  }

  return (
    <div className={`rounded-2xl border p-5 ${style.bg} ${style.border}`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-white ${style.text}`}>
            <FaLayerGroup />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold ${style.text}`}>{tierInfo?.name}</h3>
              <span className="flex gap-1">
                {[1, 2, 3].map((t) => (
                  <span
                    key={t}
                    className={`w-1.5 h-1.5 rounded-full ${
                      t <= tier ? style.dot : "bg-gray-300"
                    }`}
                  />
                ))}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1 max-w-xl">{tierInfo?.desc}</p>
          </div>
        </div>

        {tier < 3 && (
          <Link
            to="/profile/appliance-profile"
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
          >
            {tier === 1 ? "Unlock Tier 2 — add appliances" : "Manage appliances"}
            <FaArrowRight size={12} />
          </Link>
        )}
        {tier === 3 && (
          <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600 whitespace-nowrap">
            <FaCheckCircle /> Sensors connected
          </span>
        )}
      </div>
    </div>
  );
}

export default DataTierBadge;