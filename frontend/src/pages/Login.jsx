
import { useState } from "react";
import { saveToken } from "../utils/auth";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      // Save authentication token
      saveToken(data.token);

      // Clear password
      setPassword("");

      // Redirect based on user role
      if (data.user?.role === "dietitian") {
        navigate("/dietitian/appointments", {
          replace: true,
        });
      } else {
        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch (error) {
      setMessage("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-700 text-white p-16 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
              🌿
            </div>

            <span className="text-2xl font-bold tracking-tight">
              NutriTrack
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="mb-8 w-24 h-24 rounded-3xl bg-white/15 flex items-center justify-center text-6xl">
            🥗
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6">
            Your health,
            <br />
            your journey.
          </h1>

          <p className="text-emerald-100 text-lg leading-relaxed">
            Track your meals, reach your daily calorie goals,
            and connect with dietitians — all in one place.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
              ✓ Track calories
            </span>

            <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
              ✓ Manage meals
            </span>

            <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
              ✓ Book dietitians
            </span>
          </div>
        </div>

        <p className="relative z-10 text-sm text-emerald-200">
          © NutriTrack
        </p>

        <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-emerald-600/60" />
        <div className="absolute -left-20 top-32 w-64 h-64 rounded-full bg-emerald-500/20" />
      </div>

      {/* Right side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-xl">
              🌿
            </div>

            <span className="text-2xl font-bold text-emerald-900">
              NutriTrack
            </span>
          </div>

          {/* Login card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-100 p-7 sm:p-10">
            <div className="mb-8">
              <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                WELCOME BACK
              </span>

              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Sign in
              </h2>

              <p className="text-slate-500">
                Enter your details to access your account.
              </p>
            </div>

            {/* Login form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-16 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {message && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {message}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Sign in →"}
              </button>
            </form>

            {/* Register link */}
            <div className="mt-8 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Build healthy habits, one meal at a time.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
