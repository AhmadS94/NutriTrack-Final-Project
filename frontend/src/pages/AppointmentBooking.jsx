
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { getToken, logout } from "../utils/auth";

const API_URL = "http://localhost:5000/api/appointments";

const DUSSELDORF_CENTER = [51.2277, 6.7735];

const statusStyles = {
  pending: "border-amber-200 bg-amber-100 text-amber-800",
  confirmed: "border-emerald-200 bg-emerald-100 text-emerald-800",
  rejected: "border-red-200 bg-red-100 text-red-800",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

// Blue marker for user's location
const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: #2563eb;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 10px #0004;
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Green marker for dietitian clinics
const clinicIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #047857;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 10px #0004;
      font-size: 17px;
    ">🏥</div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// Calculate straight-line distance in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371;

  const toRadians = (degrees) =>
    (degrees * Math.PI) / 180;

  const latitudeDifference = toRadians(lat2 - lat1);
  const longitudeDifference = toRadians(lon2 - lon1);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(Math.max(0, 1 - a))
    );

  return earthRadius * c;
}

// Validate clinic coordinates
function getValidLocation(dietitian) {
  const location = dietitian.location;

  if (!location) return null;

  const { latitude, longitude } = location;

  if (
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !== "number" ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return location;
}

// Focus the map on user's current location
function MapFocus({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 12);
    }
  }, [map, position]);

  return null;
}

function AppointmentBooking() {
  const navigate = useNavigate();

  const [dietitians, setDietitians] = useState([]);
  const [dietitianId, setDietitianId] = useState("");
  const [date, setDate] = useState("");
  const [appointments, setAppointments] = useState([]);

  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Handle expired or invalid authentication
  function handleUnauthorized(response) {
    if (response.status === 401) {
      logout();
      navigate("/login", { replace: true });
      return true;
    }

    return false;
  }

  // Prevent HTML responses from causing JSON errors
  async function readJsonResponse(response) {
    const contentType =
      response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      throw new Error(
        `Server returned an unexpected response (${response.status}).`
      );
    }

    return response.json();
  }

  // Load available dietitians
  async function loadDietitians() {
    const response = await fetch(
      `${API_URL}/dietitians`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    if (handleUnauthorized(response)) return;

    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to load dietitians"
      );
    }

    setDietitians(Array.isArray(data) ? data : []);
  }

  // Load user's appointments
  async function loadAppointments() {
    const response = await fetch(`${API_URL}/my`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (handleUnauthorized(response)) return;

    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to load appointments"
      );
    }

    setAppointments(Array.isArray(data) ? data : []);
  }

  // Load data when the page opens
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);

        await Promise.all([
          loadDietitians(),
          loadAppointments(),
        ]);
      } catch (error) {
        setMessage(
          error.message || "Cannot connect to server"
        );
        setMessageType("error");
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, []);

  // Get current location only after button click
  function useCurrentLocation() {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Your browser does not support geolocation."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setUserLocation([latitude, longitude]);
        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);

        if (error.code === 1) {
          setLocationError(
            "Location permission was denied. Please allow location access in your browser settings."
          );
        } else if (error.code === 2) {
          setLocationError(
            "Your location is unavailable. Please check your device location settings."
          );
        } else if (error.code === 3) {
          setLocationError(
            "Location request timed out. Please try again."
          );
        } else {
          setLocationError(
            "Could not get your current location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }

  // Sort dietitians from nearest to farthest
  const sortedDietitians = useMemo(() => {
    const result = dietitians.map((dietitian) => {
      const location = getValidLocation(dietitian);

      const distance =
        userLocation && location
          ? calculateDistance(
              userLocation[0],
              userLocation[1],
              location.latitude,
              location.longitude
            )
          : null;

      return {
        ...dietitian,
        location,
        distance,
      };
    });

    if (userLocation) {
      result.sort((a, b) => {
        if (a.distance === null && b.distance === null) {
          return 0;
        }

        if (a.distance === null) return 1;
        if (b.distance === null) return -1;

        return a.distance - b.distance;
      });
    }

    return result;
  }, [dietitians, userLocation]);

  // Only clinics with valid coordinates appear on map
  const clinicsOnMap = sortedDietitians.filter(
    (dietitian) => dietitian.location !== null
  );

  // Select dietitian and scroll to booking form
  function chooseDietitian(id) {
    setDietitianId(id);

    document
      .getElementById("booking-form")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  // Request appointment
  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!dietitianId || !date) {
      setMessage(
        "Please select a dietitian and appointment date."
      );
      setMessageType("error");
      return;
    }

    const selectedDate = new Date(date);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate <= new Date()
    ) {
      setMessage(
        "Please select a future date and time."
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
          dietitianId,
          date: selectedDate.toISOString(),
        }),
      });

      if (handleUnauthorized(response)) return;

      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Booking failed"
        );
      }

      setMessage(
        "Appointment requested successfully!"
      );
      setMessageType("success");

      setDietitianId("");
      setDate("");

      await loadAppointments();
    } catch (error) {
      setMessage(
        error.message || "Cannot connect to server"
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  const pendingCount = appointments.filter(
    (appointment) => appointment.status === "pending"
  ).length;

  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === "confirmed"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
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

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {/* Page Title */}
        <div className="mb-9">
          <span className="mb-3 inline-block rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            DIETITIAN BOOKING
          </span>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Find Your Nearest Dietitian 🗺️
          </h2>

          <p className="mt-3 text-slate-500">
            Find nearby dietitians, explore clinic
            locations, and book an appointment.
          </p>
        </div>

        {/* Appointment Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-2xl">📋</div>

            <p className="text-sm font-medium text-slate-500">
              Total Appointments
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {appointments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <div className="mb-3 text-2xl">⏳</div>

            <p className="text-sm font-medium text-slate-500">
              Pending Requests
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-700">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="mb-3 text-2xl">✅</div>

            <p className="text-sm font-medium text-slate-500">
              Confirmed Appointments
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {confirmedCount}
            </p>
          </div>
        </div>

        {/* Current Location Map */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">
                📍 Find Dietitians Near You
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Click "Use My Current Location" to find
                nearby dietitians.
              </p>
            </div>

            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locationLoading}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {locationLoading
                ? "Finding location..."
                : "📍 Use My Current Location"}
            </button>
          </div>

          {locationError && (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {locationError}
            </p>
          )}

          {userLocation && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-blue-50 px-4 py-3">
              <p className="text-sm font-medium text-blue-800">
                ✓ Your current location is selected
              </p>

              <button
                type="button"
                onClick={() => setUserLocation(null)}
                className="text-sm font-semibold text-blue-700 hover:underline"
              >
                Clear Location
              </button>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <MapContainer
  center={DUSSELDORF_CENTER}
  zoom={12}
  scrollWheelZoom={true}
  style={{
    height: "420px",
    width: "100%",
  }}
>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapFocus position={userLocation} />

              {/* User location */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={userIcon}
                >
                  <Popup>
                    <strong>Your Current Location</strong>
                  </Popup>
                </Marker>
              )}

              {/* Dietitian clinic locations */}
              {clinicsOnMap.map((dietitian) => (
                <Marker
                  key={dietitian._id}
                  position={[
                    dietitian.location.latitude,
                    dietitian.location.longitude,
                  ]}
                  icon={clinicIcon}
                >
                  <Popup>
                    <div>
                      <strong>
                        {dietitian.name}
                      </strong>

                      <p>
                        {dietitian.location.address ||
                          "Clinic location"}
                      </p>

                      {dietitian.distance !== null && (
                        <p>
                          Distance:{" "}
                          {dietitian.distance.toFixed(1)} km
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          chooseDietitian(dietitian._id)
                        }
                        style={{
                          background: "#047857",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          cursor: "pointer",
                        }}
                      >
                        Book Appointment
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            🔵 Blue marker: Your location. 🏥 Green
            markers: Dietitian clinics. Distances are
            straight-line estimates, not driving distances.
          </p>

        
        </section>

        {/* Nearby Dietitians */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold">
              🥗 Available Dietitians
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {userLocation
                ? "Sorted from nearest to farthest."
                : "Use your current location to sort dietitians by distance."}
            </p>
          </div>

          {loadingData ? (
            <p className="py-8 text-center text-slate-500">
              Loading dietitians...
            </p>
          ) : sortedDietitians.length === 0 ? (
            <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              No dietitians are available at the moment.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedDietitians.map((dietitian) => (
                <div
                  key={dietitian._id}
                  className={`rounded-2xl border p-5 transition ${
                    dietitianId === dietitian._id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        👩‍⚕️ {dietitian.name}
                      </h4>

                      <p className="mt-1 break-all text-sm text-slate-500">
                        {dietitian.email}
                      </p>
                    </div>

                    {dietitian.distance !== null && (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
                        📍 {dietitian.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>

                  <p className="mb-4 text-sm text-slate-600">
                    {dietitian.location
                      ? dietitian.location.address ||
                        "Clinic location available on map"
                      : "Clinic location not added yet"}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      chooseDietitian(dietitian._id)
                    }
                    className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                  >
                    {dietitianId === dietitian._id
                      ? "✓ Selected"
                      : "Book Appointment →"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Booking Form */}
        <section
          id="booking-form"
          className="mb-8 scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold">
              Request a New Appointment
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Choose a dietitian and a future date and
              time to send your request.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >
            <div>
              <label
                htmlFor="dietitian"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Select Dietitian
              </label>

              <select
                id="dietitian"
                value={dietitianId}
                onChange={(event) =>
                  setDietitianId(event.target.value)
                }
                required
                disabled={loadingData || loading}
                className={inputClass}
              >
                <option value="">
                  Choose a dietitian
                </option>

                {sortedDietitians.map((dietitian) => (
                  <option
                    key={dietitian._id}
                    value={dietitian._id}
                  >
                    {dietitian.name}
                    {dietitian.distance !== null
                      ? ` — ${dietitian.distance.toFixed(1)} km`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="appointmentDate"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Appointment Date & Time
              </label>

              <input
                id="appointmentDate"
                type="datetime-local"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                required
                disabled={loading}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading || loadingData}
                className="w-full rounded-xl bg-emerald-700 px-6 py-3.5 font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading
                  ? "Booking..."
                  : "Request Appointment →"}
              </button>
            </div>
          </form>

          {message && (
            <div
              role={
                messageType === "error"
                  ? "alert"
                  : "status"
              }
              className={`mt-6 rounded-xl border px-5 py-4 text-sm font-medium ${
                messageType === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </section>

        {/* My Appointments */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold">
              My Appointments
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Track your appointment requests and their
              status.
            </p>
          </div>

          {loadingData ? (
            <p className="py-10 text-center text-slate-500">
              Loading appointments...
            </p>
          ) : appointments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <div className="mb-4 text-5xl">📭</div>

              <h4 className="text-lg font-bold">
                No appointments yet
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Your appointment requests will appear
                here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {appointments.map((appointment) => (
                <article
                  key={appointment._id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6"
                >
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
                        👩‍⚕️
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Dietitian
                        </p>

                        <h4 className="font-bold text-slate-900">
                          {appointment.dietitian?.name ||
                            "Unknown Dietitian"}
                        </h4>
                      </div>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${
                        statusStyles[appointment.status] ||
                        "border-slate-200 bg-slate-100 text-slate-700"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
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

                  <p className="mt-4 text-sm text-slate-500">
                    {appointment.status === "pending"
                      ? "Waiting for the dietitian's response."
                      : appointment.status === "confirmed"
                      ? "Your appointment has been approved."
                      : "Your appointment request was rejected."}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <Link
          to="/dashboard"
          className="mt-8 inline-block font-semibold text-emerald-700 hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-400">
        NutriTrack — Your health, your journey.
      </footer>
    </div>
  );
}

export default AppointmentBooking;
