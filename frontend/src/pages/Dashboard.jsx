
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken, logout } from "../utils/auth";

const API_URL = "http://localhost:5000";

function Dashboard() {
  const navigate = useNavigate();

  const [meals, setMeals] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [goalInput, setGoalInput] = useState("2000");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [goalMessage, setGoalMessage] = useState("");

  useEffect(() => {
    const savedGoal = Number(
      localStorage.getItem("nutritrack_daily_goal")
    );

    if (Number.isFinite(savedGoal) && savedGoal > 0) {
      setDailyGoal(savedGoal);
      setGoalInput(String(savedGoal));
    }

    const fetchMeals = async () => {
      try {
        const response = await fetch(`${API_URL}/api/meals`, {
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
          throw new Error(data.message || "Failed to load meals");
        }

        setMeals(
          Array.isArray(data) ? data : data.meals || []
        );
      } catch (err) {
        setError(err.message || "Cannot connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [navigate]);

  const today = new Date().toDateString();

  const todayMeals = meals.filter((meal) => {
    const mealDate = meal.date || meal.createdAt;

    return (
      mealDate &&
      new Date(mealDate).toDateString() === today
    );
  });

  const consumedCalories = todayMeals.reduce(
    (total, meal) => total + Number(meal.calories || 0),
    0
  );

  const remainingCalories = Math.max(
    dailyGoal - consumedCalories,
    0
  );

  const exceededCalories = Math.max(
    consumedCalories - dailyGoal,
    0
  );

  const actualPercentage = Math.round(
    (consumedCalories / dailyGoal) * 100
  );

  const progressPercentage = Math.min(
    (consumedCalories / dailyGoal) * 100,
    100
  );

  const handleSaveGoal = () => {
    const newGoal = Number(goalInput);

    if (!Number.isFinite(newGoal) || newGoal <= 0) {
      setGoalMessage("Please enter a valid calorie goal.");
      return;
    }

    setDailyGoal(newGoal);
    localStorage.setItem(
      "nutritrack_daily_goal",
      String(newGoal)
    );
    setGoalMessage("Your daily goal has been updated!");
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

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
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-2xl text-white">
              🌿
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-emerald-900">
                NutriTrack
              </h1>
              <p className="text-xs text-slate-500">
                Your nutrition companion
              </p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {/* Welcome */}
        <div className="mb-9">
          <span className="mb-3 inline-block rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            YOUR DAILY OVERVIEW
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Welcome to your Dashboard 👋
          </h2>

          <p className="mt-3 text-slate-500">
            Track your meals, monitor your calories, and
            stay on top of your nutrition goals.
          </p>

          <p className="mt-2 text-sm font-medium text-emerald-700">
            📅 {todayLabel}
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
            Loading your nutrition data...
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"
          >
            {error}
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="mb-8 grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
                  🍽️
                </div>

                <p className="text-sm font-medium text-slate-500">
                  Consumed Calories
                </p>

                <p className="mt-2 text-4xl font-bold text-slate-900">
                  {consumedCalories.toLocaleString()}
                  <span className="ml-2 text-base font-medium text-slate-400">
                    kcal
                  </span>
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  Calories eaten today
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                  🎯
                </div>

                <p className="text-sm font-medium text-slate-500">
                  Daily Calorie Goal
                </p>

                <p className="mt-2 text-4xl font-bold text-slate-900">
                  {dailyGoal.toLocaleString()}
                  <span className="ml-2 text-base font-medium text-slate-400">
                    kcal
                  </span>
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  Your daily target
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-2xl">
                  ⚡
                </div>

                <p className="text-sm font-medium text-slate-500">
                  Remaining Calories
                </p>

                <p className="mt-2 text-4xl font-bold text-emerald-700">
                  {remainingCalories.toLocaleString()}
                  <span className="ml-2 text-base font-medium text-slate-400">
                    kcal
                  </span>
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  Calories left for today
                </p>
              </div>
            </div>

            {/* Progress */}
            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Daily Calorie Progress
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Your progress toward today's goal
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
                  {actualPercentage}%
                </span>
              </div>

              <div
                className="h-4 w-full overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Daily calorie progress"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    exceededCalories > 0
                      ? "bg-red-500"
                      : "bg-emerald-600"
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-semibold text-slate-700">
                  {consumedCalories.toLocaleString()} /{" "}
                  {dailyGoal.toLocaleString()} kcal
                </span>

                <span className="text-slate-500">
                  {todayMeals.length} meals logged today
                </span>
              </div>

              {exceededCalories > 0 && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  You exceeded your daily goal by{" "}
                  {exceededCalories.toLocaleString()} kcal.
                </div>
              )}
            </section>
          </>
        )}

        {/* Daily goal */}
        <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-slate-900">
              Set Daily Calorie Goal
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Choose how many calories you want to consume
              each day.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                type="number"
                min="1"
                value={goalInput}
                onChange={(event) => {
                  setGoalInput(event.target.value);
                  setGoalMessage("");
                }}
                aria-label="Daily calorie goal"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-16 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                kcal
              </span>
            </div>

            <button
              onClick={handleSaveGoal}
              className="rounded-xl bg-emerald-700 px-7 py-3.5 font-semibold text-white transition hover:bg-emerald-800 focus:ring-4 focus:ring-emerald-100"
            >
              Save Goal
            </button>
          </div>

          {goalMessage && (
            <p
              role="status"
              className={`mt-4 text-sm font-medium ${
                goalMessage.startsWith("Please")
                  ? "text-red-600"
                  : "text-emerald-700"
              }`}
            >
              {goalMessage}
            </p>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <div className="mb-5">
            <h3 className="text-2xl font-bold text-slate-900">
              Quick Actions
            </h3>

            <p className="mt-1 text-slate-500">
              Everything you need to manage your nutrition.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <Link
              to="/add-meal"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
                🥗
              </div>

              <h4 className="text-lg font-bold text-slate-900">
                Add New Meal
              </h4>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Record what you ate and how many calories
                your meal contains.
              </p>

              <span className="mt-6 inline-block font-semibold text-emerald-700 group-hover:text-emerald-900">
                Add Meal →
              </span>
            </Link>

            <Link
              to="/daily-meals"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                📋
              </div>

              <h4 className="text-lg font-bold text-slate-900">
                Today's Meals
              </h4>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                View your meals and edit or delete entries
                when needed.
              </p>

              <span className="mt-6 inline-block font-semibold text-emerald-700 group-hover:text-emerald-900">
                View Meals →
              </span>
            </Link>

            <Link
              to="/appointments"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-3xl">
                📅
              </div>

              <h4 className="text-lg font-bold text-slate-900">
                Book Appointment
              </h4>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Choose a dietitian and request an appointment
                at a convenient time.
              </p>

              <span className="mt-6 inline-block font-semibold text-emerald-700 group-hover:text-emerald-900">
                Book Now →
              </span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-400">
        NutriTrack — Build healthy habits, one meal at a time.
      </footer>
    </div>
  );
}

export default Dashboard;
