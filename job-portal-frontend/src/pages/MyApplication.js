import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const MyApplication = () => {
  const [apps, setApps] = useState([]);
  const [err, setErr] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const load = async () => {
    try {
      setErr("");
      const res = await api.get("/applications/my");
      setApps(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load applications");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return apps;
    return apps.filter((a) => a.status === statusFilter);
  }, [apps, statusFilter]);

  const getStatusClass = (status) => {
    switch (status) {
      case "SHORTLISTED":
        return "badge badge-blue";
      case "REJECTED":
        return "badge badge-red";
      case "SELECTED":
        return "badge badge-green";
      default:
        return "badge";
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">My Applications</h2>
      <p className="muted small">Track your application status here.</p>

      {/* FILTER */}
      <div className="card">
        <h3 className="card-title">Filter by Status</h3>
        <select
          className="select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">ALL</option>
          <option value="APPLIED">APPLIED</option>
          <option value="SHORTLISTED">SHORTLISTED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="SELECTED">SELECTED</option>
        </select>
      </div>

      {err && <div className="error">{err}</div>}

      {filtered.length === 0 && !err && (
        <div className="card">
          <h3 className="card-title">No applications</h3>
          <p className="muted">Apply for jobs from the Jobs page.</p>
        </div>
      )}

      {filtered.map((a) => (
        <div key={a._id} className="card">
          <h3 className="card-title">{a.job?.title || "Job"}</h3>

          <p className="muted">
            <b>Company:</b> {a.job?.company || "N/A"} •{" "}
            <b>Location:</b> {a.job?.location || "N/A"}
          </p>

          <div className="hr"></div>

          <p>
            <b>Status:</b>{" "}
            <span className={getStatusClass(a.status)}>
              {a.status}
            </span>
          </p>

          <p>
            <b>Resume:</b>{" "}
            {a.resume ? (
              <a
                className="nav-link"
                href={`http://localhost:5000${a.resume}`}
                target="_blank"
                rel="noreferrer"
              >
                View Resume →
              </a>
            ) : (
              <span className="muted">Not uploaded</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MyApplication;
