import { FaBolt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Winding down";
}

function DashboardHero({ trendPercent }) {
  const { user } = useAuth();
  const name = user?.name?.split(" ")[0] || "there";

  const status =
    trendPercent < -3
      ? {
          text: `Usage is down ${Math.abs(trendPercent).toFixed(0)}% from last month — the grid's calm today.`,
          tone: "good",
        }
      : trendPercent > 10
      ? {
          text: `Usage is up ${trendPercent.toFixed(0)}% from last month — worth a glance.`,
          tone: "warn",
        }
      : {
          text: "Usage is holding steady. Everything's humming along.",
          tone: "neutral",
        };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="pp-hero">
      <svg
        className="pp-hero-grid"
        viewBox="0 0 1200 260"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {Array.from({ length: 13 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * 100}
            y1="0"
            x2={i * 100}
            y2="260"
            className="pp-grid-line"
          />
        ))}
        <path
          d="M0,180 L180,180 L210,60 L240,220 L270,100 L300,180 L1200,180"
          className="pp-pulse-line pp-pulse-1"
        />
        <path d="M0,90 L1200,90" className="pp-pulse-line pp-pulse-2" />
        <path d="M0,230 L1200,230" className="pp-pulse-line pp-pulse-3" />
      </svg>

      <div className="pp-hero-content">
        <div className="pp-hero-icon">
          <FaBolt />
        </div>
        <div>
          <p className="pp-hero-eyebrow">{today}</p>
          <h1 className="pp-hero-title">
            {getTimeGreeting()}, {name}
          </h1>
          <p className={`pp-hero-status pp-tone-${status.tone}`}>
            {status.text}
          </p>
        </div>
      </div>

      <style>{`
        .pp-hero {
          position: relative;
          overflow: hidden;
          border-radius: 1.75rem;
          background: linear-gradient(135deg, #0b1524 0%, #101f36 55%, #142943 100%);
          padding: 2.5rem 2rem;
          min-height: 220px;
          display: flex;
          align-items: center;
        }
        .pp-hero-grid {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0.9;
        }
        .pp-grid-line {
          stroke: rgba(255,255,255,0.04);
          stroke-width: 1;
        }
        .pp-pulse-line {
          fill: none;
          stroke: #f5b942;
          stroke-width: 2;
          filter: drop-shadow(0 0 6px rgba(245,185,66,0.55));
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 14 900;
          animation: pp-travel 6s linear infinite;
          opacity: 0.85;
        }
        .pp-pulse-2 { stroke: rgba(245,185,66,0.35); stroke-width: 1.5; animation-duration: 9s; animation-delay: -2s; }
        .pp-pulse-3 { stroke: rgba(245,185,66,0.25); stroke-width: 1.5; animation-duration: 11s; animation-delay: -5s; }
        @keyframes pp-travel {
          from { stroke-dashoffset: 900; }
          to { stroke-dashoffset: 0; }
        }
        .pp-hero-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .pp-hero-icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: rgba(245,185,66,0.12);
          border: 1px solid rgba(245,185,66,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          color: #f5b942;
          animation: pp-bolt-pulse 2.4s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes pp-bolt-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245,185,66,0.35); }
          50% { transform: scale(1.08); box-shadow: 0 0 0 10px rgba(245,185,66,0); }
        }
        .pp-hero-eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
          margin-bottom: 0.35rem;
        }
        .pp-hero-title {
          font-size: 2.25rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
          line-height: 1.1;
        }
        .pp-hero-status { font-size: 1rem; max-width: 42ch; }
        .pp-tone-good { color: #7ee787; }
        .pp-tone-warn { color: #ff8a65; }
        .pp-tone-neutral { color: rgba(255,255,255,0.75); }

        @media (max-width: 640px) {
          .pp-hero-title { font-size: 1.6rem; }
          .pp-hero { padding: 2rem 1.25rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pp-pulse-line, .pp-hero-icon { animation: none; }
        }
      `}</style>
    </div>
  );
}

export default DashboardHero;