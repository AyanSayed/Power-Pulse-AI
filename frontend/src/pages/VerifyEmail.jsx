import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaBolt, FaShieldAlt, FaSpinner } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { resendEmailOtpRequest } from "../services/authApi";
import { useToast } from "../context/ToastContext";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { completeVerification } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState(params.get("email") || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e) { e.preventDefault(); setLoading(true); try { await completeVerification(email, code); showToast("Email verified. Welcome to PowerPulse!", "success"); navigate("/"); } catch (err) { showToast(err.response?.data?.message || "Verification failed.", "error"); } finally { setLoading(false); } }
  async function resend() { try { const data = await resendEmailOtpRequest(email); showToast(data.message, "success"); } catch (err) { showToast(err.response?.data?.message || "Could not resend code.", "error"); } }
  return <div className="auth-shell min-h-screen flex items-center justify-center p-4"><div className="auth-orb auth-orb-one"/><div className="auth-orb auth-orb-two"/><main className="auth-card w-full max-w-md p-8 relative"><div className="auth-mark"><FaBolt/><span>PowerPulse</span></div><div className="auth-icon"><FaShieldAlt/></div><h1>Secure your account</h1><p className="auth-copy">Enter the 6-digit code sent to your email. Codes expire after 10 minutes.</p><form onSubmit={submit} className="space-y-4"><label>Email<input className="auth-input" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)}/></label><label>Verification code<input className="auth-input otp-input" inputMode="numeric" maxLength="6" required value={code} onChange={(e)=>setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000"/></label><button className="auth-button" disabled={loading}>{loading && <FaSpinner className="spin"/>}{loading ? "Verifying…" : "Verify email"}</button></form><button onClick={resend} className="auth-link mt-5">Resend a new code</button><p className="text-sm text-center text-slate mt-5">Wrong account? <Link className="text-amber font-semibold" to="/signup">Sign up again</Link></p></main></div>;
}
