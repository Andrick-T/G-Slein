import express from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

import {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecordById,
} from "../controllers/medicalRecord.controller.js";

const router = express.Router();

// --------------------------------------------------
// All medical-record routes require authentication
// --------------------------------------------------

router.use(authenticate);

// --------------------------------------------------
// POST /api/medical-records
// --------------------------------------------------
// Patient → upload own document
// Doctor  → upload document for legitimate patient
// Admin   → administrative upload
// --------------------------------------------------

router.post(
  "/",
  authorizeRoles("patient", "doctor", "admin"),
  createMedicalRecord,
);

// --------------------------------------------------
// GET /api/medical-records
// --------------------------------------------------
// Patient → own history
// Doctor  → authorized patient's history
// Admin   → administrative access
// --------------------------------------------------

router.get(
  "/",
  authorizeRoles("patient", "doctor", "admin"),
  getMedicalRecords,
);

// --------------------------------------------------
// GET /api/medical-records/:id
// --------------------------------------------------
// Patient → own record
// Doctor  → record belonging to authorized patient
// Admin   → administrative access
// --------------------------------------------------

router.get(
  "/:id",
  authorizeRoles("patient", "doctor", "admin"),
  getMedicalRecordById,
);

export default router;
