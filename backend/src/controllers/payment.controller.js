import mongoose from "mongoose";

import Payment from "../models/Payment.js";
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
// POST /api/payments
// --------------------------------------------------
// Creates a simulated payment.
//
// Rules:
// - Only patients can initiate payment.
// - Appointment must belong to authenticated patient.
// - Appointment must belong to the specified doctor.
// - Appointment must not already have a payment.
// - Appointment must not be cancelled/rejected.
// --------------------------------------------------

const createPayment = async (req, res, next) => {
  try {
    const { appointment, amount, currency } = req.body;

    // --------------------------------------------------
    // 1. Validate required fields
    // --------------------------------------------------

    if (!appointment || amount === undefined) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Appointment and amount are required.",
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
    // 3. Validate amount
    // --------------------------------------------------

    if (typeof amount !== "number" || !Number.isFinite(amount)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Amount must be a valid number.",
      });
    }

    if (amount <= 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Amount must be greater than zero.",
      });
    }

    // --------------------------------------------------
    // 4. Find appointment belonging to patient
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
    // 5. Prevent payment for invalid appointment state
    // --------------------------------------------------

    if (
      existingAppointment.status === "cancelled" ||
      existingAppointment.status === "rejected"
    ) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Payment cannot be made for this appointment.",
      });
    }

    // --------------------------------------------------
    // 6. Verify doctor exists and has doctor role
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
    // 7. Prevent duplicate payment
    // --------------------------------------------------

    const existingPayment = await Payment.findOne({
      appointment,
    });

    if (existingPayment) {
      return errorResponse(res, {
        statusCode: 409,
        message: "A payment already exists for this appointment.",
      });
    }

    // --------------------------------------------------
    // 8. Create simulated payment
    // --------------------------------------------------

    const payment = await Payment.create({
      patient: req.user.userId,
      doctor: existingAppointment.doctor,
      appointment: existingAppointment._id,
      amount,
      currency: currency || "USD",
      status: "paid",
      provider: "simulated",
      transactionId: `SIM-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)
        .toUpperCase()}`,
    });

    // --------------------------------------------------
    // 9. Synchronize appointment payment status
    // --------------------------------------------------

    existingAppointment.paymentStatus = "paid";

    await existingAppointment.save();

    // --------------------------------------------------
    // 10. Populate response
    // --------------------------------------------------

    const populatedPayment = await Payment.findById(payment._id)
      .populate("patient", "firstName lastName email")
      .populate("doctor", "firstName lastName email doctorProfile")
      .populate(
        "appointment",
        "date startTime endTime status consultationType paymentStatus",
      );

    return successResponse(res, {
      statusCode: 201,
      message: "Payment completed successfully.",
      data: {
        payment: populatedPayment,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// GET /api/payments
// --------------------------------------------------
// Patient → own payments
// Doctor  → payments for their appointments
// Admin   → all payments
// --------------------------------------------------

const getPayments = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === "patient") {
      query.patient = req.user.userId;
    }

    if (req.user.role === "doctor") {
      query.doctor = req.user.userId;
    }

    const payments = await Payment.find(query)
      .populate("patient", "firstName lastName email")
      .populate("doctor", "firstName lastName email doctorProfile")
      .populate(
        "appointment",
        "date startTime endTime status consultationType paymentStatus",
      )
      .sort({ createdAt: -1 });

    return successResponse(res, {
      statusCode: 200,
      message: "Payments retrieved successfully.",
      data: {
        payments,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// GET /api/payments/:id
// --------------------------------------------------
// Patient → own payment
// Doctor  → payment belonging to their appointment
// Admin   → any payment
// --------------------------------------------------

const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid payment ID.",
      });
    }

    const payment = await Payment.findById(id)
      .populate("patient", "firstName lastName email")
      .populate("doctor", "firstName lastName email doctorProfile")
      .populate(
        "appointment",
        "date startTime endTime status consultationType paymentStatus",
      );

    if (!payment) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Payment not found.",
      });
    }

    // --------------------------------------------------
    // Resource-level authorization
    // --------------------------------------------------

    const userId = req.user.userId;

    const isPatient =
      req.user.role === "patient" && payment.patient._id.toString() === userId;

    const isDoctor =
      req.user.role === "doctor" && payment.doctor._id.toString() === userId;

    const isAdmin = req.user.role === "admin";

    if (!isPatient && !isDoctor && !isAdmin) {
      return errorResponse(res, {
        statusCode: 403,
        message: "You are not authorized to access this payment.",
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Payment retrieved successfully.",
      data: {
        payment,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export { createPayment, getPayments, getPaymentById };
