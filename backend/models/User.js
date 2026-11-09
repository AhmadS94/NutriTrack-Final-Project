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
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
