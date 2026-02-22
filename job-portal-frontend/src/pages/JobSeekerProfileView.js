import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const BASE_URL = "http://localhost:5000";

const JobSeekerProfileView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get(`/profile/jobseeker/${userId}`);
      setProfile(res.data || null);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load job seeker profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="container">
        <div className="card">Loading profile...</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="container">
        <div className="error">{err}</div>
        <button className="btn btn-outline" style={{ marginTop: 10 }} onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    );
  }

  if (!profile) return null;

  const resumeUrl = profile.resume ? `${BASE_URL}${profile.resume}` : "";

  return (
    <div className="container">
      <button className="btn btn-outline" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="card" style={{ marginTop: 14 }}>
        <h2 className="page-title" style={{ marginBottom: 6 }}>
          {profile.name || "Job Seeker"}
        </h2>

        {profile.headline && <p className="muted">{profile.headline}</p>}

        <p className="muted">
          <b>Email:</b> {profile.email || "N/A"}
          {profile.phone ? (
            <>
              {" "}• <b>Phone:</b> {profile.phone}
            </>
          ) : null}
          {profile.location ? (
            <>
              {" "}• <b>Location:</b> {profile.location}
            </>
          ) : null}
        </p>

        {profile.bio && (
          <>
            <div className="hr"></div>
            <p><b>About</b></p>
            <p className="muted">{profile.bio}</p>
          </>
        )}

        {Array.isArray(profile.skills) && profile.skills.length > 0 && (
          <>
            <div className="hr"></div>
            <p><b>Skills</b></p>
            <p className="muted">{profile.skills.join(", ")}</p>
          </>
        )}

        {profile.education && (
          <>
            <div className="hr"></div>
            <p><b>Education</b></p>
            <p className="muted">{profile.education}</p>
          </>
        )}

        {profile.experience && (
          <>
            <div className="hr"></div>
            <p><b>Experience</b></p>
            <p className="muted">{profile.experience}</p>
          </>
        )}

        <div className="hr"></div>
        <p>
          <b>Resume:</b>{" "}
          {resumeUrl ? (
            <a className="nav-link" href={resumeUrl} target="_blank" rel="noreferrer">
              View Resume →
            </a>
          ) : (
            <span className="muted">Not uploaded</span>
          )}
        </p>

        {(profile.github || profile.linkedin || profile.portfolio) && (
          <>
            <div className="hr"></div>
            <p><b>Links</b></p>
            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
              {profile.github && (
                <a className="nav-link" href={profile.github} target="_blank" rel="noreferrer">
                  GitHub →
                </a>
              )}
              {profile.linkedin && (
                <a className="nav-link" href={profile.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn →
                </a>
              )}
              {profile.portfolio && (
                <a className="nav-link" href={profile.portfolio} target="_blank" rel="noreferrer">
                  Portfolio →
                </a>
              )}
            </div>
          </>
        )}
      </div>

      {/* PROJECTS */}
      <div className="card" style={{ marginTop: 14 }}>
        <h3 className="card-title">Projects</h3>

        {(!profile.projects || profile.projects.length === 0) && (
          <p className="muted">No projects uploaded.</p>
        )}

        {Array.isArray(profile.projects) &&
          profile.projects.map((p, idx) => (
            <div key={p._id || idx} className="card" style={{ marginTop: 10 }}>
              <h4 className="card-title" style={{ marginBottom: 6 }}>{p.title}</h4>

              {p.description && <p className="muted">{p.description}</p>}

              {Array.isArray(p.techStack) && p.techStack.length > 0 && (
                <p className="muted small">
                  <b>Tech:</b> {p.techStack.join(", ")}
                </p>
              )}

              {p.link && (
                <p className="muted small">
                  <b>Link:</b>{" "}
                  <a className="nav-link" href={p.link} target="_blank" rel="noreferrer">
                    Open →
                  </a>
                </p>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default JobSeekerProfileView;
