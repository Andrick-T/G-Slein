import express from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription,
} from "../controllers/prescription.controller.js";

const router = express.Router();

// --------------------------------------------------
// All prescription routes require authentication
// --------------------------------------------------

router.use(authenticate);

// --------------------------------------------------
// POST /api/prescriptions
// --------------------------------------------------

router.post("/", authorizeRoles("doctor"), createPrescription);

// --------------------------------------------------
// GET /api/prescriptions
// --------------------------------------------------

router.get("/", authorizeRoles("patient", "doctor", "admin"), getPrescriptions);

// --------------------------------------------------
// GET /api/prescriptions/:id
// --------------------------------------------------

router.get(
  "/:id",
  authorizeRoles("patient", "doctor", "admin"),
  getPrescriptionById,
);

// --------------------------------------------------
// PATCH /api/prescriptions/:id
// --------------------------------------------------

router.patch("/:id", authorizeRoles("doctor", "admin"), updatePrescription);

export default router;
