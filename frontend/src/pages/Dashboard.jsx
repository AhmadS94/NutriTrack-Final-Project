
import { logout } from "../utils/auth";
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Welcome to NutriTrack 🥗</h1>

      <p>The nutrition dashboard is coming soon!</p>
      <Link to="/profile">
  <button type="button">My Profile</button>
</Link>

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
