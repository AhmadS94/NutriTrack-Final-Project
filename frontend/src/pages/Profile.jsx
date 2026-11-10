
import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

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
          "http://localhost:5000/api/profile",
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
        setError(err.message);
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
        "http://localhost:5000/api/profile",
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
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!profile) {
    return <p>{error || "Profile not found"}</p>;
  }

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto" }}>
      <h1>My Profile</h1>

      <p>
        <strong>Name:</strong> {profile.name}
      </p>

      <p>
        <strong>Email:</strong> {profile.email}
      </p>

      <h2>Edit Profile</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            name="age"
            min="1"
            max="120"
            value={form.age}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="height">Height (cm)</label>
          <input
            id="height"
            type="number"
            name="height"
            min="50"
            max="250"
            value={form.height}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="weight">Weight (kg)</label>
          <input
            id="weight"
            type="number"
            name="weight"
            min="1"
            max="500"
            step="0.1"
            value={form.weight}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="activityLevel">
            Activity Level
          </label>
          <select
            id="activityLevel"
            name="activityLevel"
            value={form.activityLevel}
            onChange={handleChange}
          >
            <option value="">Select activity level</option>
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
          <label htmlFor="dailyCalorieGoal">
            Daily Calorie Goal (kcal)
          </label>
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
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>

      {message && (
        <p style={{ color: "green" }}>{message}</p>
      )}

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}
    </div>
  );
}

export default Profile;
