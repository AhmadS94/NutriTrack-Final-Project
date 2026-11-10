
import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

function DailyMeals() {
  const [meals, setMeals] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingMealId, setEditingMealId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editMealType, setEditMealType] = useState("breakfast");
  const [editCalories, setEditCalories] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch meals from the backend
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/meals",
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to load meals");
          return;
        }

        setMeals(
          Array.isArray(data) ? data : data.meals || []
        );
      } catch (error) {
        setMessage("Cannot connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  // Delete a meal
  const handleDelete = async (mealId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this meal?"
    );

    if (!confirmed) return;

    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/meals/${mealId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        setMessage("Failed to delete meal");
        return;
      }

      setMeals((previousMeals) =>
        previousMeals.filter(
          (meal) => meal._id !== mealId
        )
      );

      if (editingMealId === mealId) {
        setEditingMealId(null);
      }
    } catch (error) {
      setMessage("Cannot connect to the server");
    }
  };

  // Start editing a meal
  const startEditing = (meal) => {
    setEditingMealId(meal._id);
    setEditName(meal.name);
    setEditMealType(meal.mealType);
    setEditCalories(String(meal.calories));
    setMessage("");
  };

  // Update a meal
  const handleUpdate = async (mealId) => {
    const calories = Number(editCalories);

    if (
      !editName.trim() ||
      editCalories.trim() === "" ||
      !Number.isFinite(calories) ||
      calories <= 0
    ) {
      setMessage(
        "Please enter a valid meal name and calories."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/meals/${mealId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            name: editName.trim(),
            mealType: editMealType,
            calories,
          }),
        }
      );

      if (!response.ok) {
        setMessage("Failed to update meal");
        return;
      }

      setMeals((previousMeals) =>
        previousMeals.map((meal) =>
          meal._id === mealId
            ? {
                ...meal,
                name: editName.trim(),
                mealType: editMealType,
                calories,
              }
            : meal
        )
      );

      setEditingMealId(null);
    } catch (error) {
      setMessage("Cannot connect to the server");
    } finally {
      setSaving(false);
    }
  };

  // Filter today's meals
  const today = new Date().toDateString();

  const todayMeals = meals.filter((meal) => {
    const mealDate = meal.date || meal.createdAt;

    return (
      mealDate &&
      new Date(mealDate).toDateString() === today
    );
  });

  // Calculate total calories for today
  const totalCalories = todayMeals.reduce(
    (total, meal) =>
      total + Number(meal.calories || 0),
    0
  );

  return (
    <div>
      <h2>Today's Meals</h2>

      {loading ? (
        <p>Loading meals...</p>
      ) : (
        <>
          {message && <p>{message}</p>}

          <h3>
            Total Calories Today: {totalCalories} kcal
          </h3>

          {todayMeals.length === 0 ? (
            <p>No meals added today.</p>
          ) : (
            <ul>
              {todayMeals.map((meal) => (
                <li key={meal._id}>
                  {editingMealId === meal._id ? (
                    <div>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) =>
                          setEditName(e.target.value)
                        }
                        placeholder="Meal name"
                      />

                      <select
                        value={editMealType}
                        onChange={(e) =>
                          setEditMealType(e.target.value)
                        }
                      >
                        <option value="breakfast">
                          Breakfast
                        </option>
                        <option value="lunch">
                          Lunch
                        </option>
                        <option value="dinner">
                          Dinner
                        </option>
                        <option value="snack">
                          Snack
                        </option>
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={editCalories}
                        onChange={(e) =>
                          setEditCalories(e.target.value)
                        }
                        placeholder="Calories"
                      />

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          handleUpdate(meal._id)
                        }
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          setEditingMealId(null)
                        }
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      {meal.name} — {meal.mealType} —{" "}
                      {meal.calories} kcal{" "}

                      <button
                        type="button"
                        onClick={() =>
                          startEditing(meal)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(meal._id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default DailyMeals;
