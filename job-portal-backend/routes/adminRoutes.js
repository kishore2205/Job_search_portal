
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
console.log("protect type =", typeof protect);
console.log("adminOnly type =", typeof adminOnly);

// ✅ Admin analytics counts
router.get("/analytics", protect, adminOnly, async (req, res) => {
  try {
    const [users, jobs, applications, pendingRecruiters] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),

      // ✅ Pending recruiters = role RECRUITER and NOT approved
      User.countDocuments({
        role: "RECRUITER",
        $or: [
          { isApproved: false },              // boolean false
          { isApproved: { $exists: false } }, // missing field
          { isApproved: "false" },            // string false (bad data)
        ],
      }),
    ]);

    res.json({ users, jobs, applications, pendingRecruiters });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/pending-recruiters", protect, adminOnly, async (req, res) => {
  try {
    const recruiters = await User.find({
      role: "RECRUITER",
      $or: [
        { isApproved: false },
        { isApproved: { $exists: false } },
        { isApproved: "false" }, // old bad data
      ],
    }).select("-password");

    res.json(recruiters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/approve-recruiter/:id", protect, adminOnly, async (req, res) => {
  try {
    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, role: "RECRUITER" },
      { $set: { isApproved: true } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    console.log("✅ Approved recruiter in DB:", updated.email, updated.isApproved, typeof updated.isApproved);

    res.json({ message: "Recruiter approved ✅", user: updated });
  } catch (err) {
    console.error("❌ approve-recruiter error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
