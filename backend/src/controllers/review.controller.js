import mongoose from "mongoose";

import Review from "../models/Review.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// --------------------------------------------------
// Helper
// --------------------------------------------------

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// --------------------------------------------------
// POST /api/reviews
// --------------------------------------------------
// Patient creates a review after a completed appointment.
// --------------------------------------------------

const createReview = async (req, res, next) => {
  try {
    const { appointment, rating, comment } = req.body;

    // --------------------------------------------------
    // 1. Validate required fields
    // --------------------------------------------------

    if (!appointment || rating === undefined) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Appointment and rating are required.",
      });
    }

    // --------------------------------------------------
    // 2. Validate appointment ID
    // --------------------------------------------------

    if (!isValidObjectId(appointment)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid appointment ID.",
      });
    }

    // --------------------------------------------------
    // 3. Validate rating
    // --------------------------------------------------

    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Rating must be an integer between 1 and 5.",
      });
    }

    // --------------------------------------------------
    // 4. Find patient's appointment
    // --------------------------------------------------

    const existingAppointment = await Appointment.findOne({
      _id: appointment,
      patient: req.user.userId,
    });

    if (!existingAppointment) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Appointment not found.",
      });
    }

    // --------------------------------------------------
    // 5. Appointment must be completed
    // --------------------------------------------------

    if (existingAppointment.status !== "completed") {
      return errorResponse(res, {
        statusCode: 400,
        message: "You can only review a completed appointment.",
      });
    }

    // --------------------------------------------------
    // 6. Verify doctor
    // --------------------------------------------------

    const doctor = await User.findOne({
      _id: existingAppointment.doctor,
      role: "doctor",
    });

    if (!doctor) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Appointment doctor not found.",
      });
    }

    // --------------------------------------------------
    // 7. Prevent duplicate review
    // --------------------------------------------------

    const existingReview = await Review.findOne({
      patient: req.user.userId,
      appointment: existingAppointment._id,
    });

    if (existingReview) {
      return errorResponse(res, {
        statusCode: 409,
        message: "You have already reviewed this appointment.",
      });
    }

    // --------------------------------------------------
    // 8. Create review
    // --------------------------------------------------

    const review = await Review.create({
      patient: req.user.userId,
      doctor: existingAppointment.doctor,
      appointment: existingAppointment._id,
      rating,
      comment,
    });

    // --------------------------------------------------
    // 9. Populate response
    // --------------------------------------------------

    const populatedReview = await Review.findById(review._id)
      .populate("patient", "firstName lastName")
      .populate("doctor", "firstName lastName doctorProfile")
      .populate(
        "appointment",
        "date startTime endTime status consultationType",
      );

    return successResponse(res, {
      statusCode: 201,
      message: "Review created successfully.",
      data: {
        review: populatedReview,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// GET /api/doctors/:doctorId/reviews
// --------------------------------------------------
// Public doctor reviews.
// --------------------------------------------------

const getDoctorReviews = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    // --------------------------------------------------
    // 1. Validate doctor ID
    // --------------------------------------------------

    if (!isValidObjectId(doctorId)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid doctor ID.",
      });
    }

    // --------------------------------------------------
    // 2. Verify doctor exists
    // --------------------------------------------------

    const doctor = await User.findOne({
      _id: doctorId,
      role: "doctor",
    }).select("firstName lastName doctorProfile");

    if (!doctor) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Doctor not found.",
      });
    }

    // --------------------------------------------------
    // 3. Retrieve reviews
    // --------------------------------------------------

    const reviews = await Review.find({
      doctor: doctorId,
    })
      .populate("patient", "firstName lastName")
      .sort({ createdAt: -1 });

    return successResponse(res, {
      statusCode: 200,
      message: "Doctor reviews retrieved successfully.",
      data: {
        doctor,
        reviews,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// PATCH /api/reviews/:id
// --------------------------------------------------
// Only the patient who created the review can edit it.
// --------------------------------------------------

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // --------------------------------------------------
    // 1. Validate review ID
    // --------------------------------------------------

    if (!isValidObjectId(id)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid review ID.",
      });
    }

    // --------------------------------------------------
    // 2. Find review owned by authenticated patient
    // --------------------------------------------------

    const review = await Review.findOne({
      _id: id,
      patient: req.user.userId,
    });

    if (!review) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Review not found.",
      });
    }

    // --------------------------------------------------
    // 3. Validate rating if provided
    // --------------------------------------------------

    if (rating !== undefined) {
      if (
        typeof rating !== "number" ||
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
      ) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Rating must be an integer between 1 and 5.",
        });
      }

      review.rating = rating;
    }

    // --------------------------------------------------
    // 4. Update comment if provided
    // --------------------------------------------------

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    // --------------------------------------------------
    // 5. Populate response
    // --------------------------------------------------

    const populatedReview = await Review.findById(review._id)
      .populate("patient", "firstName lastName")
      .populate("doctor", "firstName lastName doctorProfile")
      .populate(
        "appointment",
        "date startTime endTime status consultationType",
      );

    return successResponse(res, {
      statusCode: 200,
      message: "Review updated successfully.",
      data: {
        review: populatedReview,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// DELETE /api/reviews/:id
// --------------------------------------------------
// Only the patient who created the review can delete it.
// --------------------------------------------------

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------
    // 1. Validate review ID
    // --------------------------------------------------

    if (!isValidObjectId(id)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid review ID.",
      });
    }

    // --------------------------------------------------
    // 2. Find review owned by authenticated patient
    // --------------------------------------------------

    const review = await Review.findOne({
      _id: id,
      patient: req.user.userId,
    });

    if (!review) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Review not found.",
      });
    }

    // --------------------------------------------------
    // 3. Delete review
    // --------------------------------------------------

    await review.deleteOne();

    return successResponse(res, {
      statusCode: 200,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

export { createReview, getDoctorReviews, updateReview, deleteReview };
