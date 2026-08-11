import express from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointment.controller.js";

const router = express.Router();

// --------------------------------------------------
// Create appointment
// --------------------------------------------------

router.post("/", authenticate, authorizeRoles("patient"), createAppointment);

// --------------------------------------------------
// List appointments
// --------------------------------------------------

router.get(
  "/",
  authenticate,
  authorizeRoles("patient", "doctor", "admin"),
  getAppointments,
);

// --------------------------------------------------
// Get specific appointment
// --------------------------------------------------

router.get(
  "/:id",
  authenticate,
  authorizeRoles("patient", "doctor", "admin"),
  getAppointmentById,
);

// --------------------------------------------------
// Update appointment status
// --------------------------------------------------

router.patch(
  "/:id",
  authenticate,
  authorizeRoles("patient", "doctor", "admin"),
  updateAppointment,
);

// --------------------------------------------------
// Delete appointment
// --------------------------------------------------

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("patient", "admin"),
  deleteAppointment,
);

export default router;
