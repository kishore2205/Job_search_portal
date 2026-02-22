import { useState } from "react";
import api from "../api/axios";
import { FaGoogle, FaFacebook, FaInstagram } from "react-icons/fa";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "JOB_SEEKER",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      alert("Registration successful! Please login.");
      window.location.href = "/login";
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="container">
      <div className="form-wrap">
        <div className="form-box">
          <h2 className="page-title">Register</h2>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input className="input" name="name" placeholder="Name" onChange={handleChange} />
            <input className="input" name="email" placeholder="Email" onChange={handleChange} />
            <input className="input" name="password" type="password" placeholder="Password" onChange={handleChange} />

            <select className="select" name="role" onChange={handleChange} value={form.role}>
              <option value="JOB_SEEKER">Job Seeker</option>
              <option value="RECRUITER">Recruiter</option>
            </select>

            <button className="btn btn-primary" type="submit">Create Account</button>
          </form>

          <p className="small muted" style={{ marginTop: 12 }}>
            Already have an account? <a href="/login" className="nav-link">Login</a>
          </p>
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

export default Register;
