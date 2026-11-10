
import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

function DailyMeals() {
  const [meals, setMeals] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/meals", {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to load meals");
          return;
        }

        setMeals(Array.isArray(data) ? data : data.meals || []);
      } catch (error) {
        setMessage("Cannot connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  // Get today's date
  const today = new Date().toDateString();

  // Filter meals added today
  const todayMeals = meals.filter((meal) => {
    const mealDate = meal.date || meal.createdAt;

    return (
      mealDate &&
      new Date(mealDate).toDateString() === today
    );
  });

  // Calculate total daily calories
  const totalCalories = todayMeals.reduce(
    (total, meal) => total + Number(meal.calories || 0),
    0
  );

  return (
    <div>
      <h2>Today's Meals</h2>

      {loading ? (
        <p>Loading meals...</p>
      ) : message ? (
        <p>{message}</p>
      ) : (
        <>
          <h3>
            Total Calories Today: {totalCalories} kcal
          </h3>

          {todayMeals.length === 0 ? (
            <p>No meals added today.</p>
          ) : (
            <ul>
              {todayMeals.map((meal) => (
                <li key={meal._id}>
                  {meal.name} — {meal.mealType} —{" "}
                  {meal.calories} kcal
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
