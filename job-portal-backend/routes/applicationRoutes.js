const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");

const sendEmail = require("../utils/sendEmail");

router.post(
  "/",
  protect,
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "attachment", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (req.user.role !== "JOB_SEEKER") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { jobId } = req.body;
      const answers = JSON.parse(req.body.answers || "{}");

      if (!jobId) return res.status(400).json({ message: "jobId required" });

      const existing = await Application.findOne({
        job: jobId,
        applicant: req.user.id,
      });

      if (existing) {
        return res.status(409).json({ message: "Already applied" });
      }

      const app = await Application.create({
        job: jobId,
        applicant: req.user.id,
        answers,
        resume: req.files?.resume?.[0]?.filename
          ? `/uploads/${req.files.resume[0].filename}`
          : null,
        attachment: req.files?.attachment?.[0]?.filename
          ? `/uploads/${req.files.attachment[0].filename}`
          : null,
        status: "APPLIED",
      });

      res.status(201).json(app);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.get("/my", protect, async (req, res) => {
  try {
    if (req.user.role !== "JOB_SEEKER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const apps = await Application.find({ applicant: req.user.id }).populate(
      "job"
    );

    return res.json(apps);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ================================
   JOB SEEKER: UPLOAD RESUME
   POST /api/applications/upload/:appId
================================ */
router.post(
  "/upload/:appId",
  protect,
  (req, res, next) => {
    // multer error handling wrapper
    upload.single("resume")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || "Upload error" });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (req.user.role !== "JOB_SEEKER") {
        return res.status(403).json({ message: "Access denied" });
      }

      const app = await Application.findById(req.params.appId);
      if (!app) return res.status(404).json({ message: "Application not found" });

      if (String(app.applicant) !== String(req.user.id)) {
        return res.status(403).json({ message: "Not your application" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Resume file is required (PDF only)" });
      }

      app.resume = `/uploads/${req.file.filename}`;
      await app.save();

      return res.json(app);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
);

/* ================================
   RECRUITER: VIEW APPLICANTS
   GET /api/applications/job/:jobId
================================ */
router.get("/job/:jobId", protect, async (req, res) => {
  try {
    if (req.user.role !== "RECRUITER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const apps = await Application.find({ job: req.params.jobId })
      .populate("applicant", "name email")
      .populate("job", "title company");

    return res.json(apps);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ================================
   RECRUITER: UPDATE STATUS
   PUT /api/applications/:appId/status
================================ */
router.put("/:appId/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "RECRUITER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.body;
    const allowed = ["APPLIED", "SHORTLISTED", "REJECTED", "SELECTED"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const app = await Application.findById(req.params.appId)
      .populate("applicant", "name email")
      .populate("job", "title company");

    if (!app) return res.status(404).json({ message: "Application not found" });

    app.status = status;
    await app.save();

    // send email (DO NOT fail request if email fails)
    try {
      if (app.applicant?.email) {
        await sendEmail({
          to: app.applicant.email,
          subject: `Application Status Updated: ${app.job.title}`,
          html: `
            <p>Hi ${app.applicant.name},</p>
            <p>Your application for <b>${app.job.title}</b> has been updated.</p>
            <p>New Status: <b>${status}</b></p>
          `,
        });
      }
    } catch (emailErr) {
      console.log("⚠️ Email failed (status update):", emailErr.message);
    }

    return res.json(app);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ================================
   JOB SEEKER: APPLIED JOB IDS
   GET /api/applications/my/job-ids
================================ */
router.get("/my/job-ids", protect, async (req, res) => {
  try {
    if (req.user.role !== "JOB_SEEKER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const apps = await Application.find({ applicant: req.user.id }).select("job");
    return res.json(apps.map((a) => String(a.job)));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
