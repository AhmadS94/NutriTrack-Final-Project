const express = require("express");
const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// POST /api/appointments
// Request an appointment with a dietitian
router.post("/", async (req, res) => {
  try {
    const { dietitianId, date } = req.body;

    if (!mongoose.isValidObjectId(dietitianId)) {
      return res.status(400).json({
        message: "Invalid dietitian ID",
      });
    }

    const appointmentDate = new Date(date);

    if (!date || Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        message: "Invalid appointment date",
      });
    }

    if (appointmentDate <= new Date()) {
      return res.status(400).json({
        message: "Appointment must be in the future",
      });
    }

    const dietitian = await User.findOne({
      _id: dietitianId,
      role: "dietitian",
    });

    if (!dietitian) {
      return res.status(404).json({
        message: "Dietitian not found",
      });
    }

    if (String(req.user.id) === String(dietitianId)) {
      return res.status(400).json({
        message: "You cannot book yourself",
      });
    }

    const existingAppointment = await Appointment.findOne({
      dietitian: dietitianId,
      date: appointmentDate,
      status: "confirmed",
    });

    if (existingAppointment) {
      return res.status(409).json({
        message: "This time slot is already booked",
      });
    }

    const appointment = await Appointment.create({
      user: req.user.id,
      dietitian: dietitianId,
      date: appointmentDate,
      status: "pending",
    });

    res.status(201).json({
      message: "Appointment request submitted",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create appointment",
    });
  }
});

// GET /api/appointments/my
// Show appointments requested by the logged-in user
router.get("/my", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      user: req.user.id,
    })
      .populate("dietitian", "name email")
      .sort({ date: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load appointments",
    });
  }
});

// GET /api/appointments/dietitians
// List dietitians available for selection
router.get("/dietitians", async (req, res) => {
  try {
    const dietitians = await User.find({
      role: "dietitian",
    }).select("name email");

    res.json(dietitians);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load dietitians",
    });
  }
});

// GET /api/appointments/dietitian
// Show appointment requests assigned to the dietitian
router.get("/dietitian", async (req, res) => {
  try {
    if (req.user.role !== "dietitian") {
      return res.status(403).json({
        message: "Dietitian access required",
      });
    }

    const appointments = await Appointment.find({
      dietitian: req.user.id,
    })
      .populate("user", "name email")
      .sort({ date: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load appointment requests",
    });
  }
});

// PATCH /api/appointments/:id/status
// Accept or reject an appointment request
router.patch("/:id/status", async (req, res) => {
  try {
    if (req.user.role !== "dietitian") {
      return res.status(403).json({
        message: "Dietitian access required",
      });
    }

    const { status } = req.body;

    if (!["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be confirmed or rejected",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (String(appointment.dietitian) !== String(req.user.id)) {
      return res.status(403).json({
        message: "You cannot manage this appointment",
      });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({
        message: "Only pending appointments can be updated",
      });
    }

    if (status === "confirmed") {
      if (appointment.date <= new Date()) {
        return res.status(400).json({
          message: "Cannot confirm a past appointment",
        });
      }

      const conflict = await Appointment.findOne({
        _id: { $ne: appointment._id },
        dietitian: appointment.dietitian,
        date: appointment.date,
        status: "confirmed",
      });

      if (conflict) {
        return res.status(409).json({
          message: "This time slot is already confirmed",
        });
      }
    }

    appointment.status = status;
    await appointment.save();

    res.json({
      message: `Appointment ${status}`,
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update appointment",
    });
  }
});

module.exports = router;
