
import { useState } from "react";
import { saveToken } from "../utils/auth";
import { Link, useNavigate } from "react-router-dom";


function Login() {
    const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      saveToken(data.token);
navigate("/dashboard", { replace: true });
      setPassword("");
      setMessage("Login successful!");
    } catch (error) {
      setMessage("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "400px", margin: "auto" }}>
      <h1 style={{ padding: "30px", Width: "300px", margin: "auto"}}>Login to NutriTrack</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}
      <p>
  Don't have an account? <Link to="/register">Register here</Link>
</p>
    </div>
  );
}

export default Login;
