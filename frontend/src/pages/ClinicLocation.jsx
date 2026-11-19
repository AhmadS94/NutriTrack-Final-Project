
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getToken, logout } from "../utils/auth";

const API_URL = "http://localhost:5000/api/profile";

// Always open the map in Düsseldorf, Germany
const DUSSELDORF_CENTER = [51.2277, 6.7735];
const DEFAULT_ZOOM = 12;

const clinicIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:36px;
      height:36px;
      background:#047857;
      border:3px solid white;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:19px;
      box-shadow:0 3px 12px #0003;
    ">🏥</div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Select clinic location by clicking on the map
function LocationPicker({ position, onChange }) {
  useMapEvents({
    click(event) {
      onChange([
        event.latlng.lat,
        event.latlng.lng,
      ]);
    },
  });

  return position ? (
    <Marker position={position} icon={clinicIcon} />
  ) : null;
}

function ClinicLocation() {
  const navigate = useNavigate();

  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        if (response.status === 401) {
          handleLogout();
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const user = await response.json();

        if (user.role !== "dietitian") {
          navigate("/dashboard", { replace: true });
          return;
        }

        // Load saved clinic location without moving the map
        if (
          typeof user.location?.latitude === "number" &&
          typeof user.location?.longitude === "number"
        ) {
          setPosition([
            user.location.latitude,
            user.location.longitude,
          ]);
        }

        setAddress(user.location?.address || "");
      } catch (err) {
        setError(err.message || "Cannot load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  async function handleSave() {
    if (!position) {
      setError(
        "Please select your clinic location on the map."
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/location`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            latitude: position[0],
            longitude: position[1],
            address,
          }),
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save location"
        );
      }

      setMessage("Clinic location saved successfully!");
    } catch (err) {
      setError(err.message || "Cannot save location");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
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

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            Logout →
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <Link
          to="/dietitian/appointments"
          className="text-sm font-semibold text-emerald-700 hover:underline"
        >
          ← Back to Appointments
        </Link>

        <div className="mb-7 mt-7">
          <span className="mb-3 inline-block rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            CLINIC LOCATION
          </span>

          <h2 className="text-3xl font-bold">
            Set Your Clinic Location 📍
          </h2>

          <p className="mt-3 text-slate-500">
            Click on the map to select your clinic location.
            Users will use this location to find nearby dietitians.
          </p>
        </div>

        {message && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
          >
            ✓ {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              Loading clinic location...
            </div>
          ) : (
            <>
              <div className="h-[420px] w-full">
                <MapContainer
                  center={DUSSELDORF_CENTER}
                  zoom={DEFAULT_ZOOM}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <LocationPicker
                    position={position}
                    onChange={(newPosition) => {
                      setPosition(newPosition);
                      setMessage("");
                      setError("");
                    }}
                  />
                </MapContainer>
              </div>

              <div className="space-y-5 p-6 sm:p-8">
                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Clinic Address (Optional)
                  </label>

                  <input
                    id="address"
                    type="text"
                    maxLength={300}
                    value={address}
                    onChange={(event) =>
                      setAddress(event.target.value)
                    }
                    placeholder="e.g. Düsseldorf, Germany"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                {position && (
                  <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
                    <p className="font-semibold">
                      Selected Coordinates
                    </p>
                    <p className="mt-1">
                      Latitude: {position[0].toFixed(6)}
                    </p>
                    <p>
                      Longitude: {position[1].toFixed(6)}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !position}
                  className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving Location..."
                    : "📍 Save Clinic Location"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default ClinicLocation;
