import { useEffect, useState } from "react";
import api from "../api/axios";

function Dashboard() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/jobs/my", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setJobs(res.data));
  }, []);

  return (
    <div>
      <h2>My Posted Jobs</h2>

      {jobs.map((job) => (
        <div key={job._id}>
          <h3>{job.title}</h3>
          <p>{job.company}</p>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
