const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    techStack: { type: [String], default: [] },
    githubUrl: { type: String, default: "" },
    liveUrl: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

const educationSchema = new mongoose.Schema(
  {
    institute: { type: String, default: "" },
    degree: { type: String, default: "" },
    year: { type: String, default: "" },
    percentage: { type: String, default: "" },
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    org: { type: String, default: "" },
    year: { type: String, default: "" },
    link: { type: String, default: "" },
  },
  { _id: false }
);

const workSchema = new mongoose.Schema(
  {
    company: { type: String, default: "" },
    role: { type: String, default: "" },
    duration: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const jobSeekerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },

    headline: { type: String, default: "" },
    location: { type: String, default: "" },
    phone: { type: String, default: "" },
    about: { type: String, default: "" },

    skills: { type: [String], default: [] },

    // ✅ FIX: education must be ARRAY of objects
    education: { type: [educationSchema], default: [] },

    experience: { type: String, default: "" },

    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    portfolio: { type: String, default: "" },

    resume: { type: String, default: "" },

    projects: { type: [projectSchema], default: [] },

    // ✅ NEW sections like your screenshot
    certifications: { type: [certificationSchema], default: [] },
    workExperience: { type: [workSchema], default: [] },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.JobSeekerProfile ||
  mongoose.model("JobSeekerProfile", jobSeekerProfileSchema);
