import { Route, Routes } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout.jsx";
import PatientLayout from "../layouts/PatientLayout.jsx";
import DoctorLayout from "../layouts/DoctorLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";

import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";

import Home from "../pages/public/Home.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";

import PatientDashboard from "../pages/patient/PatientDashboard.jsx";
import PatientProfile from "../pages/patient/PatientProfile.jsx";
import DoctorDashboard from "../pages/doctor/DoctorDashboard.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";

import NotFound from "../pages/errors/NotFound.jsx";
import Unauthorized from "../pages/errors/Unauthorized.jsx";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* Patient routes */}
      <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
        <Route path="/patient" element={<PatientLayout />}>
          <Route index element={<PatientDashboard />} />
          <Route path="profile" element={<PatientProfile />} />
        </Route>
      </Route>

      {/* Doctor routes */}
      <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorDashboard />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
