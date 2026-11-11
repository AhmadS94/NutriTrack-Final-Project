
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getToken } from "../utils/auth";

function AppointmentBooking() {
  const [dietitians, setDietitians] = useState([]);
  const [dietitianId, setDietitianId] = useState("");
  const [date, setDate] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:5000/api/appointments";

  async function loadDietitians() {
    try {
      const response = await fetch(`${API_URL}/dietitians`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load dietitians");
      }

      setDietitians(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadAppointments() {
    try {
      const response = await fetch(`${API_URL}/my`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load appointments");
      }

      setAppointments(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadDietitians();
    loadAppointments();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!dietitianId || !date) {
      setMessage("Please select a dietitian and appointment date.");
      return;
    }

    const selectedDate = new Date(date);

    if (selectedDate <= new Date()) {
      setMessage("Please select a future date and time.");
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed");
      }

      setMessage("Appointment requested successfully!");
      setDietitianId("");
      setDate("");

      await loadAppointments();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Book an Appointment</h1>

      <p>Choose a dietitian and select your appointment date.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="dietitian">Dietitian:</label>

          <select
            id="dietitian"
            value={dietitianId}
            onChange={(event) => setDietitianId(event.target.value)}
            required
          >
            <option value="">Select a dietitian</option>

            {dietitians.map((dietitian) => (
              <option key={dietitian._id} value={dietitian._id}>
                {dietitian.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="appointmentDate">
            Appointment Date and Time:
          </label>

          <input
            id="appointmentDate"
            type="datetime-local"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Booking..." : "Request Appointment"}
        </button>
      </form>

      {message && <p>{message}</p>}

      <h2>My Appointments</h2>

      {appointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        <ul>
          {appointments.map((appointment) => (
            <li key={appointment._id}>
              <p>
                Dietitian:{" "}
                {appointment.dietitian?.name || "Unknown"}
              </p>

              <p>
                Date:{" "}
                {new Date(appointment.date).toLocaleString()}
              </p>

              <p>Status: {appointment.status}</p>
            </li>
          ))}
        </ul>
      )}

      <Link to="/dashboard">Back to Dashboard</Link>
    </div>
  );
}

export default AppointmentBooking;
