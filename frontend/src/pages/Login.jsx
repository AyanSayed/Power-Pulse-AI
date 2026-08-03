import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBolt, FaSpinner, FaCheck } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { isGmailAddress, GMAIL_ONLY_MESSAGE } from "../utils/validateEmail";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [shake, setShake] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isGmailAddress(email)) {
      setEmailError(GMAIL_ONLY_MESSAGE);
      showToast(GMAIL_ONLY_MESSAGE, "error");
      triggerShake();
      return;
    }

    setEmailError("");
    setStatus("loading");

    try {
      await login(email, password);
      setStatus("success");
      showToast("Logged in successfully", "success");
      setTimeout(() => navigate("/"), 400);
    } catch (err) {
      setStatus("idle");
      if (err.response?.data?.verificationRequired) {
        navigate(`/verify-email?email=${encodeURIComponent(err.response.data.email || email)}`);
        return;
      }
      triggerShake();
      showToast(err.response?.data?.message || "Login failed.", "error");
    }
  };

  const isBusy = status === "loading" || status === "success";

  return (
    <div className="auth-shell min-h-screen flex items-center justify-center px-4">
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />
      <div
        className={`auth-card w-full max-w-md p-8 page-enter ${
          shake ? "animate-shake" : ""
        }`}
      >
        <div className="auth-mark">
          <FaBolt className="bolt-pulse" />
          <span>PowerPulse</span>
        </div>

        <h2 className="font-display text-2xl font-semibold text-ink mb-1">Your energy, in focus.</h2>
        <p className="auth-copy">Log in to track bills, spot waste, and make every unit count.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              placeholder="you@gmail.com"
              className={`w-full px-4 py-2.5 rounded-lg border outline-none text-sm focus:border-amber ${
                emailError ? "border-coral" : "border-gray-200"
              }`}
            />
            {emailError && (
              <p className="text-coral text-xs mt-1.5 fade-in">{emailError}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-amber text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isBusy}
            className="auth-button"
          >
            {status === "loading" && <FaSpinner className="spin" />}
            {status === "success" && <FaCheck className="animate-success" />}
            {status === "loading" ? "Logging in..." : status === "success" ? "Success!" : "Log In"}
          </button>
        </form>

        <p className="text-sm text-slate text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-amber font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
