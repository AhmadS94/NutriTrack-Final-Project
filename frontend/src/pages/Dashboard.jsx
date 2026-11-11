
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

  // Filter today's meals
  const today = new Date().toDateString();

  const todayMeals = meals.filter((meal) => {
    const mealDate = meal.date || meal.createdAt;

    return (
      mealDate &&
      new Date(mealDate).toDateString() === today
    );
  });

  // Calculate daily calories
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

  const progressPercentage = Math.min(
    (consumedCalories / dailyGoal) * 100,
    100
  );

  // Save daily calorie goal
  const handleSaveGoal = () => {
    const newGoal = Number(goalInput);

    if (!Number.isFinite(newGoal) || newGoal <= 0) {
      alert("Please enter a valid calorie goal.");
      return;
    }

    setDailyGoal(newGoal);

    localStorage.setItem(
      "nutritrack_daily_goal",
      String(newGoal)
    );
  };

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div>
      <h1>NutriTrack</h1>

      <button onClick={handleLogout}>Logout</button>

      <h2>Welcome to your Dashboard!</h2>

      <p>
        Track your daily meals, calories, and nutrition goals.
      </p>

      {loading ? (
        <p>Loading your nutrition data...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <h3>Consumed Calories</h3>
          <p>{consumedCalories} kcal</p>

          <h3>Daily Goal</h3>
          <p>{dailyGoal} kcal</p>

          <h3>Remaining Calories</h3>
          <p>{remainingCalories} kcal</p>

          {exceededCalories > 0 && (
            <p>
              You exceeded your goal by {exceededCalories} kcal.
            </p>
          )}

          <h3>Daily Calorie Progress</h3>

          <progress
            value={progressPercentage}
            max="100"
          />

          <p>
            {consumedCalories} / {dailyGoal} kcal
            {" — "}
            {Math.round(
              (consumedCalories / dailyGoal) * 100
            )}
            %
          </p>
        </>
      )}

      <h3>Set Daily Calorie Goal</h3>

      <input
        type="number"
        min="1"
        value={goalInput}
        onChange={(e) => setGoalInput(e.target.value)}
      />

      <button onClick={handleSaveGoal}>
        Save Goal
      </button>

      <hr />

      <h3>Add Meal</h3>
      <p>Record your meals and calories.</p>
      <Link to="/add-meal">Add New Meal</Link>

      <h3>Today's Meals</h3>
      <p>View, edit, and delete your meals.</p>
      <Link to="/daily-meals">View Daily Meals</Link>

      <h3>Appointments</h3>
      <p>Book appointments with dietitians.</p>
      <Link to="/appointments">
        Book Appointment
      </Link>
    </div>
  );
}

export default Dashboard;
