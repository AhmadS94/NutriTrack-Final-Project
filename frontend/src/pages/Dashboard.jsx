
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f8f5",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h1 style={{ color: "#2e7d32" }}>
            🥗 NutriTrack
          </h1>

          <button onClick={handleLogout}>
            Logout
          </button>
        </header>

        {/* Welcome */}
        <section
          style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <h2>Welcome to your Dashboard!</h2>
          <p>
            Track your meals and monitor your daily
            nutrition.
          </p>
        </section>

        {/* Dashboard Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Calories Card */}
          <div
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "12px",
            }}
          >
            <h3>🔥 Daily Calories</h3>
            <p>
              Your calorie summary will appear here.
            </p>
            <Link to="/daily-meals">
              View Daily Meals
            </Link>
          </div>

          {/* Add Meal Card */}
          <div
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "12px",
            }}
          >
            <h3>🍽️ Add Meal</h3>
            <p>
              Record your meals and track calories.
            </p>
            <Link to="/add-meal">
              Add New Meal
            </Link>
          </div>

          {/* Appointments Card */}
          <div
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "12px",
            }}
          >
            <h3>📅 Appointments</h3>
            <p>
              Book appointments with dietitians.
            </p>
            <span style={{ color: "#777" }}>
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
