
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken, logout } from "../utils/auth";

const API_URL = "http://localhost:5000/api/meals";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

const mealIcons = {
  breakfast: "🍳",
  lunch: "🥗",
  dinner: "🍽️",
  snack: "🍎",
};

function DailyMeals() {
  const navigate = useNavigate();

  const [meals, setMeals] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingMealId, setEditingMealId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editMealType, setEditMealType] = useState("breakfast");
  const [editCalories, setEditCalories] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        if (response.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

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
  }, [navigate]);

  const handleDelete = async (mealId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this meal?"
    );

    if (!confirmed) return;

    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${mealId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (response.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        setMessage("Failed to delete meal");
        return;
      }

      setMeals((previousMeals) =>
        previousMeals.filter((meal) => meal._id !== mealId)
      );

      if (editingMealId === mealId) {
        setEditingMealId(null);
      }

      setMessage("Meal deleted successfully.");
    } catch (error) {
      setMessage("Cannot connect to the server");
    }
  };

  const startEditing = (meal) => {
    setEditingMealId(meal._id);
    setEditName(meal.name);
    setEditMealType(meal.mealType);
    setEditCalories(String(meal.calories));
    setMessage("");
  };

  const handleUpdate = async (mealId) => {
    const calories = Number(editCalories);

    if (
      !editName.trim() ||
      editCalories.trim() === "" ||
      !Number.isFinite(calories) ||
      calories <= 0
    ) {
      setMessage("Please enter a valid meal name and calories.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${mealId}`, {
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
      });

      if (response.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

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
      setMessage("Meal updated successfully.");
    } catch (error) {
      setMessage("Cannot connect to the server");
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toDateString();

  const todayMeals = meals.filter((meal) => {
    const mealDate = meal.date || meal.createdAt;

    return (
      mealDate &&
      new Date(mealDate).toDateString() === today
    );
  });

  const totalCalories = todayMeals.reduce(
    (total, meal) => total + Number(meal.calories || 0),
    0
  );

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-2xl text-white">
              🌿
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-900">
                NutriTrack
              </h1>
              <p className="text-xs text-slate-500">
                Your nutrition companion
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        {/* Page title */}
        <div className="mb-8">
          <span className="mb-3 inline-block rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            MEAL TRACKER
          </span>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Today's Meals 🍽️
          </h2>

          <p className="mt-3 text-slate-500">
            View, edit, and manage everything you have eaten today.
          </p>

          <p className="mt-2 text-sm font-medium text-emerald-700">
            📅 {todayLabel}
          </p>
        </div>

        {/* Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">🔥</div>
            <p className="text-sm font-medium text-slate-500">
              Total Calories Today
            </p>
            <p className="mt-2 text-4xl font-bold text-emerald-700">
              {totalCalories.toLocaleString()}
              <span className="ml-2 text-base font-medium text-slate-400">
                kcal
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">📋</div>
            <p className="text-sm font-medium text-slate-500">
              Meals Logged Today
            </p>
            <p className="mt-2 text-4xl font-bold text-slate-900">
              {todayMeals.length}
            </p>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700"
          >
            {message}
          </div>
        )}

        {/* Meals section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">
                Meal History
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Your meals for today
              </p>
            </div>

            <Link
              to="/add-meal"
              className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              + Add New Meal
            </Link>
          </div>

          {loading ? (
            <p className="py-10 text-center text-slate-500">
              Loading meals...
            </p>
          ) : todayMeals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <div className="mb-4 text-5xl">🥗</div>
              <h4 className="text-lg font-bold">
                No meals added today
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                Start tracking your nutrition by adding your first meal.
              </p>
              <Link
                to="/add-meal"
                className="mt-5 inline-block font-semibold text-emerald-700 hover:underline"
              >
                Add a meal →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {todayMeals.map((meal) => (
                <article
                  key={meal._id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6"
                >
                  {editingMealId === meal._id ? (
                    <div className="space-y-4">
                      <h4 className="font-bold text-emerald-800">
                        Edit Meal
                      </h4>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Meal Name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Meal name"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Meal Type
                          </label>
                          <select
                            value={editMealType}
                            onChange={(e) => setEditMealType(e.target.value)}
                            className={inputClass}
                          >
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                            <option value="snack">Snack</option>
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Calories
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={editCalories}
                            onChange={(e) => setEditCalories(e.target.value)}
                            placeholder="Calories"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => handleUpdate(meal._id)}
                          className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => setEditingMealId(null)}
                          className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
                          {mealIcons[meal.mealType] || "🍽️"}
                        </div>

                        <div>
                          <h4 className="text-lg font-bold text-slate-900">
                            {meal.name}
                          </h4>
                          <p className="mt-1 text-sm capitalize text-slate-500">
                            {meal.mealType}
                          </p>
                          <p className="mt-1 font-semibold text-emerald-700">
                            {Number(meal.calories).toLocaleString()} kcal
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => startEditing(meal)}
                          className="rounded-xl border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(meal._id)}
                          className="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-block font-semibold text-emerald-700 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-400">
        NutriTrack — Build healthy habits, one meal at a time.
      </footer>
    </div>
  );
}

export default DailyMeals;
