import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const role = JSON.parse(localStorage.getItem("user"))?.role;

  const [job, setJob] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // text answers only
  const [answersMap, setAnswersMap] = useState({});

  // custom file answers: { "Portfolio": File, "Certificates": File }
  const [fileAnswersMap, setFileAnswersMap] = useState({});

  const [resumeFile, setResumeFile] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const fields = useMemo(() => job?.customFields || [], [job]);

  /* =========================
     LOAD JOB
  ========================== */
  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load job");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const setAnswer = (label, value) => {
    setAnswersMap((prev) => ({ ...prev, [label]: value }));
  };

  const setFileAnswer = (label, file) => {
    setFileAnswersMap((prev) => ({ ...prev, [label]: file }));
  };

  /* =========================
     VALIDATION (required text + required file)
  ========================== */
  const validateRequired = () => {
    for (const f of fields) {
      if (!f.required) continue;

      if (f.type === "file") {
        const file = fileAnswersMap[f.label];
        if (!file) return `Please upload required file: ${f.label}`;
      } else {
        const val = answersMap[f.label];
        if (!val || String(val).trim().length === 0) {
          return `Please fill required field: ${f.label}`;
        }
      }
    }

    // Resume required (optional: remove this if resume not compulsory)
    if (!resumeFile) return "Please upload your Resume";

    return null;
  };

  /* =========================
     APPLY
  ========================== */
  const apply = async () => {
    if (role !== "JOB_SEEKER") {
      alert("Login as Job Seeker to apply");
      navigate("/login");
      return;
    }

    const requiredErr = validateRequired();
    if (requiredErr) {
      alert(requiredErr);
      return;
    }

    if (!window.confirm("Are you sure you want to apply for this job?")) return;

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("jobId", job._id);

      // ✅ send ONLY text answers as JSON
      formData.append("answers", JSON.stringify(answersMap));

      // ✅ send custom field files separately
      // backend can store [{ label, url }] or {label:url}
      Object.entries(fileAnswersMap).forEach(([label, file]) => {
        if (file) {
          formData.append("customFiles", file);          // multiple files
          formData.append("customFileLabels", label);    // same order as files
        }
      });

      // ✅ resume + attachment
      if (resumeFile) formData.append("resume", resumeFile);
      if (attachmentFile) formData.append("attachment", attachmentFile);

      await api.post("/applications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Applied Successfully ✅");
      navigate("/applications");
    } catch (e) {
      if (e.response?.status === 409) alert("You already applied for this job");
      else alert(e.response?.data?.message || "Apply failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     STATES
  ========================== */
  if (loading) {
    return (
      <div className="container">
        <div className="card">Loading...</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="container">
        <div className="error">{err}</div>
      </div>
    );
  }

  if (!job) return null;

  /* =========================
     UI
  ========================== */
  return (
    <div className="container">
      <button className="btn btn-outline" onClick={() => navigate("/")}>
        ← Back
      </button>

      {/* JOB INFO */}
      <div className="card" style={{ marginTop: 14 }}>
        <h2 className="page-title">{job.title}</h2>

        <p className="muted">
          <b>Company:</b> {job.company} • <b>Location:</b> {job.location || "N/A"}
          {job.jobType ? ` • ${job.jobType}` : ""}
        </p>

        <div className="hr"></div>

        <p><b>Description</b></p>
        <p className="muted">{job.description}</p>

        {job.eligibility && (
          <>
            <div className="hr"></div>
            <p><b>Eligibility</b></p>
            <p className="muted">{job.eligibility}</p>
          </>
        )}

        {job.requirements && (
          <>
            <div className="hr"></div>
            <p><b>Requirements</b></p>
            <p className="muted">{job.requirements}</p>
          </>
        )}
      </div>

      {/* APPLICATION FORM */}
      <div className="card" style={{ marginTop: 14 }}>
        <h3 className="card-title">Application Form</h3>
        <p className="muted small">Fill details and upload resume to apply.</p>

        {/* CUSTOM FIELDS */}
        {fields.map((f, idx) => (
          <div key={idx} style={{ marginTop: 12 }}>
            <label className="small muted">
              <b>{f.label}</b> {f.required ? "(required)" : ""}
            </label>

            {f.type === "textarea" && (
              <textarea
                className="textarea"
                value={answersMap[f.label] || ""}
                onChange={(e) => setAnswer(f.label, e.target.value)}
                placeholder="Type your answer..."
              />
            )}

            {f.type === "text" && (
              <input
                className="input"
                type="text"
                value={answersMap[f.label] || ""}
                onChange={(e) => setAnswer(f.label, e.target.value)}
                placeholder="Type your answer..."
              />
            )}

            {f.type === "number" && (
              <input
                className="input"
                type="number"
                value={answersMap[f.label] || ""}
                onChange={(e) => setAnswer(f.label, e.target.value)}
                placeholder="Enter number..."
              />
            )}

            {/* ✅ FILE FIELD */}
            {f.type === "file" && (
              <input
                className="input"
                type="file"
                onChange={(e) =>
                  setFileAnswer(f.label, e.target.files?.[0] || null)
                }
              />
            )}
          </div>
        ))}

        {/* RESUME UPLOAD */}
        <div style={{ marginTop: 15 }}>
          <label className="small muted"><b>Upload Resume (required)</b></label>
          <input
            type="file"
            className="input"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* OPTIONAL ATTACHMENT */}
        <div style={{ marginTop: 12 }}>
          <label className="small muted">
            <b>Additional Attachment (Optional)</b>
          </label>
          <input
            type="file"
            className="input"
            onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="row-right" style={{ marginTop: 15 }}>
          <button
            className="btn btn-primary"
            disabled={submitting}
            onClick={apply}
          >
            {submitting ? "Applying..." : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
