const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin", "dietitian"],
      default: "user",
    },

    age: {
      type: Number,
      min: 1,
      max: 120,
    },

    height: {
      type: Number,
      min: 50,
      max: 250,
    },

    weight: {
      type: Number,
      min: 1,
      max: 500,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    activityLevel: {
      type: String,
      enum: ["sedentary", "lightly_active", "moderately_active", "very_active"],
    },

    dailyCalorieGoal: {
      type: Number,
      min: 500,
      max: 10000,
      default: 2000,
    },

    // Location for users and dietitians
    location: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },

      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },

      address: {
        type: String,
        trim: true,
        maxlength: 300,
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
