const Application = require("../models/Application");

exports.applyJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // prevent duplicate apply
    const exists = await Application.findOne({
      job: jobId,
      applicant: req.user.id,
    });

    if (exists) {
      return res.status(400).json({ message: "Already applied for this job" });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user.id,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ applicant: req.user.id })
      .populate("job");

    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
