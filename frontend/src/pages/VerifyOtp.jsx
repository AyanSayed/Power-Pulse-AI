import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaBolt, FaSpinner, FaCheck } from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import { verifyEmailRequest, resendOtpRequest } from "../services/authApi";

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const userId = location.state?.userId;
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done
  const [resendCooldown, setResendCooldown] = useState(0);

  if (!userId) {
    return (
      <div className="min-h-screen auth-gradient-bg flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-ink mb-4">Nothing to verify — start by signing up or logging in.</p>
          <Link to="/signup" className="text-amber font-medium hover:underline">
            Go to sign up
          </Link>
        </div>
      </div>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      showToast("Enter the 6-digit code.", "error");
      return;
    }
    setStatus("loading");
    try {
      await verifyEmailRequest({ userId, otp: code.trim() });
      setStatus("done");
      showToast("Email verified — you can now log in.", "success");
      setTimeout(() => navigate("/login"), 500);
    } catch (err) {
      setStatus("idle");
      showToast(err.response?.data?.message || "Could not verify email.", "error");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await resendOtpRequest({ userId });
      showToast("New code sent to your email.", "success");
      setResendCooldown(30);
      const tick = setInterval(() => {
        setResendCooldown((s) => {
          if (s <= 1) {
            clearInterval(tick);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not resend code.", "error");
    }
  };

  return (
    <div className="min-h-screen auth-gradient-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 page-enter">
        <div className="flex items-center gap-3 mb-8">
          <FaBolt className="text-amber text-2xl bolt-pulse" />
          <h1 className="font-display font-bold text-xl text-ink">PowerPulse</h1>
        </div>

        <h2 className="font-display text-2xl font-semibold text-ink mb-1">Verify your email</h2>
        <p className="text-slate text-sm mb-6">
          Enter the 6-digit code we sent to your email to finish creating your account.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-amber text-sm tracking-[0.3em] text-center"
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-animated w-full bg-amber text-navy font-display font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-80 flex items-center justify-center gap-2"
          >
            {status === "loading" && <FaSpinner className="spin" />}
            {status === "done" && <FaCheck className="animate-success" />}
            {status === "loading" ? "Verifying..." : status === "done" ? "Verified!" : "Verify"}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="text-xs text-slate hover:text-amber disabled:opacity-50 mt-4 block mx-auto"
        >
          {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
}

export default VerifyOtp;