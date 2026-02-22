import { useState } from "react";
import api from "../api/axios";
import { FaGoogle, FaFacebook, FaInstagram } from "react-icons/fa";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      const res = await api.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-wrap">
        <div className="form-box">
          {/* ✅ Same style like Register page */}
          <h2 className="page-title" style={{ marginBottom: 6 }}>
            Login
          </h2>
          <p className="muted small" style={{ marginTop: 0 }}>
            Welcome back. Please sign in.
          </p>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
            <input
              className="input"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              className="input"
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* ✅ OTP Verify page link (optional but useful) */}
          <p className="small muted" style={{ marginTop: 12 }}>
            Didn’t verify your email?{" "}
            <a href="/verify-otp" className="nav-link">
              Verify OTP
            </a>
          </p>

          {/* ✅ Register link */}
          <p className="small muted" style={{ marginTop: 10 }}>
            Don’t have an account?{" "}
            <a href="/register" className="nav-link">
              Register
            </a>
          </p>

          {/* ✅ Social icons (same bottom section style) */}
          <div style={{ marginTop: 18 }}>
            <div className="hr" />
            <p className="muted small" style={{ margin: "12px 0", textAlign: "center" }}>
              Or continue with
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => alert("Google login coming soon")}
                aria-label="Login with Google"
              >
                <FaGoogle style={{ fontSize: 18 }} />
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => alert("Facebook login coming soon")}
                aria-label="Login with Facebook"
              >
                <FaFacebook style={{ fontSize: 18 }} />
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => alert("Instagram login coming soon")}
                aria-label="Login with Instagram"
              >
                <FaInstagram style={{ fontSize: 18 }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;