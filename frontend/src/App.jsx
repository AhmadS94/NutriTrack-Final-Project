
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddMeal from "./pages/AddMeal";
import DailyMeals from "./pages/DailyMeals";
import AppointmentBooking from "./pages/AppointmentBooking";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-meal" element={<AddMeal />} />
        <Route path="/daily-meals" element={<DailyMeals />} />

        <Route
          path="/appointments"
          element={<AppointmentBooking />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
