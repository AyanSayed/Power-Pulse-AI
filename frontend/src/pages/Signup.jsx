import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBolt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { savePincode } from "../utils/applianceProfileStorage";

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pincode, setPincodeInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: replace with real API call once backend auth is ready
    login({ name: name || "Ayan Sharma", email });
    // Tier 1 onboarding hook: bill upload (later) + pincode (now), so we can
    // pull local weather immediately without waiting on an appliance checklist.
    if (pincode.trim()) savePincode(pincode.trim());
    showToast("Account created successfully", "success");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <FaBolt className="text-amber text-2xl bolt-pulse" />
          <h1 className="font-display font-bold text-xl text-ink">PowerPulse</h1>
        </div>

        <h2 className="font-display text-2xl font-semibold text-ink mb-1">Create your account</h2>
        <p className="text-slate text-sm mb-6">Start tracking and predicting your electricity usage.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Full name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ayan Sharma"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-amber text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-amber text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Pincode</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 400614"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-amber text-sm"
            />
            <p className="text-xs text-slate mt-1">Used to fetch local weather for accurate predictions.</p>
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-amber text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber text-navy font-display font-semibold py-2.5 rounded-lg hover:opacity-90 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-slate text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-amber font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;