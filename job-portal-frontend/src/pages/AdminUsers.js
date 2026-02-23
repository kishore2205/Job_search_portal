import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [actionId, setActionId] = useState(""); // block/delete/approve loading id
  const navigate = useNavigate();

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ APPROVE RECRUITER
  const approveRecruiter = async (id) => {
    if (!window.confirm("Approve this recruiter?")) return;

    try {
      setActionId(id);
      const res = await api.put(`/admin/approve-recruiter/${id}`);

      // Update UI immediately
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, isApproved: true } : u
        )
      );

      alert(res.data?.message || "Recruiter approved ✅");
    } catch (e) {
      alert(e.response?.data?.message || "Approval failed");
    } finally {
      setActionId("");
    }
  };

  const deleteUser = async (id, role) => {
    if (role === "ADMIN") {
      alert("You cannot delete an admin user.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setActionId(id);
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      alert("User deleted ✅");
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed");
    } finally {
      setActionId("");
    }
  };

  const toggleBlock = async (id, role) => {
    if (role === "ADMIN") {
      alert("You cannot block an admin user.");
      return;
    }

    try {
      setActionId(id);
      const res = await api.put(`/admin/users/${id}/block`);

      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, isBlocked: res.data?.isBlocked } : u
        )
      );

      alert(res.data?.message || "Updated ✅");
    } catch (e) {
      alert(e.response?.data?.message || "Block/Unblock failed");
    } finally {
      setActionId("");
    }
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return users.filter((u) => {
      const matchSearch =
        !s ||
        (u.name || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s);

      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, q, roleFilter]);

  const roleBadge = (u) => {
    if (u.role === "ADMIN") return "badge badge-green";
    if (u.role === "RECRUITER") return "badge badge-blue";
    return "badge";
  };

  const approvalBadge = (u) => {
    if (u.role !== "RECRUITER") return null;
    return u.isApproved ? (
      <span className="badge badge-green">APPROVED</span>
    ) : (
      <span className="badge badge-red">PENDING</span>
    );
  };

  return (
    <div className="container">
      <h2 className="page-title">Admin — Users</h2>

      {/* FILTER BAR */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="row">
          <input
            className="input"
            placeholder="Search by name/email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select
            className="select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">ALL</option>
            <option value="JOB_SEEKER">JOB_SEEKER</option>
            <option value="RECRUITER">RECRUITER</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <button className="btn btn-outline" onClick={load}>
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="card" style={{ marginTop: 12 }}>
          Loading...
        </div>
      )}
      {err && (
        <div className="error" style={{ marginTop: 12 }}>
          {err}
        </div>
      )}

      {!loading &&
        !err &&
        filtered.map((u) => (
          <div key={u._id} className="card" style={{ marginTop: 12 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              {/* LEFT */}
              <div>
                <h3 className="card-title" style={{ marginBottom: 6 }}>
                  {u.name}
                </h3>

                <p className="muted" style={{ margin: 0 }}>
                  <b>Email:</b> {u.email}
                </p>

                <p className="muted" style={{ marginTop: 6 }}>
                  <b>Role:</b>{" "}
                  <span className={roleBadge(u)}>{u.role}</span>{" "}
                  {u.role === "RECRUITER" && (
                    <>
                      {" "}• {approvalBadge(u)}
                    </>
                  )}
                  {u.role !== "ADMIN" && (
                    <>
                      {" "}• <b>Status:</b>{" "}
                      <span className={u.isBlocked ? "badge badge-red" : "badge"}>
                        {u.isBlocked ? "BLOCKED" : "ACTIVE"}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* RIGHT */}
              <div className="row" style={{ gap: 10 }}>
                {(u.role === "JOB_SEEKER" || u.role === "RECRUITER") ? (
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate(`/admin/user/${u._id}`)}
                  >
                    View Profile →
                  </button>
                ) : (
                  <span className="muted small" style={{ alignSelf: "center" }}>
                    No profile
                  </span>
                )}

                {/* ✅ APPROVE BUTTON ONLY FOR PENDING RECRUITERS */}
                {u.role === "RECRUITER" && !u.isApproved && (
                  <button
                    className="btn btn-primary"
                    disabled={actionId === u._id}
                    onClick={() => approveRecruiter(u._id)}
                  >
                    {actionId === u._id ? "Approving..." : "Approve"}
                  </button>
                )}

                {/* BLOCK/UNBLOCK */}
                {u.role !== "ADMIN" && (
                  <button
                    className="btn btn-primary"
                    disabled={actionId === u._id}
                    onClick={() => toggleBlock(u._id, u.role)}
                  >
                    {actionId === u._id
                      ? "Updating..."
                      : u.isBlocked
                      ? "Unblock"
                      : "Block"}
                  </button>
                )}

                {/* DELETE */}
                {u.role !== "ADMIN" && (
                  <button
                    className="btn btn-outline"
                    disabled={actionId === u._id}
                    onClick={() => deleteUser(u._id, u.role)}
                  >
                    {actionId === u._id ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

      {!loading && !err && filtered.length === 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          No users found.
        </div>
      )}
    </div>
  );
};

export default AdminUsers;