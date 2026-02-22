import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const SeekerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, applied: 0 });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.all([
        api.get("/jobs"),
        api.get("/applications/my"),
      ]);
      setStats({
        total: jobsRes.data?.length || 0,
        applied: appsRes.data?.length || 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="container">
      <h2 className="page-title">Seeker Dashboard</h2>
      <p className="muted small">Track your activity and navigate quickly.</p>

      {loading ? (
        <div className="card">Loading...</div>
      ) : (
        <div className="row">
          <div className="card" style={{ flex: 1 }}>
            <h3 className="card-title">Available Jobs</h3>
            <p className="muted">Total: <b>{stats.total}</b></p>
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              Browse Jobs
            </button>
          </div>

          <div className="card" style={{ flex: 1 }}>
            <h3 className="card-title">My Applications</h3>
            <p className="muted">Applied: <b>{stats.applied}</b></p>
            <button className="btn btn-outline" onClick={() => navigate("/applications")}>
              View Applications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeekerDashboard;
