
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getToken } from "../utils/auth";

const API_URL = "http://localhost:5000";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700";

function Profile() {
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    age: "",
    height: "",
    weight: "",
    gender: "",
    activityLevel: "",
    dailyCalorieGoal: 2000,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(
          `${API_URL}/api/profile`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await response.json();

        setProfile(data);

        setForm({
          age: data.age ?? "",
          height: data.height ?? "",
          weight: data.weight ?? "",
          gender: data.gender ?? "",
          activityLevel: data.activityLevel ?? "",
          dailyCalorieGoal: data.dailyCalorieGoal ?? 2000,
        });
      } catch (err) {
        setError(err.message || "Cannot load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const updates = {
        age: form.age === "" ? null : Number(form.age),
        height: form.height === "" ? null : Number(form.height),
        weight: form.weight === "" ? null : Number(form.weight),
        gender: form.gender || null,
        activityLevel: form.activityLevel || null,
        dailyCalorieGoal: Number(form.dailyCalorieGoal),
      };

      const response = await fetch(
        `${API_URL}/api/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile = await response.json();

      setProfile(updatedProfile);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Cannot update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
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

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        {/* Page title */}
        <div className="mb-8">
          <span className="mb-3 inline-block rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            ACCOUNT SETTINGS
          </span>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            My Profile
          </h2>

          <p className="mt-3 text-slate-500">
            View and update your personal information
            and daily nutrition goal.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500 shadow-sm">
            Loading profile...
          </div>
        ) : !profile ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p role="alert" className="text-red-700">
              {error || "Profile not found"}
            </p>

            <Link
              to="/dashboard"
              className="mt-4 inline-block font-semibold text-emerald-700 underline"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Account information */}
            <aside className="lg:col-span-1">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
                  👤
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  {profile.name}
                </h3>

                <p className="mt-1 break-words text-sm text-slate-500">
                  {profile.email}
                </p>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Account Information
                  </p>

                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs text-slate-400">
                        Full Name
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {profile.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Email Address
                      </p>
                      <p className="mt-1 break-words font-medium text-slate-800">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Edit profile form */}
            <section className="lg:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-7">
                  <h3 className="text-xl font-bold text-slate-900">
                    Edit Profile
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Keep your personal details and calorie
                    goal up to date.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Personal details */}
                  <div>
                    <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-emerald-800">
                      Personal Details
                    </h4>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="age"
                          className={labelClass}
                        >
                          Age
                        </label>

                        <input
                          id="age"
                          type="number"
                          name="age"
                          min="1"
                          max="120"
                          value={form.age}
                          onChange={handleChange}
                          placeholder="e.g. 24"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="gender"
                          className={labelClass}
                        >
                          Gender
                        </label>

                        <select
                          id="gender"
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          className={inputClass}
                        >
                          <option value="">
                            Select gender
                          </option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="height"
                          className={labelClass}
                        >
                          Height (cm)
                        </label>

                        <input
                          id="height"
                          type="number"
                          name="height"
                          min="50"
                          max="250"
                          value={form.height}
                          onChange={handleChange}
                          placeholder="e.g. 175"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="weight"
                          className={labelClass}
                        >
                          Weight (kg)
                        </label>

                        <input
                          id="weight"
                          type="number"
                          name="weight"
                          min="1"
                          max="500"
                          step="0.1"
                          value={form.weight}
                          onChange={handleChange}
                          placeholder="e.g. 70"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-emerald-800">
                      Activity & Nutrition
                    </h4>

                    <div className="space-y-5">
                      <div>
                        <label
                          htmlFor="activityLevel"
                          className={labelClass}
                        >
                          Activity Level
                        </label>

                        <select
                          id="activityLevel"
                          name="activityLevel"
                          value={form.activityLevel}
                          onChange={handleChange}
                          className={inputClass}
                        >
                          <option value="">
                            Select activity level
                          </option>
                          <option value="sedentary">
                            Sedentary
                          </option>
                          <option value="lightly_active">
                            Lightly Active
                          </option>
                          <option value="moderately_active">
                            Moderately Active
                          </option>
                          <option value="very_active">
                            Very Active
                          </option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="dailyCalorieGoal"
                          className={labelClass}
                        >
                          Daily Calorie Goal (kcal)
                        </label>

                        <div className="relative">
                          <input
                            id="dailyCalorieGoal"
                            type="number"
                            name="dailyCalorieGoal"
                            min="500"
                            max="10000"
                            step="1"
                            required
                            value={form.dailyCalorieGoal}
                            onChange={handleChange}
                            className={`${inputClass} pr-20`}
                          />

                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                            kcal
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-400">
                          Set your preferred daily calorie target.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  {message && (
                    <div
                      role="status"
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                    >
                      ✓ {message}
                    </div>
                  )}

                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {error}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                    <Link
                      to="/dashboard"
                      className="rounded-xl border border-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Back to Dashboard
                    </Link>

                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-emerald-700 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-400">
        NutriTrack — Build healthy habits, one meal at a time.
      </footer>
    </div>
  );
}

export default Profile;
