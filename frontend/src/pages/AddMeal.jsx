
import { useState } from "react";
import { getToken } from "../utils/auth";

function AddMeal() {
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [calories, setCalories] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name,
          mealType,
          calories: Number(calories),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to add meal");
        return;
      }

      setMessage("Meal added successfully!");
      setName("");
      setMealType("breakfast");
      setCalories("");
    } catch (error) {
      setMessage("Cannot connect to the server");
    }
  };

  return (
    <div>
      <h2>Add Meal</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Meal name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>

        <input
          type="number"
          placeholder="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          min="1"
          required
        />

        <button type="submit">Add Meal</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default AddMeal;
