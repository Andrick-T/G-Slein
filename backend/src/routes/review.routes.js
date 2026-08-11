import express from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

import {
  createReview,
  getDoctorReviews,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";

const router = express.Router();

// --------------------------------------------------
// Public doctor reviews
// --------------------------------------------------

router.get("/doctors/:doctorId/reviews", getDoctorReviews);

// --------------------------------------------------
// Authenticated patient review operations
// --------------------------------------------------

router.post("/", authenticate, authorizeRoles("patient"), createReview);

router.patch("/:id", authenticate, authorizeRoles("patient"), updateReview);

router.delete("/:id", authenticate, authorizeRoles("patient"), deleteReview);

export default router;
