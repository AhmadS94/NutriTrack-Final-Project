
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken, logout } from "../utils/auth";

const API_URL = "http://localhost:5000/api/appointments";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

function DietitianAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Logout and redirect to login
  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  // Load dietitian appointments
  async function loadAppointments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/dietitian`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load appointments"
        );
      }

      setAppointments(data);
    } catch (err) {
      setError(err.message || "Cannot load appointments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  // Confirm or reject an appointment
  async function updateStatus(appointmentId, status) {
    try {
      setUpdatingId(appointmentId);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update appointment"
        );
      }

      setMessage(`Appointment ${status} successfully!`);
      await loadAppointments();
    } catch (err) {
      setError(err.message || "Cannot update appointment");
    } finally {
      setUpdatingId(null);
    }
  }

  const pendingCount = appointments.filter(
    (appointment) => appointment.status === "pending"
  ).length;

  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === "confirmed"
  ).length;

  const rejectedCount = appointments.filter(
    (appointment) => appointment.status === "rejected"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">

          {/* Logo - no dashboard link */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-2xl text-white">
              🌿
            </div>

            <div>
              <h1 className="text-xl font-bold text-emerald-900">
                NutriTrack
              </h1>

              <p className="text-xs text-slate-500">
                Dietitian Portal
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap items-center gap-3">

            {/* Clinic Location Button */}
            <Link
              to="/dietitian/location"
              className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              📍 Set Clinic Location
            </Link>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              Logout →
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {/* Page Title */}
        <div className="mb-9">
          <span className="mb-3 inline-block rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            DIETITIAN PORTAL
          </span>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Appointment Requests 📅
          </h2>

          <p className="mt-3 text-slate-500">
            Review appointment requests from users and
            confirm or reject them.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">

          {/* Pending */}
          <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <div className="mb-3 text-2xl">⏳</div>

            <p className="text-sm font-medium text-slate-500">
              Pending Requests
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-700">
              {pendingCount}
            </p>
          </div>

          {/* Confirmed */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="mb-3 text-2xl">✅</div>

            <p className="text-sm font-medium text-slate-500">
              Confirmed Appointments
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {confirmedCount}
            </p>
          </div>

          {/* Rejected */}
          <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
            <div className="mb-3 text-2xl">❌</div>

            <p className="text-sm font-medium text-slate-500">
              Rejected Requests
            </p>

            <p className="mt-2 text-3xl font-bold text-red-700">
              {rejectedCount}
            </p>
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800"
          >
            ✓ {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Appointment List */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              All Appointment Requests
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Manage your incoming appointment requests.
            </p>
          </div>

          {loading ? (
            <p className="py-10 text-center text-slate-500">
              Loading appointments...
            </p>
          ) : appointments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <div className="mb-4 text-5xl">📭</div>

              <h4 className="text-lg font-bold text-slate-800">
                No appointment requests yet
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                When a user books an appointment with you,
                it will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {appointments.map((appointment) => (
                <article
                  key={appointment._id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-emerald-200 hover:shadow-sm sm:p-6"
                >
                  {/* User Details */}
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-xl">
                        👤
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900">
                          {appointment.user?.name ||
                            "Unknown User"}
                        </h4>

                        <p className="mt-0.5 break-all text-sm text-slate-500">
                          {appointment.user?.email || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${
                        statusStyles[appointment.status] ||
                        "border-slate-200 bg-slate-100 text-slate-700"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  {/* Appointment Date */}
                  <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Appointment Date & Time
                    </p>

                    <p className="mt-2 font-semibold text-slate-800">
                      📅{" "}
                      {new Date(
                        appointment.date
                      ).toLocaleString()}
                    </p>
                  </div>

                  {/* Confirm / Reject */}
                  {appointment.status === "pending" ? (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(
                            appointment._id,
                            "confirmed"
                          )
                        }
                        disabled={
                          updatingId === appointment._id
                        }
                        className="flex-1 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updatingId === appointment._id
                          ? "Updating..."
                          : "✓ Confirm"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(
                            appointment._id,
                            "rejected"
                          )
                        }
                        disabled={
                          updatingId === appointment._id
                        }
                        className="flex-1 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-slate-500">
                      This appointment has been{" "}
                      {appointment.status}.
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-400">
        NutriTrack — Dietitian Appointment Management
      </footer>
    </div>
  );
}

export default DietitianAppointments;
