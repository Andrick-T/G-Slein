import express from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

import {
  createPayment,
  getPayments,
  getPaymentById,
} from "../controllers/payment.controller.js";

const router = express.Router();

// --------------------------------------------------
// All payment routes require authentication
// --------------------------------------------------

router.use(authenticate);

// --------------------------------------------------
// POST /api/payments
// --------------------------------------------------

router.post("/", authorizeRoles("patient"), createPayment);

// --------------------------------------------------
// GET /api/payments
// --------------------------------------------------

router.get("/", authorizeRoles("patient", "doctor", "admin"), getPayments);

// --------------------------------------------------
// GET /api/payments/:id
// --------------------------------------------------

router.get(
  "/:id",
  authorizeRoles("patient", "doctor", "admin"),
  getPaymentById,
);

export default router;
