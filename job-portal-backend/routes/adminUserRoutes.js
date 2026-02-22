const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const User = require("../models/User");
const JobSeekerProfile = require("../models/JobSeekerProfile");
const RecruiterProfile = require("../models/RecruiterProfile");

const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
};
router.get("/", protect, async (req, res) => {
    try {
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Access denied" });
        }

        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/users/jobseekers", protect, adminOnly, async (req, res) => {
    try {
        const seekers = await User.find({ role: "JOB_SEEKER" })
            .select("name email role isApproved createdAt");

        const seekerIds = seekers.map((u) => u._id);

        const profiles = await JobSeekerProfile.find({ user: { $in: seekerIds } })
            .populate("user", "name email");

        // map userId -> profile
        const profMap = {};
        profiles.forEach((p) => {
            profMap[String(p.user?._id)] = p;
        });

        const result = seekers.map((u) => ({
            user: u,
            profile: profMap[String(u._id)] || null,
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get("/users/recruiters", protect, adminOnly, async (req, res) => {
    try {
        const recruiters = await User.find({ role: "RECRUITER" })
            .select("name email role isApproved createdAt");

        const recruiterIds = recruiters.map((u) => u._id);

        const profiles = await RecruiterProfile.find({ user: { $in: recruiterIds } })
            .populate("user", "name email");

        const profMap = {};
        profiles.forEach((p) => {
            profMap[String(p.user?._id)] = p;
        });

        const result = recruiters.map((u) => ({
            user: u,
            profile: profMap[String(u._id)] || null,
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/users/:userId", protect, adminOnly, async (req, res) => {
    try {
        const u = await User.findById(req.params.userId).select("-password");
        if (!u) return res.status(404).json({ message: "User not found" });

        let profile = null;
        if (u.role === "JOB_SEEKER") {
            profile = await JobSeekerProfile.findOne({ user: u._id }).populate("user", "name email");
        } else if (u.role === "RECRUITER") {
            profile = await RecruiterProfile.findOne({ user: u._id }).populate("user", "name email");
        }

        res.json({ user: u, profile });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// DELETE /api/admin/users/:id
router.delete("/:id", protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Prevent admin deleting himself
        if (user.role === "ADMIN") {
            return res.status(400).json({ message: "Cannot delete admin" });
        }

        await user.deleteOne();

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// PUT /api/admin/users/:id/block
router.put("/:id/block", protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role === "ADMIN") {
            return res.status(400).json({ message: "Cannot block admin" });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({
            message: user.isBlocked ? "User blocked" : "User unblocked",
            isBlocked: user.isBlocked,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
