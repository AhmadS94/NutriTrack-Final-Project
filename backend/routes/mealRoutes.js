const express = require("express");
const router = express.Router();

const Meal = require("../models/Meal");
const authMiddleware = require("../middleware/authMiddleware");

// All meal routes require authentication
router.use(authMiddleware);

// CREATE MEAL
// POST /api/meals
router.post("/", async (req, res) => {
  try {
    const { name, mealType, calories, date } = req.body;

    const meal = await Meal.create({
      user: req.user.id,
      name,
      mealType,
      calories,
      ...(date !== undefined ? { date } : {}),
    });

    res.status(201).json(meal);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid meal data",
      });
    }

    res.status(500).json({
      message: "Failed to create meal",
    });
  }
});

// GET ALL MEALS FOR LOGGED-IN USER
// GET /api/meals
router.get("/", async (req, res) => {
  try {
    const meals = await Meal.find({
      user: req.user.id,
    }).sort({ date: -1 });

    res.json(meals);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch meals",
    });
  }
});

// GET ONE MEAL
// GET /api/meals/:id
router.get("/:id", async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!meal) {
      return res.status(404).json({
        message: "Meal not found",
      });
    }

    res.json(meal);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid meal ID",
      });
    }

    res.status(500).json({
      message: "Failed to fetch meal",
    });
  }
});

// UPDATE MEAL
// PUT /api/meals/:id
router.put("/:id", async (req, res) => {
  try {
    const allowedFields = ["name", "mealType", "calories", "date"];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const meal = await Meal.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!meal) {
      return res.status(404).json({
        message: "Meal not found",
      });
    }

    res.json(meal);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid meal data or ID",
      });
    }

    res.status(500).json({
      message: "Failed to update meal",
    });
  }
});

// DELETE MEAL
// DELETE /api/meals/:id
router.delete("/:id", async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!meal) {
      return res.status(404).json({
        message: "Meal not found",
      });
    }

    res.json({
      message: "Meal deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid meal ID",
      });
    }

    res.status(500).json({
      message: "Failed to delete meal",
    });
  }
});

module.exports = router;
