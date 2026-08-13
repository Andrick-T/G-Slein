import mongoose from "mongoose";
import Stripe from "stripe";

import Payment from "../models/Payment.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getStripeCurrencyAmount = (amount, currency) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return null;
  }

  const normalizedCurrency = String(currency || "XAF").toUpperCase();
  const zeroDecimalCurrencies = new Set([
    "BIF",
    "CLP",
    "DJF",
    "GNF",
    "JPY",
    "KMF",
    "KRW",
    "MGA",
    "PYG",
    "RWF",
    "UGX",
    "VND",
    "VUV",
    "XAF",
    "XOF",
    "XPF",
  ]);

  if (zeroDecimalCurrencies.has(normalizedCurrency)) {
    return Math.round(numericAmount);
  }

  return Math.round(numericAmount * 100);
};

const getClientOrigin = () => {
  if (process.env.CLIENT_ORIGIN) {
    return process.env.CLIENT_ORIGIN;
  }

  return "http://localhost:5173";
};

const createPayment = async (req, res) => {
  return errorResponse(res, {
    statusCode: 410,
    message:
      "The legacy simulated payment flow has been disabled. Use the Stripe Checkout session endpoint.",
  });
};

const createStripeCheckoutSession = async (req, res, next) => {
  try {
    if (!stripe) {
      return errorResponse(res, {
        statusCode: 500,
        message: "Stripe is not configured on the backend.",
      });
    }

    const { appointmentId } = req.body;

    if (!appointmentId || !isValidObjectId(appointmentId)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "A valid appointment ID is required.",
      });
    }

    const appointment = await Appointment.findById(appointmentId).populate(
      "doctor",
      "firstName lastName doctorProfile",
    );

    if (!appointment) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Appointment not found.",
      });
    }

    if (appointment.patient.toString() !== req.user.userId) {
      return errorResponse(res, {
        statusCode: 403,
        message: "You are not authorized to pay for this appointment.",
      });
    }

    if (["cancelled", "rejected"].includes(appointment.status)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Payment cannot be made for this appointment.",
      });
    }

    if (appointment.paymentStatus === "paid") {
      return errorResponse(res, {
        statusCode: 409,
        message: "This appointment has already been paid.",
      });
    }

    const doctor = await User.findOne({
      _id: appointment.doctor,
      role: "doctor",
    }).select("doctorProfile");

    if (!doctor?.doctorProfile?.consultationFee) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Consultation fee is not available for this appointment.",
      });
    }

    const fee = Number(doctor.doctorProfile.consultationFee);

    if (!Number.isFinite(fee) || fee <= 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Consultation fee must be a positive number.",
      });
    }

    const currency = "XAF";

    if (fee < 50) {
      return errorResponse(res, {
        statusCode: 400,
        message:
          "Consultation fee must be at least 50 XAF for Stripe Checkout.",
      });
    }

    const stripeAmount = getStripeCurrencyAmount(fee, currency);

    if (stripeAmount === null) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Consultation fee could not be converted for Stripe.",
      });
    }

    const existingPayment = await Payment.findOne({
      appointment: appointment._id,
    });

    let payment;

    if (existingPayment) {
      if (existingPayment.status === "paid") {
        return errorResponse(res, {
          statusCode: 409,
          message: "A paid payment already exists for this appointment.",
        });
      }

      if (existingPayment.provider !== "stripe") {
        return errorResponse(res, {
          statusCode: 409,
          message:
            "A payment with another provider already exists for this appointment.",
        });
      }

      existingPayment.status = "pending";
      existingPayment.provider = "stripe";
      existingPayment.amount = fee;
      existingPayment.currency = currency;
      existingPayment.paidAt = null;
      payment = await existingPayment.save();
    } else {
      payment = await Payment.create({
        patient: req.user.userId,
        doctor: appointment.doctor,
        appointment: appointment._id,
        amount: fee,
        currency,
        status: "pending",
        provider: "stripe",
        transactionId: `stripe-checkout-${Date.now()}`,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${getClientOrigin()}/patient/payments?payment=processing&appointmentId=${appointment._id}`,
      cancel_url: `${getClientOrigin()}/patient/payments?payment=cancelled&appointmentId=${appointment._id}`,
      client_reference_id: appointment._id.toString(),
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: stripeAmount,
            product_data: {
              name: `G-Slein consultation - ${appointment._id}`,
            },
          },
        },
      ],
      metadata: {
        appointmentId: appointment._id.toString(),
        paymentId: payment._id.toString(),
        patientId: req.user.userId,
        doctorId: appointment.doctor.toString(),
        amount: String(fee),
        currency,
      },
    });

    await Payment.findByIdAndUpdate(payment._id, {
      transactionId: session.id,
      transactionReference: session.id,
      providerPaymentId: session.id,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "Stripe checkout session created successfully.",
      data: {
        session: {
          id: session.id,
          url: session.url,
          paymentId: payment._id.toString(),
          appointmentId: appointment._id.toString(),
        },
        amount: fee,
        currency,
      },
    });
  } catch (error) {
    if (error?.type === "StripeCardError") {
      return errorResponse(res, {
        statusCode: 402,
        message: "The payment could not be completed with the provided card.",
      });
    }

    if (error?.type === "StripeError") {
      return errorResponse(res, {
        statusCode: 502,
        message: "Payment could not be started. Please try again.",
      });
    }

    return next(error);
  }
};

const handleStripeWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Missing Stripe signature.",
      });
    }

    if (!stripe) {
      return errorResponse(res, {
        statusCode: 500,
        message: "Stripe is not configured on the backend.",
      });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return errorResponse(res, {
        statusCode: 500,
        message: "Stripe webhook secret is not configured.",
      });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret,
      );
    } catch (error) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid Stripe webhook signature.",
      });
    }

    if (event.type !== "checkout.session.completed") {
      return successResponse(res, {
        statusCode: 200,
        message: "Webhook event acknowledged.",
        data: {
          received: true,
          eventType: event.type,
        },
      });
    }

    const session = event.data.object;
    const paymentId = session?.metadata?.paymentId;
    const appointmentId = session?.metadata?.appointmentId;

    if (!paymentId || !appointmentId) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Stripe webhook metadata is incomplete.",
      });
    }

    const payment = await Payment.findById(paymentId).populate("appointment");

    if (!payment) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Unknown payment for Stripe webhook.",
      });
    }

    if (payment.provider !== "stripe") {
      return errorResponse(res, {
        statusCode: 400,
        message: "Payment provider mismatch.",
      });
    }

    if (payment.appointment?._id.toString() !== appointmentId) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Appointment mismatch for Stripe webhook.",
      });
    }

    if (payment.patient?.toString() !== session.metadata.patientId) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Patient mismatch for Stripe webhook.",
      });
    }

    if (session.payment_status !== "paid") {
      return errorResponse(res, {
        statusCode: 400,
        message: "Stripe session is not paid.",
      });
    }

    const expectedAmount = getStripeCurrencyAmount(
      payment.amount,
      payment.currency,
    );
    const sessionAmount = Number(session.amount_total || 0);
    const sessionCurrency = String(session.currency || "").toUpperCase();

    if (
      sessionAmount !== expectedAmount ||
      sessionCurrency !== payment.currency
    ) {
      return errorResponse(res, {
        statusCode: 400,
        message:
          "Stripe amount or currency does not match the appointment fee.",
      });
    }

    if (payment.status === "paid") {
      return successResponse(res, {
        statusCode: 200,
        message: "Payment already processed. Duplicate Stripe webhook ignored.",
      });
    }

    const appointment = payment.appointment;

    if (!appointment) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Appointment reference is missing for this payment.",
      });
    }

    await Payment.findByIdAndUpdate(payment._id, {
      status: "paid",
      provider: "stripe",
      transactionId: session.id,
      transactionReference: session.id,
      providerPaymentId: session.id,
      paidAt: new Date(),
    });

    await Appointment.findByIdAndUpdate(appointment._id, {
      paymentStatus: "paid",
    });

    return successResponse(res, {
      statusCode: 200,
      message: "Payment confirmed via Stripe webhook.",
      data: {
        paymentId: payment._id.toString(),
        appointmentId: appointment._id.toString(),
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

export {
  createPayment,
  createStripeCheckoutSession,
  handleStripeWebhook,
  getPayments,
  getPaymentById,
};
