import { Link, useNavigate } from "react-router-dom";
import { getUserRole, logout } from "../utils/auth";
import { useState } from "react";

const Navbar = ({ onToggleSidebar }) => {
  const role = getUserRole();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();
  
  const [drawerOpen, setDrawerOpen] = useState(false);

  const initials = (user?.name || "U")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <>
      <div className="navbar">
        <div className="nav-left">
          {/* ✅ HAMBURGER */}


          <Link className="nav-link" to="/">JobPortal</Link>
          {role && <span className="badge">{role}</span>}
        </div>

        <div className="nav-right">
          <Link className="nav-link" to="/">Jobs</Link>

          {!role && (
            <>
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="nav-link" to="/register">Register</Link>
            </>
          )}

          {role === "RECRUITER" && (
            <>
              <Link className="nav-link" to="/recruiter">Dashboard</Link>
              <Link className="nav-link" to="/recruiter/post-job">Post Job</Link>
            </>
          )}
          {user && (user.role === "JOB_SEEKER" || user.role === "RECRUITER") && (
            <a href="/profile" className="nav-link">Profile</a>
          )}
          {user && user.role === "ADMIN" && (
            <a href="/admin/users" className="nav-link">Users</a>
          )}

          {role && (
            <button
              className="profile-btn"
              onClick={() => setDrawerOpen(true)}
              style={{ padding: 0 }}
              title="Profile"
            >
              <span className="profile-avatar">{initials}</span>
            </button>
          )}
        </div>
      </div>

      {/* RIGHT DRAWER */}
      {drawerOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="drawer">
            <div className="drawer-header">
              <div className="drawer-avatar">{initials}</div>

              <div>
                <div className="drawer-name">{user?.name || "User"}</div>
                <div className="drawer-email">{user?.email || ""}</div>
              </div>

              <button className="drawer-close" onClick={() => setDrawerOpen(false)}>
                ✕
              </button>
            </div>

            <div className="drawer-list">
              <button
                className="drawer-item"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate("/profile");
                }}
              >
                My Profile
              </button>

              {role === "JOB_SEEKER" && (
                <button
                  className="drawer-item"
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate("/applications");
                  }}
                >
                  My Applications
                </button>
              )}

              <button
                className="drawer-item"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate(role === "RECRUITER" ? "/recruiter" : "/");
                }}
              >
                Dashboard
              </button>

              <button className="drawer-item danger" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
