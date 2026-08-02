import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBolt, FaSpinner, FaCheck } from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import { isGmailAddress, GMAIL_ONLY_MESSAGE } from "../utils/validateEmail";
import { signupRequest } from "../services/authApi";

function Signup() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [name, setName] = useState("");
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
      const data = await signupRequest({ name, email, password });
      setStatus("success");

      if (data.emailSendFailed) {
        showToast("Account created, but the email couldn't be sent — try Resend on the next screen.", "info");
      } else {
        showToast("Account created — check your email for a code.", "success");
      }

      setTimeout(() => {
        navigate("/verify-otp", { state: { userId: data.userId } });
      }, 400);
    } catch (err) {
      setStatus("idle");
      showToast(err.response?.data?.message || "Signup failed.", "error");
      triggerShake();
    }
  };

  const isBusy = status === "loading" || status === "success";

  return (
    <div className="min-h-screen auth-gradient-bg flex items-center justify-center px-4">
      <div
        className={`w-full max-w-md bg-white rounded-2xl shadow-xl p-8 page-enter ${
          shake ? "animate-shake" : ""
        }`}
      >
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-amber text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isBusy}
            className="btn-animated w-full bg-amber text-navy font-display font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-80 flex items-center justify-center gap-2"
          >
            {status === "loading" && <FaSpinner className="spin" />}
            {status === "success" && <FaCheck className="animate-success" />}
            {status === "loading" ? "Creating account..." : status === "success" ? "Success!" : "Sign Up"}
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