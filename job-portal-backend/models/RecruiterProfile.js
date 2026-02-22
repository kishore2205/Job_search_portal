const mongoose = require("mongoose");

const recruiterProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },

    companyName: { type: String, default: "" },
    website: { type: String, default: "" },
    location: { type: String, default: "" },
    phone: { type: String, default: "" },
    about: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.RecruiterProfile ||
  mongoose.model("RecruiterProfile", recruiterProfileSchema);
