import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AdminDashboard = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [stats, setStats] = useState(null);

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [q, setQ] = useState("");

  const load = async () => {
    try {
      setErr("");
      setLoading(true);

      const [pendingRes, analyticsRes] = await Promise.all([
        api.get("/admin/pending-recruiters"),
        api.get("/admin/analytics"),
      ]);

      setRecruiters(pendingRes.data || []);
      setStats(analyticsRes.data || null);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    try {
      setApprovingId(id);

      const res = await api.put(`/admin/approve-recruiter/${id}`);
      console.log("APPROVED USER:", res.data.user); // ✅ check isApproved

      alert("Recruiter approved ✅");
      setRecruiters((prev) => prev.filter((r) => r._id !== id));

      const analyticsRes = await api.get("/admin/analytics", {
        headers: { "Cache-Control": "no-cache" },
      });
      setStats(analyticsRes.data || null);
    } catch (e) {
      console.log("APPROVE ERROR:", e.response?.data);
      alert(e.response?.data?.message || "Approval failed");
    } finally {
      setApprovingId(null);
    }
  };


  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return recruiters;
    return recruiters.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(s) ||
        (r.email || "").toLowerCase().includes(s)
    );
  }, [recruiters, q]);

  return (
    <div className="container">
      {/* Header */}
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="page-title" style={{ margin: 0 }}>
          Admin Dashboard
        </h2>
        <button className="btn btn-outline" onClick={load}>
          Refresh
        </button>
      </div>

      {/* Analytics */}
      {stats && (
        <div className="row">
          <div className="card" style={{ flex: 1 }}>
            <h3 className="card-title">Users</h3>
            <p className="muted"><b>{stats.users}</b></p>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <h3 className="card-title">Jobs</h3>
            <p className="muted"><b>{stats.jobs}</b></p>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <h3 className="card-title">Applications</h3>
            <p className="muted"><b>{stats.applications}</b></p>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <h3 className="card-title">Pending Recruiters</h3>
            <p className="muted"><b>{stats.pendingRecruiters}</b></p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card">
        <h3 className="card-title">Search Recruiters</h3>
        <input
          className="input"
          placeholder="Search by name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <p className="small muted">
          Showing {filtered.length} of {recruiters.length} pending recruiters
        </p>
      </div>

      {/* States */}
      {loading && <div className="card">Loading admin data...</div>}
      {err && <div className="error">{err}</div>}

      {!loading && !err && filtered.length === 0 && (
        <div className="card">
          <h3 className="card-title">No pending recruiters 🎉</h3>
          <p className="muted">All recruiters are approved.</p>
        </div>
      )}

      {/* Recruiter Cards */}
      {filtered.map((r) => (
        <div key={r._id} className="card">
          <h3 className="card-title">{r.name}</h3>
          <p className="muted"><b>Email:</b> {r.email}</p>

          <div className="row-right">
            <button
              className="btn btn-primary"
              disabled={approvingId === r._id}
              onClick={() => approve(r._id)}
            >
              {approvingId === r._id ? "Approving..." : "Approve"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
