
import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

function DailyMeals() {
  const [meals, setMeals] = useState([]);
  const [message, setMessage] = useState("");

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
      }
    };

    fetchMeals();
  }, []);

  const today = new Date().toDateString();

  const todayMeals = meals.filter((meal) => {
    const mealDate = meal.date || meal.createdAt;
    return mealDate && new Date(mealDate).toDateString() === today;
  });

  return (
    <div>
      <h2>Today's Meals</h2>

      {message && <p>{message}</p>}

      {todayMeals.length === 0 && !message ? (
        <p>No meals added today.</p>
      ) : (
        <ul>
          {todayMeals.map((meal) => (
            <li key={meal._id}>
              {meal.name} — {meal.mealType} — {meal.calories} kcal
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DailyMeals;
