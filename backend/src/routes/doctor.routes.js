import express from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

import {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
} from "../controllers/doctor.controller.js";

const router = express.Router();

// --------------------------------------------------
// Doctor discovery
// --------------------------------------------------

router.get("/", authenticate, getDoctors);

router.get("/:id", authenticate, getDoctorById);

// --------------------------------------------------
// Authenticated doctor profile
// --------------------------------------------------

router.patch(
  "/profile",
  authenticate,
  authorizeRoles("doctor"),
  updateDoctorProfile,
);

export default router;
