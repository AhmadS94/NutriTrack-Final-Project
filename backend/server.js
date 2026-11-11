require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

const profileRoutes = require("./routes/profileRoutes");
const mealRoutes = require("./routes/mealRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/appointments", appointmentRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    message: "NutriTrack API is running!",
  });
});

// Protected Route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You have access to this protected route!",
    user: req.user,
  });
});

// Admin Route
app.get("/api/admin", authMiddleware, roleMiddleware("admin"), (req, res) => {
  res.json({
    message: "Welcome Admin!",
  });
});

// Dietitian Route
app.get(
  "/api/dietitian",
  authMiddleware,
  roleMiddleware("dietitian", "admin"),
  (req, res) => {
    res.json({
      message: "Welcome to the Dietitian Area!",
    });
  },
);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    // Show the actual connected database
    console.log("Connected database:", mongoose.connection.name);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
