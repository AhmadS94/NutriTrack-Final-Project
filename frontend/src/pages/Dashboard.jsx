
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

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

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
