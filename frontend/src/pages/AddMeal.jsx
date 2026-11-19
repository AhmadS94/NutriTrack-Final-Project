
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken, logout } from "../utils/auth";

const API_URL = "http://localhost:5000/api/meals";
const AI_API_URL =
  "http://localhost:5000/api/ai/meal-suggestions";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

const mealEmojis = {
  breakfast: "🍳",
  lunch: "🥗",
  dinner: "🍲",
  snack: "🍎",
};

const mealLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

function AddMeal() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [calories, setCalories] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  // AI state
  const [suggestions, setSuggestions] = useState([]);
  const [nutritionTip, setNutritionTip] = useState("");
  const [nutritionSummary, setNutritionSummary] =
    useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const aiRequestRef = useRef(null);
  const requestIdRef = useRef(0);
  const formRef = useRef(null);

  const handleUnauthorized = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [navigate]);

  const fetchSuggestions = useCallback(async () => {
    // Cancel the previous AI request, if any.
    if (aiRequestRef.current) {
      aiRequestRef.current.abort();
    }

    const controller = new AbortController();
    aiRequestRef.current = controller;

    const requestId = ++requestIdRef.current;

    setAiLoading(true);
    setAiError("");

    try {
      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(AI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timezoneOffset: new Date().getTimezoneOffset(),
        }),
        signal: controller.signal,
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to generate AI suggestions"
        );
      }

      // Ignore results from outdated requests.
      if (requestId !== requestIdRef.current) {
        return;
      }

      setSuggestions(
        Array.isArray(data.suggestions)
          ? data.suggestions
          : []
      );

      setNutritionTip(
        typeof data.tip === "string" ? data.tip : ""
      );

      setNutritionSummary(data.summary || null);
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      if (requestId !== requestIdRef.current) {
        return;
      }

      setAiError(
        error.message ||
          "Cannot connect to the AI service. Please try again."
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setAiLoading(false);
        aiRequestRef.current = null;
      }
    }
  }, [handleUnauthorized]);

  // Load AI suggestions when the page opens.
  useEffect(() => {
    fetchSuggestions();

    return () => {
      requestIdRef.current += 1;

      if (aiRequestRef.current) {
        aiRequestRef.current.abort();
      }
    };
  }, [fetchSuggestions]);

  const handleUseSuggestion = (suggestion) => {
    setName(suggestion.name);
    setMealType(suggestion.mealType);
    setCalories(String(suggestion.estimatedCalories));

    setMessage(
      "Suggestion added to the form. Review the calories and save when ready."
    );
    setMessageType("success");

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    const calorieValue = Number(calories);

    if (
      !name.trim() ||
      calories === "" ||
      !Number.isFinite(calorieValue) ||
      calorieValue <= 0
    ) {
      setMessage(
        "Please enter a valid meal name and calories."
      );
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          mealType,
          calories: calorieValue,
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add meal");
      }

      setMessage("Meal added successfully!");
      setMessageType("success");

      setName("");
      setMealType("breakfast");
      setCalories("");

      // Refresh suggestions using the newly saved meal.
      fetchSuggestions();
    } catch (error) {
      setMessage(
        error.message || "Cannot connect to the server"
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >
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

      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        {/* Page heading */}
        <div className="mb-8">
          <span className="mb-3 inline-block rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            MEAL TRACKER
          </span>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Add New Meal 🥗
          </h2>

          <p className="mt-3 text-slate-500">
            Record what you ate and track your daily calories.
          </p>
        </div>

        {/* Meal form */}
        <section
          ref={formRef}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-7">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
              🍽️
            </div>

            <h3 className="text-xl font-bold">
              Meal Details
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Fill in the information below to add your meal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Meal name */}
            <div>
              <label
                htmlFor="mealName"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Meal Name
              </label>

              <input
                id="mealName"
                type="text"
                placeholder="e.g. Hamburger, Eggs, Chicken Salad"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
                className={inputClass}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Meal type */}
              <div>
                <label
                  htmlFor="mealType"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Meal Type
                </label>

                <select
                  id="mealType"
                  value={mealType}
                  onChange={(event) =>
                    setMealType(event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="breakfast">
                    Breakfast
                  </option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              {/* Calories */}
              <div>
                <label
                  htmlFor="calories"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Calories
                </label>

                <div className="relative">
                  <input
                    id="calories"
                    type="number"
                    placeholder="e.g. 300"
                    value={calories}
                    onChange={(event) =>
                      setCalories(event.target.value)
                    }
                    min="1"
                    required
                    className={`${inputClass} pr-20`}
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            {message && (
              <div
                role={
                  messageType === "error"
                    ? "alert"
                    : "status"
                }
                className={`rounded-xl border px-5 py-4 text-sm font-medium ${
                  messageType === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-emerald-700 px-7 py-3.5 font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Adding Meal..."
                  : "+ Add Meal"}
              </button>

              <Link
                to="/daily-meals"
                className="rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View Daily Meals
              </Link>
            </div>
          </form>
        </section>

        {/* AI Meal Suggestions */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-emerald-700 to-teal-700 p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wide">
                  POWERED BY OLLAMA
                </span>

                <h3 className="text-2xl font-bold">
                  ✨ AI Meal Suggestions
                </h3>

                <p className="mt-2 max-w-xl text-sm text-emerald-50">
                  Personalized meal ideas based on what
                  you've eaten today.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchSuggestions}
                disabled={aiLoading}
                className="rounded-xl border border-white/40 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {aiLoading
                  ? "Generating..."
                  : "↻ Refresh Suggestions"}
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Daily nutrition summary */}
            {nutritionSummary && (
              <div className="mb-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Consumed Today
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {nutritionSummary.consumedCalories}
                    <span className="ml-1 text-sm font-normal text-slate-500">
                      kcal
                    </span>
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Daily Goal
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {nutritionSummary.dailyCalorieGoal ??
                      "Not set"}
                    {nutritionSummary.dailyCalorieGoal !==
                      null &&
                      nutritionSummary.dailyCalorieGoal !==
                        undefined && (
                        <span className="ml-1 text-sm font-normal text-slate-500">
                          kcal
                        </span>
                      )}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs font-medium text-emerald-700">
                    Remaining
                  </p>
                  <p className="mt-1 text-xl font-bold text-emerald-900">
                    {nutritionSummary.remainingCalories ??
                      "Unknown"}
                    {nutritionSummary.remainingCalories !==
                      null &&
                      nutritionSummary.remainingCalories !==
                        undefined && (
                        <span className="ml-1 text-sm font-normal text-emerald-700">
                          kcal
                        </span>
                      )}
                  </p>
                </div>
              </div>
            )}

            {/* Loading */}
            {aiLoading && (
              <div
                role="status"
                className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-6 text-center"
              >
                <div className="mb-2 text-3xl">🤖</div>
                <p className="font-semibold text-emerald-900">
                  AI is preparing your meal suggestions...
                </p>
                <p className="mt-1 text-sm text-emerald-700">
                  Your local AI model may take a little
                  time to respond.
                </p>
              </div>
            )}

            {/* Error */}
            {aiError && !aiLoading && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-5"
              >
                <p className="font-semibold text-red-800">
                  Could not load AI suggestions
                </p>
                <p className="mt-1 text-sm text-red-700">
                  {aiError}
                </p>

                <button
                  type="button"
                  onClick={fetchSuggestions}
                  className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Suggestions */}
            {!aiLoading &&
              !aiError &&
              suggestions.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {suggestions.map((suggestion, index) => (
                    <article
                      key={`${suggestion.mealType}-${index}`}
                      className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
                          {mealEmojis[
                            suggestion.mealType
                          ] || "🍽️"}
                        </div>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800">
                          {mealLabels[
                            suggestion.mealType
                          ] || "Meal"}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-slate-900">
                        {suggestion.name}
                      </h4>

                      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                        {suggestion.description}
                      </p>

                      <div className="mt-5 border-t border-slate-200 pt-4">
                        <p className="mb-3 font-bold text-emerald-800">
                          ≈ {suggestion.estimatedCalories} kcal
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            handleUseSuggestion(suggestion)
                          }
                          className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                        >
                          + Use This Suggestion
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

            {/* No suggestions */}
            {!aiLoading &&
              !aiError &&
              suggestions.length === 0 && (
                <div className="rounded-xl bg-slate-50 p-5 text-center">
                  <div className="mb-2 text-3xl">🌿</div>
                  <p className="font-semibold text-slate-800">
                    No additional meal suggestions right
                    now.
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    You can still add any meal using the
                    form above.
                  </p>
                </div>
              )}

            {/* Nutrition tip */}
            {!aiLoading &&
              !aiError &&
              nutritionTip && (
                <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-5">
                  <p className="mb-1 text-sm font-bold text-amber-900">
                    💡 Nutrition Tip
                  </p>
                  <p className="text-sm leading-6 text-amber-900">
                    {nutritionTip}
                  </p>
                </div>
              )}

            <p className="mt-5 text-xs leading-5 text-slate-400">
              AI-generated suggestions are general
              nutrition ideas. Calorie estimates may vary
              depending on ingredients and portion sizes.
            </p>
          </div>
        </section>

        {/* Quick navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="font-semibold text-emerald-700 hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <Link
            to="/daily-meals"
            className="font-semibold text-emerald-700 hover:underline"
          >
            View Today's Meals →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-400">
        NutriTrack — Build healthy habits, one meal at a time.
      </footer>
    </div>
  );
}

export default AddMeal;
