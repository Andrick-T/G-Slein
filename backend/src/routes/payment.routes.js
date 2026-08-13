import express from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

import {
  createPayment,
  createStripeCheckoutSession,
  handleStripeWebhook,
  getPayments,
  getPaymentById,
} from "../controllers/payment.controller.js";

const router = express.Router();

// --------------------------------------------------
// Stripe webhook route must receive raw body before JSON parsing.
// --------------------------------------------------

router.post("/stripe/webhook", handleStripeWebhook);

// --------------------------------------------------
// All payment routes require authentication.
// --------------------------------------------------

router.use(authenticate);

// --------------------------------------------------
// POST /api/payments
// Redirects to real Stripe checkout session.
// --------------------------------------------------

router.post("/", authorizeRoles("patient"), createPayment);
router.post(
  "/stripe/checkout-session",
  authorizeRoles("patient"),
  createStripeCheckoutSession,
);

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
