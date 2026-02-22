import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./MyProfile.css"; // reuse same profile CSS

const RecruiterProfile = () => {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    companyName: "",
    website: "",
    location: "",
    phone: "",
    about: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [editing, setEditing] = useState(false);

  const load = async () => {
    try {
      setErr("");
      setLoading(true);

      const res = await api.get("/profile/recruiter/me");
      const p = res.data || {};
      setProfile(p);

      setForm({
        companyName: p.companyName || "",
        website: p.website || "",
        location: p.location || "",
        phone: p.phone || "",
        about: p.about || "",
      });
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load recruiter profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const save = async () => {
    try {
      setSaving(true);
      setErr("");

      await api.put("/profile/recruiter/me", form);

      setEditing(false);
      await load();
      alert("Recruiter profile updated ✅");
    } catch (e) {
      alert(e.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="card">Please login to view your profile.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card">Loading profile...</div>
      </div>
    );
  }

  const name = profile?.user?.name || "Recruiter";
  const email = profile?.user?.email || "—";

  return (
    <div className="profile-shell">
      {/* LEFT SIDEBAR */}
      <aside className="profile-sidebar">
        <div className="profile-avatar">
          {(name || "R")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((x) => x[0].toUpperCase())
            .join("")}
        </div>

        <nav className="profile-nav">
          <button className="profile-nav-item active">Profile</button>
        </nav>
      </aside>

      {/* RIGHT CONTENT */}
      <main className="profile-content">
        {err && <div className="error">{err}</div>}

        <section className="profile-card">
          <div className="profile-card-header">
            <h3>Personal Details</h3>

            <div className="profile-card-actions">
              {!editing ? (
                <button className="btn btn-outline" onClick={() => setEditing(true)}>
                  Edit
                </button>
              ) : (
                <button className="btn btn-primary" disabled={saving} onClick={save}>
                  {saving ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </div>

          <div className="profile-grid">
            <div>
              <div className="label">Name</div>
              <div className="value">{name}</div>
            </div>

            <div>
              <div className="label">Email</div>
              <div className="value">{email}</div>
            </div>

            <div>
              <div className="label">Company Name</div>
              {!editing ? (
                <div className="value">{form.companyName || "—"}</div>
              ) : (
                <input className="input" name="companyName" value={form.companyName} onChange={onChange} />
              )}
            </div>

            <div>
              <div className="label">Website</div>
              {!editing ? (
                <div className="value">{form.website || "—"}</div>
              ) : (
                <input className="input" name="website" value={form.website} onChange={onChange} />
              )}
            </div>

            <div>
              <div className="label">Location</div>
              {!editing ? (
                <div className="value">{form.location || "—"}</div>
              ) : (
                <input className="input" name="location" value={form.location} onChange={onChange} />
              )}
            </div>

            <div>
              <div className="label">Phone</div>
              {!editing ? (
                <div className="value">{form.phone || "—"}</div>
              ) : (
                <input className="input" name="phone" value={form.phone} onChange={onChange} />
              )}
            </div>

            <div className="span-2">
              <div className="label">About</div>
              {!editing ? (
                <div className="value">{form.about || "—"}</div>
              ) : (
                <textarea className="textarea" name="about" value={form.about} onChange={onChange} />
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RecruiterProfile;
