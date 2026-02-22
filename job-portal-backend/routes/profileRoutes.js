const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload"); // multer config

const JobSeekerProfile = require("../models/JobSeekerProfile");
const RecruiterProfile = require("../models/RecruiterProfile");

/* ============================
   HELPERS
============================ */
const pick = (obj, keys) => {
  const out = {};
  keys.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k];
  });
  return out;
};

// ✅ normalize skills to array
const normalizeSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.map(s => String(s).trim()).filter(Boolean);
  if (typeof skills === "string") {
    return skills.split(",").map(s => s.trim()).filter(Boolean);
  }
  return [];
};

// ✅ normalize education to object
// Accepts:
// - object: { institute, degree, year }
// - string: "Some text"  (old frontend)
const normalizeEducation = (education) => {
  if (!education) return { institute: "", degree: "", year: "" };

  // if string comes from old UI, store in degree
  if (typeof education === "string") {
    return { institute: "", degree: education.trim(), year: "" };
  }

  // if already object
  return {
    institute: education.institute ? String(education.institute).trim() : "",
    degree: education.degree ? String(education.degree).trim() : "",
    year: education.year ? String(education.year).trim() : "",
  };
};


router.get("/me", protect, async (req, res) => {
  try {
    if (req.user.role !== "JOB_SEEKER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const profile = await JobSeekerProfile.findOneAndUpdate(
      { user: req.user.id },
      { $setOnInsert: { user: req.user.id } },
      { new: true, upsert: true }
    ).populate("user", "name email");

    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
router.put("/me", protect, async (req, res) => {
  try {
    if (req.user.role !== "JOB_SEEKER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const allowed = [
      "about",
      "skills",
      "education",
      "experience",
      "phone",
      "location",
      "linkedin",
      "github",
      "portfolio",
      "headline",
    ];

    const payload = pick(req.body, allowed);

    // skills: string -> array
    if (typeof payload.skills === "string") {
      payload.skills = payload.skills.split(",").map(s => s.trim()).filter(Boolean);
    }

    /**
     * ✅ education FIX:
     * - if education is a string => store as 1 education entry
     * - if education is an object => wrap in array
     * - if education is already array => keep it
     */
    if (typeof payload.education === "string") {
      const degree = payload.education.trim();
      payload.education = degree
        ? [{ institute: "", degree, year: "", percentage: "" }]
        : [];
    } else if (payload.education && !Array.isArray(payload.education)) {
      payload.education = [payload.education];
    }

    const updated = await JobSeekerProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: payload, $setOnInsert: { user: req.user.id } },
      { new: true, upsert: true }
    ).populate("user", "name email");

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
router.post("/me/resume", protect, upload.single("resume"), async (req, res) => {
  try {
    if (req.user.role !== "JOB_SEEKER") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    const updated = await JobSeekerProfile.findOneAndUpdate(
      { user: req.user.id },
      {
        $set: { resume: `/uploads/${req.file.filename}` },
        $setOnInsert: { user: req.user.id },
      },
      { new: true, upsert: true, runValidators: true }
    ).populate("user", "name email");

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/me/project", protect, upload.single("image"), async (req, res) => {
  try {
    if (req.user.role !== "JOB_SEEKER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, description, githubUrl, liveUrl, techStack } = req.body;

    if (!title || title.trim().length < 2) {
      return res.status(400).json({ message: "Project title is required" });
    }

    const profile = await JobSeekerProfile.findOneAndUpdate(
      { user: req.user.id },
      { $setOnInsert: { user: req.user.id } },
      { new: true, upsert: true, runValidators: true }
    );

    const techArr =
      typeof techStack === "string"
        ? techStack.split(",").map((s) => s.trim()).filter(Boolean)
        : Array.isArray(techStack)
        ? techStack.map((s) => String(s).trim()).filter(Boolean)
        : [];

    profile.projects.push({
      title: title.trim(),
      description: (description || "").trim(),
      githubUrl: (githubUrl || "").trim(),
      liveUrl: (liveUrl || "").trim(),
      techStack: techArr,
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });

    await profile.save();

    const populated = await JobSeekerProfile.findById(profile._id).populate("user", "name email");
    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/me/project/:projectId", protect, async (req, res) => {
  try {
    if (req.user.role !== "JOB_SEEKER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const profile = await JobSeekerProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const before = profile.projects.length;
    profile.projects = profile.projects.filter(
      (p) => String(p._id) !== String(req.params.projectId)
    );

    if (profile.projects.length === before) {
      return res.status(404).json({ message: "Project not found" });
    }

    await profile.save();

    const populated = await JobSeekerProfile.findById(profile._id).populate("user", "name email");
    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/recruiter/me", protect, async (req, res) => {
  try {
    if (req.user.role !== "RECRUITER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const profile = await RecruiterProfile.findOneAndUpdate(
      { user: req.user.id },
      { $setOnInsert: { user: req.user.id } },
      { new: true, upsert: true, runValidators: true }
    ).populate("user", "name email");

    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
/* ============================
   ADMIN/RECRUITER: VIEW RECRUITER PROFILE
   GET /api/profile/recruiter/:userId
============================ */
router.get("/recruiter/:userId", protect, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "RECRUITER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const profile = await RecruiterProfile.findOne({
      user: req.params.userId,
    }).populate("user", "name email role");

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put("/recruiter/me", protect, async (req, res) => {
  try {
    if (req.user.role !== "RECRUITER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const allowed = ["companyName", "about", "website", "location", "phone"];
    const payload = pick(req.body, allowed);

    const updated = await RecruiterProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: payload, $setOnInsert: { user: req.user.id } },
      { new: true, upsert: true, runValidators: true }
    ).populate("user", "name email");

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ============================
   RECRUITER/ADMIN: VIEW JOB SEEKER PROFILE
   GET /api/profile/jobseeker/:userId
============================ */
router.get("/jobseeker/:userId", protect, async (req, res) => {
  try {
    if (req.user.role !== "RECRUITER" && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const profile = await JobSeekerProfile.findOne({ user: req.params.userId })
      .populate("user", "name email");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
