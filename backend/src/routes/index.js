import express from "express";

import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import doctorRoutes from "./doctor.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import medicalRecordRoutes from "./medicalRecord.routes.js";
import prescriptionRoutes from "./prescription.routes.js";
import paymentRoutes from "./payment.routes.js";
import reviewRoutes from "./review.routes.js";
import consultationRoutes from "./consultation.routes.js";

const router = express.Router();

// --------------------------------------------------
// Health check
// --------------------------------------------------

router.get("/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "G-Slein API is healthy",
  });
});

// --------------------------------------------------
// Authentication routes
// --------------------------------------------------

router.use("/auth", authRoutes);

// --------------------------------------------------
// User routes
// --------------------------------------------------

router.use("/users", userRoutes);

// --------------------------------------------------
// Doctor routes
// --------------------------------------------------

router.use("/doctors", doctorRoutes);

// --------------------------------------------------
// Appointment routes
// --------------------------------------------------

router.use("/appointments", appointmentRoutes);

// --------------------------------------------------
// Medical Record routes
// --------------------------------------------------
router.use("/medical-records", medicalRecordRoutes);

// --------------------------------------------------
// Prescription routes
// --------------------------------------------------
router.use("/prescriptions", prescriptionRoutes);

// --------------------------------------------------
// Payment routes
// --------------------------------------------------
router.use("/payments", paymentRoutes);

// --------------------------------------------------
// Review routes
// --------------------------------------------------
router.use("/reviews", reviewRoutes);

// --------------------------------------------------
// Consultation routes
// --------------------------------------------------
router.use("/consultations", consultationRoutes);

export default router;
