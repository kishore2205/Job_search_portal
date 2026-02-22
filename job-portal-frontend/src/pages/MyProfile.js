import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./MyProfile.css";


const BASE_URL = "http://localhost:5000";

const MyProfile = () => {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const [profile, setProfile] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // left menu tab
  const [tab, setTab] = useState("PROFILE"); 

  // edit mode per section
  const [editing, setEditing] = useState({
    PROFILE: false,
    EDUCATION: false,
    CERTS: false,
    WORK: false,
  });

  // form states
  const [form, setForm] = useState({
    phone: "",
    location: "",
    headline: "",
    about: "",
    skills: "",
    experience: "",
    github: "",
    linkedin: "",
    portfolio: "",
    educationText: "", 
  });

  const [saving, setSaving] = useState(false);


  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeUploading, setResumeUploading] = useState(false);


  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    techStack: "",
    githubUrl: "",
    liveUrl: "",
  });
  const [addingProject, setAddingProject] = useState(false);

  const load = async () => {
    try {
      setErr("");
      setLoading(true);

      const res = await api.get("/profile/me");
      const p = res.data || {};
      setProfile(p);

      setForm({
        phone: p.phone || "",
        location: p.location || "",
        headline: p.headline || "",
        about: p.about || "",
        skills: Array.isArray(p.skills) ? p.skills.join(", ") : "",
        experience: p.experience || "",
        github: p.github || "",
        linkedin: p.linkedin || "",
        portfolio: p.portfolio || "",
        // show education as readable text in UI
        educationText: p.education
          ? `${p.education.degree || ""}${p.education.degree ? " - " : ""}${p.education.institute || ""}${
              p.education.year ? ` (${p.education.year})` : ""
            }`.trim()
          : "",
      });

      setResumeUrl(p.resume ? `${BASE_URL}${p.resume}` : "");
      setProjects(Array.isArray(p.projects) ? p.projects : []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ IMPORTANT:
  // Your backend expects education as OBJECT, not string.
  // So when UI has "educationText", we store it into education.degree (or institute) safely.
  const saveProfile = async (section) => {
    try {
      setSaving(true);
      setErr("");

      const payload = {
        phone: form.phone,
        location: form.location,
        headline: form.headline,
        about: form.about,
        experience: form.experience,
        github: form.github,
        linkedin: form.linkedin,
        portfolio: form.portfolio,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),

        // ✅ store education as object to avoid "Cast to embedded failed"
        education: form.educationText
          ? { degree: form.educationText, institute: "", year: "" }
          : { degree: "", institute: "", year: "" },
      };

      await api.put("/profile/me", payload);

      setEditing((prev) => ({ ...prev, [section]: false }));
      await load();
      alert("Updated ✅");
    } catch (e) {
      alert(e.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const uploadResume = async (file) => {
    if (!file) return;
    try {
      setResumeUploading(true);

      const fd = new FormData();
      fd.append("resume", file);

      await api.post("/profile/me/resume", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await load();
      alert("Resume uploaded ✅");
    } catch (e) {
      alert(e.response?.data?.message || "Resume upload failed");
    } finally {
      setResumeUploading(false);
    }
  };

  const addProject = async () => {
    if (!projectForm.title.trim()) {
      alert("Project title is required");
      return;
    }

    try {
      setAddingProject(true);

      // your backend route uses upload.single("image") but image is optional
      // we will send as normal JSON for now (no image)
      const payload = {
        title: projectForm.title.trim(),
        description: projectForm.description.trim(),
        techStack: projectForm.techStack.trim(), // backend splits by comma
        githubUrl: projectForm.githubUrl.trim(),
        liveUrl: projectForm.liveUrl.trim(),
      };

      const res = await api.post("/profile/me/project", payload);
      const p = res.data || {};
      setProjects(Array.isArray(p.projects) ? p.projects : []);
      setProjectForm({ title: "", description: "", techStack: "", githubUrl: "", liveUrl: "" });

      alert("Project added ✅");
    } catch (e) {
      alert(e.response?.data?.message || "Add project failed");
    } finally {
      setAddingProject(false);
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

  const name = profile?.user?.name || "User";
  const email = profile?.user?.email || "—";
  const initials = (name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");

  return (
    <div className="profile-shell">
      {/* LEFT SIDEBAR (FULL HEIGHT) */}
      <aside className="profile-sidebar">
        <div className="profile-avatar">{initials}</div>

        <nav className="profile-nav">
          <button
            className={`profile-nav-item ${tab === "PROFILE" ? "active" : ""}`}
            onClick={() => setTab("PROFILE")}
          >
            Profile
          </button>
          <button
            className={`profile-nav-item ${tab === "EDUCATION" ? "active" : ""}`}
            onClick={() => setTab("EDUCATION")}
          >
            Educational Details
          </button>
          <button
            className={`profile-nav-item ${tab === "CERTS" ? "active" : ""}`}
            onClick={() => setTab("CERTS")}
          >
            Certifications
          </button>
          <button
            className={`profile-nav-item ${tab === "WORK" ? "active" : ""}`}
            onClick={() => setTab("WORK")}
          >
            Work Experience
          </button>
        </nav>
      </aside>

      {/* RIGHT CONTENT */}
      <main className="profile-content">
        {err && <div className="error">{err}</div>}

        {/* ===================== PROFILE ===================== */}
        {tab === "PROFILE" && (
          <section className="profile-card">
            <div className="profile-card-header">
              <h3>Personal Details</h3>
              <div className="profile-card-actions">
                {!editing.PROFILE ? (
                  <button className="btn btn-outline" onClick={() => setEditing((p) => ({ ...p, PROFILE: true }))}>
                    Edit
                  </button>
                ) : (
                  <button className="btn btn-primary" disabled={saving} onClick={() => saveProfile("PROFILE")}>
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
                <div className="label">Headline</div>
                {!editing.PROFILE ? (
                  <div className="value">{form.headline || "—"}</div>
                ) : (
                  <input className="input" name="headline" value={form.headline} onChange={onChange} />
                )}
              </div>

              <div>
                <div className="label">Location</div>
                {!editing.PROFILE ? (
                  <div className="value">{form.location || "—"}</div>
                ) : (
                  <input className="input" name="location" value={form.location} onChange={onChange} />
                )}
              </div>

              <div>
                <div className="label">Phone</div>
                {!editing.PROFILE ? (
                  <div className="value">{form.phone || "—"}</div>
                ) : (
                  <input className="input" name="phone" value={form.phone} onChange={onChange} />
                )}
              </div>

              <div>
                <div className="label">Skills</div>
                {!editing.PROFILE ? (
                  <div className="value">{form.skills || "—"}</div>
                ) : (
                  <input className="input" name="skills" value={form.skills} onChange={onChange} />
                )}
              </div>

              <div className="span-2">
                <div className="label">About</div>
                {!editing.PROFILE ? (
                  <div className="value">{form.about || "—"}</div>
                ) : (
                  <textarea className="textarea" name="about" value={form.about} onChange={onChange} />
                )}
              </div>

              <div className="span-2">
                <div className="label">Experience</div>
                {!editing.PROFILE ? (
                  <div className="value">{form.experience || "—"}</div>
                ) : (
                  <textarea className="textarea" name="experience" value={form.experience} onChange={onChange} />
                )}
              </div>

              <div>
                <div className="label">GitHub</div>
                {!editing.PROFILE ? (
                  <div className="value">{form.github || "—"}</div>
                ) : (
                  <input className="input" name="github" value={form.github} onChange={onChange} />
                )}
              </div>

              <div>
                <div className="label">LinkedIn</div>
                {!editing.PROFILE ? (
                  <div className="value">{form.linkedin || "—"}</div>
                ) : (
                  <input className="input" name="linkedin" value={form.linkedin} onChange={onChange} />
                )}
              </div>

              <div className="span-2">
                <div className="label">Portfolio</div>
                {!editing.PROFILE ? (
                  <div className="value">{form.portfolio || "—"}</div>
                ) : (
                  <input className="input" name="portfolio" value={form.portfolio} onChange={onChange} />
                )}
              </div>
            </div>

            <div className="profile-divider" />

            <div className="profile-resume-row">
              <div>
                <div className="label">Resume</div>
                {resumeUrl ? (
                  <a className="nav-link" href={resumeUrl} target="_blank" rel="noreferrer">
                    View Resume →
                  </a>
                ) : (
                  <div className="value">Not uploaded</div>
                )}
              </div>

              <div className="resume-upload">
                <input
                  className="input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  disabled={resumeUploading}
                  onChange={(e) => uploadResume(e.target.files?.[0])}
                />
                {resumeUploading && <div className="muted small">Uploading...</div>}
              </div>
            </div>
          </section>
        )}

        {/* ===================== EDUCATION ===================== */}
        {tab === "EDUCATION" && (
          <section className="profile-card">
            <div className="profile-card-header">
              <h3>Educational Details</h3>
              <div className="profile-card-actions">
                {!editing.EDUCATION ? (
                  <button className="btn btn-outline" onClick={() => setEditing((p) => ({ ...p, EDUCATION: true }))}>
                    Edit
                  </button>
                ) : (
                  <button className="btn btn-primary" disabled={saving} onClick={() => saveProfile("EDUCATION")}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                )}
              </div>
            </div>

            {!editing.EDUCATION ? (
              <div className="value" style={{ marginTop: 10 }}>
                {form.educationText || "No Data Available"}
              </div>
            ) : (
              <textarea
                className="textarea"
                name="educationText"
                placeholder="Example: Artificial Intelligence and Data Science"
                value={form.educationText}
                onChange={onChange}
                style={{ marginTop: 10 }}
              />
            )}
          </section>
        )}

        {/* ===================== CERTIFICATIONS ===================== */}
        {tab === "CERTS" && (
          <section className="profile-card">
            <div className="profile-card-header">
              <h3>Certifications</h3>
              <div className="profile-card-actions">
                <button className="btn btn-outline" onClick={() => alert("Next step: add certifications schema + API")}>
                  Add
                </button>
              </div>
            </div>
            <div className="muted" style={{ marginTop: 10 }}>
              No certifications added.
            </div>
          </section>
        )}

        {/* ===================== WORK EXPERIENCE + PROJECTS ===================== */}
        {tab === "WORK" && (
          <>
            <section className="profile-card">
              <div className="profile-card-header">
                <h3>Work Experience</h3>
                <div className="profile-card-actions">
                  <button className="btn btn-outline" onClick={() => alert("Next step: add workExperience schema + API")}>
                    Add
                  </button>
                </div>
              </div>
              <div className="muted" style={{ marginTop: 10 }}>
                No work experience added.
              </div>
            </section>

            <section className="profile-card" style={{ marginTop: 14 }}>
              <div className="profile-card-header">
                <h3>Projects</h3>
              </div>

              {projects.length === 0 && <div className="muted">No projects yet.</div>}

              {projects.map((p, idx) => (
                <div key={p._id || idx} className="project-item">
                  <div className="project-title">{p.title}</div>
                  {p.description ? <div className="muted">{p.description}</div> : null}

                  <div className="project-meta">
                    {Array.isArray(p.techStack) && p.techStack.length > 0 ? (
                      <span className="pill">{p.techStack.join(", ")}</span>
                    ) : null}

                    {p.githubUrl ? (
                      <a className="nav-link" href={p.githubUrl} target="_blank" rel="noreferrer">
                        GitHub →
                      </a>
                    ) : null}

                    {p.liveUrl ? (
                      <a className="nav-link" href={p.liveUrl} target="_blank" rel="noreferrer">
                        Live →
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}

              <div className="profile-divider" />

              <h4 style={{ margin: "0 0 10px" }}>Add New Project</h4>

              <input
                className="input"
                placeholder="Project title *"
                value={projectForm.title}
                onChange={(e) => setProjectForm((p) => ({ ...p, title: e.target.value }))}
              />
              <textarea
                className="textarea"
                placeholder="Description"
                value={projectForm.description}
                onChange={(e) => setProjectForm((p) => ({ ...p, description: e.target.value }))}
              />
              <input
                className="input"
                placeholder="Tech stack (comma separated)"
                value={projectForm.techStack}
                onChange={(e) => setProjectForm((p) => ({ ...p, techStack: e.target.value }))}
              />
              <div className="row">
                <input
                  className="input"
                  placeholder="GitHub URL"
                  value={projectForm.githubUrl}
                  onChange={(e) => setProjectForm((p) => ({ ...p, githubUrl: e.target.value }))}
                />
                <input
                  className="input"
                  placeholder="Live URL"
                  value={projectForm.liveUrl}
                  onChange={(e) => setProjectForm((p) => ({ ...p, liveUrl: e.target.value }))}
                />
              </div>

              <div className="row-right" style={{ marginTop: 10 }}>
                <button className="btn btn-primary" disabled={addingProject} onClick={addProject}>
                  {addingProject ? "Adding..." : "Add"}
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default MyProfile;
