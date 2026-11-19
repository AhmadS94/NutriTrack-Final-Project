
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddMeal from "./pages/AddMeal";
import DailyMeals from "./pages/DailyMeals";
import AppointmentBooking from "./pages/AppointmentBooking";
import DietitianAppointments from "./pages/DietitianAppointments";
import ClinicLocation from "./pages/ClinicLocation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-meal" element={<AddMeal />} />
        <Route path="/daily-meals" element={<DailyMeals />} />

        <Route
          path="/appointments"
          element={<AppointmentBooking />}
        />

        {/* Dietitian Pages */}
        <Route
          path="/dietitian/appointments"
          element={<DietitianAppointments />}
        />

        <Route
          path="/dietitian/location"
          element={<ClinicLocation />}
        />

        {/* Unknown Routes */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
