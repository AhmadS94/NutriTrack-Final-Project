
import { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed");
        setMessageType("error");
        return;
      }

      setMessage(
        `${
          role === "dietitian" ? "Dietitian" : "User"
        } account created successfully! You can now log in.`
      );
      setMessageType("success");

      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
    } catch (error) {
      setMessage("Cannot connect to server");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-emerald-50">
      {/* Left side */}
      <div className="relative hidden overflow-hidden bg-emerald-700 p-16 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl">
            🌿
          </div>
          <span className="text-2xl font-bold tracking-tight">
            NutriTrack
          </span>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 text-6xl">
            🥑
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight">
            Start your
            <br />
            healthy journey.
          </h1>

          <p className="text-lg leading-relaxed text-emerald-100">
            Create your account to track meals, monitor your
            daily calories, and connect with dietitians.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
              ✓ Set calorie goals
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
              ✓ Track your meals
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
              ✓ Connect with dietitians
            </span>
          </div>
        </div>

        <p className="relative z-10 text-sm text-emerald-200">
          © NutriTrack
        </p>

        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-600/60" />
        <div className="absolute -left-20 top-32 h-64 w-64 rounded-full bg-emerald-500/20" />
      </div>

      {/* Right side */}
      <div className="flex w-full items-center justify-center p-6 sm:p-10 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-xl text-white">
              🌿
            </div>
            <span className="text-2xl font-bold text-emerald-900">
              NutriTrack
            </span>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-white p-7 shadow-xl shadow-emerald-900/5 sm:p-10">
            <div className="mb-8">
              <span className="mb-4 inline-block rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                GET STARTED
              </span>

              <h2 className="mb-2 text-3xl font-bold text-slate-900">
                Create an account
              </h2>

              <p className="text-slate-500">
                Enter your details to join NutriTrack.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account type */}
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-slate-700">
                  Register as
                </legend>

                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                      role === "user"
                        ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                        : "border-slate-200 bg-slate-50 hover:border-emerald-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="user"
                      checked={role === "user"}
                      onChange={() => setRole("user")}
                      className="h-4 w-4 accent-emerald-700"
                    />

                    <span>
                      <span className="block text-sm font-bold text-slate-900">
                        👤 User
                      </span>
                      <span className="block text-xs text-slate-500">
                        Track meals
                      </span>
                    </span>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                      role === "dietitian"
                        ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                        : "border-slate-200 bg-slate-50 hover:border-emerald-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="dietitian"
                      checked={role === "dietitian"}
                      onChange={() => setRole("dietitian")}
                      className="h-4 w-4 accent-emerald-700"
                    />

                    <span>
                      <span className="block text-sm font-bold text-slate-900">
                        🩺 Dietitian
                      </span>
                      <span className="block text-xs text-slate-500">
                        Manage bookings
                      </span>
                    </span>
                  </label>
                </div>
              </fieldset>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
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
                    placeholder="Create a password"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-16 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
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

              {/* Success or error message */}
              {message && (
                <div
                  role={
                    messageType === "error"
                      ? "alert"
                      : "status"
                  }
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    messageType === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {message}

                  {messageType === "success" && (
                    <Link
                      to="/login"
                      className="mt-2 block font-semibold underline"
                    >
                      Go to Login
                    </Link>
                  )}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating account..."
                  : "Create account →"}
              </button>
            </form>

            {/* Login link */}
            <div className="mt-8 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <Link
            to="/login"
            className="mt-6 block text-center text-sm font-medium text-slate-500 transition hover:text-emerald-700"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
