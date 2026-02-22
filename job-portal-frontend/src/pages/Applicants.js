import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const BASE_URL = "http://localhost:5000";

const Applicants = () => {
  const { jobId } = useParams();

  const [apps, setApps] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort] = useState("NEW"); // NEW | OLD

  // ui
  const [expanded, setExpanded] = useState({}); // { [appId]: true/false }
  const [updatingId, setUpdatingId] = useState(null);

  /* ================================
     LOAD APPLICANTS
  ================================= */
  const loadApplicants = async () => {
    try {
      setErr("");
      setLoading(true);

      const res = await api.get(`/applications/job/${jobId}`);
      setApps(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
    // eslint-disable-next-line
  }, [jobId]);

  /* ================================
     UPDATE STATUS
  ================================= */
  const updateStatus = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);

      await api.put(`/applications/${appId}/status`, { status: newStatus });

      // update local state immediately
      setApps((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (e) {
      alert(e.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ================================
     FILTER + SORT
  ================================= */
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();

    const list = apps.filter((a) => {
      const name = (a.applicant?.name || "").toLowerCase();
      const email = (a.applicant?.email || "").toLowerCase();

      const matchSearch = !s || name.includes(s) || email.includes(s);
      const matchStatus = statusFilter === "ALL" || a.status === statusFilter;

      return matchSearch && matchStatus;
    });

    // sort by createdAt
    list.sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return sort === "NEW" ? db - da : da - db;
    });

    return list;
  }, [apps, search, statusFilter, sort]);

  /* ================================
     BADGE CLASS
  ================================= */
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

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="container">
      {/* HEADER */}
      <div
        className="row"
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <div>
          <h2 className="page-title" style={{ margin: 0 }}>
            Applicants
          </h2>
          <p className="muted small" style={{ marginTop: 6 }}>
            Total Applicants: <b>{apps.length}</b> • Showing:{" "}
            <b>{filtered.length}</b>
          </p>
        </div>

        <button className="btn btn-outline" onClick={loadApplicants}>
          Refresh
        </button>
      </div>

      {/* FILTER CARD */}
      <div className="card">
        <h3 className="card-title">Search & Filters</h3>

        <div className="row">
          <input
            className="input"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="REJECTED">Rejected</option>
            <option value="SELECTED">Selected</option>
          </select>

          <select
            className="select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="NEW">Newest First</option>
            <option value="OLD">Oldest First</option>
          </select>
        </div>

        <div className="row-right">
          <button
            className="btn btn-outline"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
              setSort("NEW");
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* STATES */}
      {loading && <div className="card">Loading applicants...</div>}
      {err && <div className="error">{err}</div>}

      {!loading && !err && filtered.length === 0 && (
        <div className="card">
          <h3 className="card-title">No applicants found</h3>
          <p className="muted">Try adjusting filters.</p>
        </div>
      )}

      {/* APPLICANT CARDS */}
      {!loading &&
        !err &&
        filtered.map((a) => {
          const isOpen = !!expanded[a._id];

          const resumeUrl = a.resume ? `${BASE_URL}${a.resume}` : null;
          const attachmentUrl = a.attachment ? `${BASE_URL}${a.attachment}` : null;

          return (
            <div key={a._id} className="card">
              {/* top row */}
              <div
                className="row"
                style={{
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h3 className="card-title" style={{ marginBottom: 6 }}>
                    {a.applicant?.name || "Applicant"}
                  </h3>

                  <p className="muted" style={{ margin: 0 }}>
                    <b>Email:</b> {a.applicant?.email || "N/A"}
                  </p>

                  <p className="muted" style={{ marginTop: 6 }}>
                    <b>Job:</b> {a.job?.title || ""}{" "}
                    {a.job?.company ? `(${a.job.company})` : ""}
                  </p>

                  <p className="muted small" style={{ marginTop: 6 }}>
                    Applied on:{" "}
                    <b>
                      {a.createdAt ? new Date(a.createdAt).toLocaleString() : "N/A"}
                    </b>
                  </p>
                </div>

                {/* RIGHT SIDE */}
                <div style={{ textAlign: "right" }}>
                  <span className={getStatusClass(a.status)}>{a.status}</span>

                  {/* ✅ NEW: VIEW PROFILE BUTTON */}
                  <div style={{ marginTop: 10 }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => (window.location.href = `/jobseeker/${a.applicant?._id}`)}
                      disabled={!a.applicant?._id}
                      title={!a.applicant?._id ? "Applicant profile id missing" : ""}
                    >
                      View Profile →
                    </button>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <select
                      className="select"
                      value={a.status}
                      disabled={updatingId === a._id}
                      onChange={(e) => updateStatus(a._id, e.target.value)}
                    >
                      <option value="APPLIED">APPLIED</option>
                      <option value="SHORTLISTED">SHORTLISTED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="SELECTED">SELECTED</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="hr"></div>

              {/* files */}
              <div className="row" style={{ alignItems: "center" }}>
                <p style={{ margin: 0 }}>
                  <b>Resume:</b>{" "}
                  {resumeUrl ? (
                    <a className="nav-link" href={resumeUrl} target="_blank" rel="noreferrer">
                      Download →
                    </a>
                  ) : (
                    <span className="muted">Not uploaded</span>
                  )}
                </p>

                <p style={{ margin: 0 }}>
                  <b>Attachment:</b>{" "}
                  {attachmentUrl ? (
                    <a className="nav-link" href={attachmentUrl} target="_blank" rel="noreferrer">
                      Download →
                    </a>
                  ) : (
                    <span className="muted">Not uploaded</span>
                  )}
                </p>
              </div>

              {/* answers */}
              <div style={{ marginTop: 10 }}>
                <button className="btn btn-outline" onClick={() => toggleExpanded(a._id)}>
                  {isOpen ? "Hide Application Details" : "View Application Details"}
                </button>

                {isOpen && (
                  <div className="card" style={{ marginTop: 12 }}>
                    <h4 className="card-title" style={{ marginBottom: 10 }}>
                      Application Details
                    </h4>

                    {a.answers && Object.keys(a.answers).length > 0 ? (
                      Object.entries(a.answers).map(([key, value]) => (
                        <p key={key} className="muted" style={{ margin: "8px 0" }}>
                          <b>{key}:</b>{" "}
                          {Array.isArray(value) ? value.join(", ") : String(value)}
                        </p>
                      ))
                    ) : (
                      <p className="muted">No additional answers submitted.</p>
                    )}
                  </div>
                )}
              </div>

              {/* quick buttons */}
              <div className="row" style={{ marginTop: 12 }}>
                <button
                  className="btn btn-outline"
                  disabled={updatingId === a._id}
                  onClick={() => updateStatus(a._id, "SHORTLISTED")}
                >
                  Shortlist
                </button>

                <button
                  className="btn btn-outline"
                  disabled={updatingId === a._id}
                  onClick={() => updateStatus(a._id, "REJECTED")}
                >
                  Reject
                </button>

                <button
                  className="btn btn-primary"
                  disabled={updatingId === a._id}
                  onClick={() => updateStatus(a._id, "SELECTED")}
                >
                  Select
                </button>
              </div>

              {updatingId === a._id && (
                <p className="muted small" style={{ marginTop: 10 }}>
                  Updating status...
                </p>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default Applicants;
