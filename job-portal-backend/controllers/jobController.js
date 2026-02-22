const Job = require("../models/Job");

/* 🔹 JOB SEEKER */
const getAllJobs = async (req, res) => {
  const jobs = await Job.find().populate("postedBy", "name email");
  res.json(jobs);
};

/* 🔹 RECRUITER */
const createJob = async (req, res) => {
  if (req.user.role !== "RECRUITER") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { title, company, location, description } = req.body;

  const job = await Job.create({
    title,
    company,
    location,
    description,
    postedBy: req.user.id,
  });

  res.status(201).json(job);
};

/* 🔹 RECRUITER */
const getMyJobs = async (req, res) => {
  if (req.user.role !== "RECRUITER") {
    return res.status(403).json({ message: "Access denied" });
  }

  const jobs = await Job.find({ postedBy: req.user.id });
  res.json(jobs);
};

module.exports = {
  createJob,
  getAllJobs,
  getMyJobs,
};
