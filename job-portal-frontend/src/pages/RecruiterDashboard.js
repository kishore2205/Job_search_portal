import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const emptyForm = {
  title: "",
  company: "",
  location: "",
  description: "",
  eligibility: "",
  requirements: "",
  jobType: "",
  experience: "",
  salary: "",
  formUrl: "",
};

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [form, setForm] = useState(emptyForm);

  const fetchMyJobs = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get("/jobs/my");
      setJobs(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load recruiter jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const openEdit = (job) => {
    setSelectedJobId(job._id);
    setForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      description: job.description || "",
      eligibility: job.eligibility || "",
      requirements: job.requirements || "",
      jobType: job.jobType || "",
      experience: job.experience || "",
      salary: job.salary || "",
      formUrl: job.formUrl || "",
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setSelectedJobId("");
    setForm(emptyForm);
  };

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const saveEdit = async () => {
    try {
      setSaving(true);

      if (!form.title || !form.company || !form.description) {
        alert("Title, Company, and Description are required");
        return;
      }

      if (form.formUrl && !form.formUrl.startsWith("http")) {
        alert("Google Form link must start with http/https");
        return;
      }

      await api.put(`/jobs/${selectedJobId}`, form);
      alert("Job updated ✅");
      closeEdit();
      fetchMyJobs();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  const deleteJob = async (jobId) => {
    const ok = window.confirm("Are you sure you want to delete this job?");
    if (!ok) return;

    try {
      await api.delete(`/jobs/${jobId}`);
      alert("Job deleted ✅");
      fetchMyJobs();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to delete job");
    }
  };

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="page-title" style={{ margin: 0 }}>Recruiter Dashboard</h2>

        <Link className="btn btn-primary" to="/recruiter/post-job">
          + Post New Job
        </Link>
      </div>

      <p className="muted small" style={{ marginTop: 6 }}>
        Manage your posted jobs (edit / delete) and view applicants.
      </p>

      {loading && <div className="card">Loading...</div>}
      {err && <div className="error">{err}</div>}

      {!loading && !err && jobs.length === 0 && (
        <div className="card">
          <h3 className="card-title">No jobs posted yet</h3>
          <p className="muted">Click “Post New Job” to create your first job.</p>
        </div>
      )}

      {jobs.map((job) => (
        <div key={job._id} className="card">
          <h3 className="card-title">{job.title}</h3>
          <p className="muted">
            <b>Company:</b> {job.company} • <b>Location:</b> {job.location || "N/A"}
            {job.jobType ? ` • ${job.jobType}` : ""}
          </p>

          <div className="hr"></div>
          <p className="muted">{job.description}</p>

          <div className="row-right">
            <button className="btn btn-outline" onClick={() => openEdit(job)}>
              Edit
            </button>

            <button className="btn btn-danger" onClick={() => deleteJob(job._id)}>
              Delete
            </button>

            <Link className="btn btn-outline" to={`/recruiter/applicants/${job._id}`}>
              View Applicants →
            </Link>
          </div>
        </div>
      ))}

      {/* ✅ EDIT MODAL */}
      {editOpen && (
        <>
          <div className="drawer-backdrop" onClick={closeEdit} />
          <div className="modal">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Edit Job</h3>
              <button className="drawer-close" onClick={closeEdit}>✕</button>
            </div>

            <div className="modal-body">
              <input className="input" name="title" placeholder="Job Title *" value={form.title} onChange={handleChange} />
              <input className="input" name="company" placeholder="Company *" value={form.company} onChange={handleChange} />
              <input className="input" name="location" placeholder="Location" value={form.location} onChange={handleChange} />

              <select className="select" name="jobType" value={form.jobType} onChange={handleChange}>
                <option value="">Select Job Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>

              <input className="input" name="experience" placeholder="Experience (e.g. 0-1 yrs)" value={form.experience} onChange={handleChange} />
              <input className="input" name="salary" placeholder="Salary (e.g. 3-6 LPA)" value={form.salary} onChange={handleChange} />

              <textarea className="textarea" name="description" placeholder="Job Description *" value={form.description} onChange={handleChange} />
              <textarea className="textarea" name="eligibility" placeholder="Eligibility" value={form.eligibility} onChange={handleChange} />
              <textarea className="textarea" name="requirements" placeholder="Requirements" value={form.requirements} onChange={handleChange} />

              <input className="input" name="formUrl" placeholder="Google Form Link" value={form.formUrl} onChange={handleChange} />
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeEdit} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RecruiterDashboard;
