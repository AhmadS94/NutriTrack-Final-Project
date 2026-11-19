const express = require("express");
const router = express.Router();

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/profile
// Get the logged-in user's profile
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
});

// PUT /api/profile
// Update the logged-in user's profile
router.put("/", authMiddleware, async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "age",
      "height",
      "weight",
      "gender",
      "activityLevel",
      "dailyCalorieGoal",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json(user);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to update profile",
    });
  }
});

// PUT /api/profile/location
// Save the logged-in user's location
router.put("/location", authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;

    // Validate coordinates
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        message: "Invalid latitude or longitude",
      });
    }

    // Validate optional address
    if (
      address !== undefined &&
      (typeof address !== "string" || address.length > 300)
    ) {
      return res.status(400).json({
        message: "Invalid address",
      });
    }

    const location = {
      latitude,
      longitude,
      address: address?.trim() || "",
    };

    // Update only the logged-in user's location
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          location,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      message: "Location saved successfully",
      location: user.location,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to save location",
    });
  }
});

module.exports = router;
