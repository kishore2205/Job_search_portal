import { useState } from "react";
import api from "../api/axios";

export default function VerifyOtp() {
  const [email, setEmail] = useState(localStorage.getItem("pendingEmail") || "");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const verify = async (e) => {
    e.preventDefault();
    try {
      setErr(""); setMsg("");
      const res = await api.post("/auth/verify-otp", { email, otp });
      setMsg(res.data.message || "Verified ✅");
      localStorage.removeItem("pendingEmail");
      setTimeout(() => (window.location.href = "/login"), 800);
    } catch (e2) {
      setErr(e2.response?.data?.message || "Verify failed");
    }
  };

  return (
    <div className="container">
      <div className="form-wrap">
        <div className="form-box">
          <h2 className="page-title">Verify Email</h2>
          <p className="muted small">Enter the OTP sent to your email.</p>

          {msg && <div className="success">{msg}</div>}
          {err && <div className="error">{err}</div>}

          <form onSubmit={verify}>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input className="input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" />
            <button className="btn btn-primary">Verify OTP</button>
          </form>
        </div>
      </div>
    </div>
  );
}