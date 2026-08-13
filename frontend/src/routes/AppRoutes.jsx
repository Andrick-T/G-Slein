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
import PatientDoctors from "../pages/patient/PatientDoctors.jsx";
import PatientDoctorProfile from "../pages/patient/PatientDoctorProfile.jsx";
import PatientDoctorBooking from "../pages/patient/PatientDoctorBooking.jsx";
import PatientBookingConfirmation from "../pages/patient/PatientBookingConfirmation.jsx";
import PatientAppointments from "../pages/patient/PatientAppointments.jsx";
import PatientAppointmentDetails from "../pages/patient/PatientAppointmentDetails.jsx";
import PatientConsultation from "../pages/patient/PatientConsultation.jsx";
import PatientMedicalRecords from "../pages/patient/PatientMedicalRecords.jsx";
import PatientMedicalRecordDetails from "../pages/patient/PatientMedicalRecordDetails.jsx";
import PatientPrescriptions from "../pages/patient/PatientPrescriptions.jsx";
import PatientPrescriptionDetails from "../pages/patient/PatientPrescriptionDetails.jsx";
import PatientPayments from "../pages/patient/PatientPayments.jsx";
import PatientPaymentDetails from "../pages/patient/PatientPaymentDetails.jsx";
import PatientReviews from "../pages/patient/PatientReviews.jsx";
import DoctorDashboard from "../pages/doctor/DoctorDashboard.jsx";
import DoctorAppointments from "../pages/doctor/DoctorAppointments.jsx";
import DoctorAppointmentDetails from "../pages/doctor/DoctorAppointmentDetails.jsx";
import DoctorPatients from "../pages/doctor/DoctorPatients.jsx";
import DoctorConsultation from "../pages/doctor/DoctorConsultation.jsx";
import DoctorHistory from "../pages/doctor/DoctorHistory.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import AdminUsers from "../pages/admin/AdminUsers.jsx";
import AdminDoctors from "../pages/admin/AdminDoctors.jsx";
import AdminDoctorDetails from "../pages/admin/AdminDoctorDetails.jsx";
import AdminAppointments from "../pages/admin/AdminAppointments.jsx";
import AdminPayments from "../pages/admin/AdminPayments.jsx";
import AdminReviews from "../pages/admin/AdminReviews.jsx";

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
          <Route path="doctors" element={<PatientDoctors />} />
          <Route path="doctors/:doctorId" element={<PatientDoctorProfile />} />
          <Route
            path="doctors/:doctorId/book"
            element={<PatientDoctorBooking />}
          />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route
            path="appointments/:appointmentId"
            element={<PatientAppointmentDetails />}
          />
          <Route
            path="appointments/:appointmentId/consultation"
            element={<PatientConsultation />}
          />
          <Route
            path="appointments/confirmation/:appointmentId"
            element={<PatientBookingConfirmation />}
          />
          <Route path="medical-records" element={<PatientMedicalRecords />} />
          <Route
            path="medical-records/:recordId"
            element={<PatientMedicalRecordDetails />}
          />
          <Route path="prescriptions" element={<PatientPrescriptions />} />
          <Route
            path="prescriptions/:prescriptionId"
            element={<PatientPrescriptionDetails />}
          />
          <Route path="payments" element={<PatientPayments />} />
          <Route
            path="payments/:paymentId"
            element={<PatientPaymentDetails />}
          />
          <Route path="reviews" element={<PatientReviews />} />
        </Route>
      </Route>

      {/* Doctor routes */}
      <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route
            path="appointments/:appointmentId"
            element={<DoctorAppointmentDetails />}
          />
          <Route
            path="appointments/:appointmentId/consultation"
            element={<DoctorConsultation />}
          />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="history" element={<DoctorHistory />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="doctors/:doctorId" element={<AdminDoctorDetails />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
