const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: String,
    company: String,
    location: String,
    description: String,
    eligibility: String,
    requirements: String,
    jobType: String,
    experience: String,
    salary: String,

    // ✅ CUSTOM FORM FIELDS
    customFields: [
      {
        label: { type: String, required: true },      // Question text
        type: {
          type: String,
          enum: ["text", "textarea", "number","file"],
          default: "text",
        },
        required: {
          type: Boolean,
          default: false,
        },
        accept: { type: String, default: "" },
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
