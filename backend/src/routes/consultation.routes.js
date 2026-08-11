import express from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

import {
  getSession,
  startSession,
  endSession,
} from "../controllers/consultation.controller.js";

const router = express.Router();

// --------------------------------------------------
// Get consultation session
// Patient, doctor and admin with resource access
// --------------------------------------------------

router.get(
  "/appointments/:id/session",
  authenticate,
  authorizeRoles("patient", "doctor", "admin"),
  getSession,
);

// --------------------------------------------------
// Start consultation
// Assigned doctor only
// --------------------------------------------------

router.post(
  "/appointments/:id/session/start",
  authenticate,
  authorizeRoles("doctor"),
  startSession,
);

// --------------------------------------------------
// End consultation
// Assigned doctor only
// --------------------------------------------------

router.post(
  "/appointments/:id/session/end",
  authenticate,
  authorizeRoles("doctor"),
  endSession,
);

export default router;
