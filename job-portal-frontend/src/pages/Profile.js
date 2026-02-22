import { useMemo } from "react";
import MyProfile from "./MyProfile";
import RecruiterProfile from "./RecruiterProfile";

const Profile = () => {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  if (!user) {
    return (
      <div className="container">
        <div className="card">Please login to view your profile.</div>
      </div>
    );
  }

  // ✅ recruiter -> recruiter profile page
  if (user.role === "RECRUITER") return <RecruiterProfile />;

  // ✅ job seeker -> job seeker profile page
  return <MyProfile />;
};

export default Profile;
