import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import SeekerDashboard from "./pages/SeekerDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import MyApplication from "./pages/MyApplication";
import ProtectedRoute from "./components/ProtectedRoute";
import Applicants from "./pages/Applicants";
import PostJob from "./pages/PostJob";
import AdminDashboard from "./pages/AdminDashboard";
import JobDetails from "./pages/JobDetails";
import MyProfile from "./pages/MyProfile";
import JobSeekerProfileView from "./pages/JobSeekerProfileView";
import RecruiterProfile from "./pages/RecruiterProfile";
import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";
import AdminUserProfileView from "./pages/AdminUserProfileView";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <BrowserRouter>
      <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <Routes>
        <Route path="/" element={<Home sidebarOpen={sidebarOpen} />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/seeker"
          element={
            <ProtectedRoute role="JOB_SEEKER">
              <SeekerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute role="JOB_SEEKER">
              <MyApplication />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter"
          element={
            <ProtectedRoute role="RECRUITER">
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/post-job"
          element={
            <ProtectedRoute role="RECRUITER">
              <PostJob />
            </ProtectedRoute>
          }
        />

        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/jobseeker/:userId" element={<JobSeekerProfileView />} />
        <Route path="/recruiter/profile" element={<RecruiterProfile />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute role={["JOB_SEEKER", "RECRUITER"]}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/applicants/:jobId"
          element={
            <ProtectedRoute role="RECRUITER">
              <Applicants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/user/:userId"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminUserProfileView />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
