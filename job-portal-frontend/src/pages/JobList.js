import React, { useEffect, useState } from "react";
import api from "../api/axios";


const JobList = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs");
        setJobs(res.data);
      } catch (err) {
        alert("Failed to load jobs");
      }
    };
    fetchJobs();
  }, []);

  const applyJob = async (jobId, file) => {
  const formData = new FormData();
  formData.append("resume", file);

  await api.post(`/applications/apply/${jobId}`, formData);
  alert("Applied Successfully");
};


  return (
    <div>
      <h2>Available Jobs</h2>

      {jobs.map((job) => (
        <div
          key={job._id}
          style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}
        >
          <h3>{job.title}</h3>
          <p>{job.description}</p>
          <p><b>Skills:</b> {job.skills}</p>
          <p><b>Location:</b> {job.location}</p>
          <button onClick={() => applyJob(job._id)}>Apply</button>
        </div>
      ))}
    </div>
  );
};

export default JobList;
