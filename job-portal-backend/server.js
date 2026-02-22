const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
dotenv.config();

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const profileRoutes = require("./routes/profileRoutes");
const JobSeekerProfile = require("./models/JobSeekerProfile");
const adminUserRoutes = require("./routes/adminUserRoutes");

console.log("JobSeekerProfile schema experience type =", JobSeekerProfile.schema.path("experience").instance);





const app = express();


app.use(cors());
app.use(express.json()); 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin/users", adminUserRoutes);


app.get("/", (req, res) => {
  res.send("Job Portal API is running...");
});

/* ---------- DB ---------- */
connectDB();

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
