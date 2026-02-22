const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ Custom form answers
    answers: {
      type: Object,
      default: {},
    },

    // ✅ Resume file
    resume: {
      type: String,
    },

    // ✅ Optional additional file
    attachment: {
      type: String,
    },

    status: {
      type: String,
      default: "APPLIED",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
