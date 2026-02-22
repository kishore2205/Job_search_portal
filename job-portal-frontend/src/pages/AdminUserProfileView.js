import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const BASE_URL = "http://localhost:5000";

const AdminUserProfileView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [profile, setProfile] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setErr("");
      setLoading(true);

      // Try Jobseeker profile first
      try {
        const res = await api.get(`/profile/jobseeker/${userId}`);
        setRole("JOB_SEEKER");
        setProfile(res.data);
        return;
      } catch (e) {
        // if not found, try recruiter
      }

      const res2 = await api.get(`/profile/recruiter/${userId}`);
      setRole("RECRUITER");
      setProfile(res2.data);
    } catch (e) {
      setErr(e.response?.data?.message || "Profile not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [userId]);

  if (loading) return <div className="container"><div className="card">Loading...</div></div>;
  if (err) return <div className="container"><div className="error">{err}</div></div>;
  if (!profile) return null;

  return (
    <div className="container">
      <button className="btn btn-outline" onClick={() => navigate(-1)}>← Back</button>

      <div className="card" style={{ marginTop: 12 }}>
        <h2 className="page-title" style={{ marginBottom: 6 }}>
          {role === "JOB_SEEKER" ? "Job Seeker Profile" : "Recruiter Profile"}
        </h2>

        <p className="muted">
          <b>Name:</b> {profile.user?.name} • <b>Email:</b> {profile.user?.email}
        </p>

        <div className="hr" />

        {role === "JOB_SEEKER" ? (
          <>
            <p><b>Headline:</b> {profile.headline || "—"}</p>
            <p><b>Location:</b> {profile.location || "—"}</p>
            <p><b>Phone:</b> {profile.phone || "—"}</p>
            <p><b>About:</b> {profile.about || "—"}</p>

            <p><b>Skills:</b> {Array.isArray(profile.skills) ? profile.skills.join(", ") : "—"}</p>

            <p>
              <b>Resume:</b>{" "}
              {profile.resume ? (
                <a className="nav-link" href={`${BASE_URL}${profile.resume}`} target="_blank" rel="noreferrer">
                  View →
                </a>
              ) : (
                "Not uploaded"
              )}
            </p>

            <div className="hr" />
            <h3 className="card-title">Projects</h3>
            {Array.isArray(profile.projects) && profile.projects.length > 0 ? (
              profile.projects.map((p) => (
                <div key={p._id} className="card" style={{ marginTop: 10 }}>
                  <h4 className="card-title">{p.title}</h4>
                  {p.description && <p className="muted">{p.description}</p>}
                  {p.techStack?.length ? <p className="muted small"><b>Tech:</b> {p.techStack.join(", ")}</p> : null}
                  {p.githubUrl ? <p><a className="nav-link" href={p.githubUrl} target="_blank" rel="noreferrer">GitHub →</a></p> : null}
                  {p.liveUrl ? <p><a className="nav-link" href={p.liveUrl} target="_blank" rel="noreferrer">Live →</a></p> : null}
                </div>
              ))
            ) : (
              <p className="muted">No projects</p>
            )}
          </>
        ) : (
          <>
            <p><b>Company:</b> {profile.companyName || "—"}</p>
            <p><b>Website:</b> {profile.website || "—"}</p>
            <p><b>Location:</b> {profile.location || "—"}</p>
            <p><b>Phone:</b> {profile.phone || "—"}</p>
            <p><b>About:</b> {profile.about || "—"}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUserProfileView;
