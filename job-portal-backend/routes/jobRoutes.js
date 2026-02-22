const express = require("express");
const Job = require("../models/Job");
const protect = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

/**
 * GET JOBS (Public) - pagination + filters + sort
 * /api/jobs?page=1&limit=6&search=&location=&company=&jobType=&sort=NEW
 */
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "6", 10), 1), 50);

    const search = (req.query.search || "").trim();
    const location = (req.query.location || "").trim();
    const company = (req.query.company || "").trim();
    const jobType = (req.query.jobType || "").trim();
    const sort = (req.query.sort || "NEW").trim(); // NEW | OLD

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { requirements: { $regex: search, $options: "i" } },
      ];
    }

    if (location) query.location = { $regex: location, $options: "i" };
    if (company) query.company = { $regex: company, $options: "i" };
    if (jobType && jobType !== "ALL") query.jobType = jobType;

    const skip = (page - 1) * limit;
    const sortObj = sort === "OLD" ? { createdAt: 1 } : { createdAt: -1 };

    const [total, jobs] = await Promise.all([
      Job.countDocuments(query),
      Job.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name email"),
    ]);

    res.json({
      jobs,
      page,
      limit,
      total,
      hasMore: skip + jobs.length < total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ==============================
   RECRUITER: GET MY JOBS
================================ */
router.get("/my", protect, async (req, res) => {
  if (req.user.role !== "RECRUITER") {
    return res.status(403).json({ message: "Access denied" });
  }

  const recruiter = await User.findById(req.user.id);
  if (!recruiter.isApproved) {
    return res.status(403).json({ message: "Recruiter not approved by admin yet" });
  }

  const jobs = await Job.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
  res.json(jobs);
});

/* ==============================
   PUBLIC: GET JOB DETAILS
================================ */
router.get("/:id", async (req, res) => {
  const job = await Job.findById(req.params.id).populate("createdBy", "name email");
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json(job);
});

/* ==============================
   RECRUITER: CREATE JOB
================================ */
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "RECRUITER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const recruiter = await User.findById(req.user.id);

    console.log(
      "RECRUITER check:",
      recruiter?._id?.toString(),
      recruiter?.email,
      recruiter?.isApproved,
      typeof recruiter?.isApproved
    );

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    if (recruiter.isApproved !== true) {
      return res.status(403).json({ message: "Recruiter not approved by admin yet" });
    }

    const job = await Job.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* ==============================
   RECRUITER: UPDATE JOB (Edit)
================================ */
router.put("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "RECRUITER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // ✅ Only owner can edit
    if (String(job.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: "You can edit only your jobs" });
    }

    // fields allowed to update
    const allowed = [
      "title",
      "company",
      "location",
      "description",
      "eligibility",
      "requirements",
      "jobType",
      "experience",
      "salary",
      "formUrl",
    ];

    allowed.forEach((k) => {
      if (req.body[k] !== undefined) job[k] = req.body[k];
    });

    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ==============================
   RECRUITER: DELETE JOB
================================ */
router.delete("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "RECRUITER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // ✅ Only owner can delete
    if (String(job.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: "You can delete only your jobs" });
    }

    await job.deleteOne();
    res.json({ message: "Job deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
