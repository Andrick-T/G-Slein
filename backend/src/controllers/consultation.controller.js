import mongoose from "mongoose";
import crypto from "crypto";

import Appointment from "../models/Appointment.js";
import { externalServicesConfig } from "../config/externalServices.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const JITSI_DEFAULT_DOMAIN = "meet.jit.si";

const hasAppointmentAccess = (appointment, req) => {
  const userId = req.user.userId;

  const isPatient =
    req.user.role === "patient" && appointment.patient.toString() === userId;

  const isDoctor =
    req.user.role === "doctor" && appointment.doctor.toString() === userId;

  return isPatient || isDoctor;
};

const getJitsiDomain = () => {
  return externalServicesConfig.jitsi.domain || JITSI_DEFAULT_DOMAIN;
};

const buildMeetingUrl = (roomName) => {
  return `https://${getJitsiDomain()}/${encodeURIComponent(roomName)}`;
};

const getConsultationAccessState = (appointment) => {
  if (appointment.consultationType !== "video") {
    return {
      canAccess: false,
      statusCode: 409,
      message: "This appointment is not configured for video consultation.",
    };
  }

  if (appointment.paymentStatus !== "paid") {
    return {
      canAccess: false,
      statusCode: 409,
      message:
        "Payment must be completed before the consultation can be joined.",
    };
  }

  if (appointment.status === "pending") {
    return {
      canAccess: false,
      statusCode: 409,
      message:
        "Consultation is not available until the appointment is confirmed.",
    };
  }

  if (appointment.status === "cancelled" || appointment.status === "rejected") {
    return {
      canAccess: false,
      statusCode: 409,
      message: "This consultation is no longer available.",
    };
  }

  if (
    appointment.status === "completed" ||
    appointment.sessionStatus === "ended"
  ) {
    return {
      canAccess: false,
      statusCode: 409,
      message: "This consultation has already ended.",
    };
  }

  return {
    canAccess: true,
    statusCode: 200,
    message: "Consultation access is available.",
  };
};

const getSessionDetails = (appointment) => {
  const isJoinable =
    appointment.sessionStatus === "active" &&
    Boolean(appointment.sessionRoomId);

  return {
    appointmentId: appointment._id,
    consultationType: appointment.consultationType,
    jitsiDomain: getJitsiDomain(),
    meetingUrl: isJoinable ? buildMeetingUrl(appointment.sessionRoomId) : null,
    sessionRoomId: isJoinable ? appointment.sessionRoomId : null,
    sessionStatus: appointment.sessionStatus,
    sessionStartedAt: appointment.sessionStartedAt,
    sessionEndedAt: appointment.sessionEndedAt,
    canJoin: isJoinable,
  };
};

// --------------------------------------------------
// GET /api/appointments/:id/session
// --------------------------------------------------

const getSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid appointment ID.",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Appointment not found.",
      });
    }

    // --------------------------------------------------
    // Resource-level authorization
    // --------------------------------------------------

    if (!hasAppointmentAccess(appointment, req)) {
      return errorResponse(res, {
        statusCode: 403,
        message: "You do not have access to this consultation session.",
      });
    }

    const accessState = getConsultationAccessState(appointment);

    if (!accessState.canAccess) {
      return errorResponse(res, {
        statusCode: accessState.statusCode,
        message: accessState.message,
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Consultation session retrieved successfully.",
      data: {
        session: getSessionDetails(appointment),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// POST /api/appointments/:id/session/start
// --------------------------------------------------
// Doctor starts the consultation.
// --------------------------------------------------

const startSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid appointment ID.",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Appointment not found.",
      });
    }

    // --------------------------------------------------
    // Only assigned doctor can start session
    // --------------------------------------------------

    const isAssignedDoctor =
      req.user.role === "doctor" &&
      appointment.doctor.toString() === req.user.userId;

    if (!isAssignedDoctor) {
      return errorResponse(res, {
        statusCode: 403,
        message: "Only the assigned doctor can start this consultation.",
      });
    }

    if (appointment.consultationType !== "video") {
      return errorResponse(res, {
        statusCode: 409,
        message: "This appointment is not configured for video consultation.",
      });
    }

    // --------------------------------------------------
    // Appointment must be confirmed
    // --------------------------------------------------

    if (appointment.status !== "confirmed") {
      return errorResponse(res, {
        statusCode: 409,
        message: "Only a confirmed appointment can start a consultation.",
      });
    }

    if (appointment.paymentStatus !== "paid") {
      return errorResponse(res, {
        statusCode: 409,
        message: "Payment must be completed before the consultation can start.",
      });
    }

    // --------------------------------------------------
    // Prevent starting an already active session
    // --------------------------------------------------

    if (appointment.sessionStatus === "active") {
      return errorResponse(res, {
        statusCode: 409,
        message: "The consultation session is already active.",
      });
    }

    // --------------------------------------------------
    // Prevent restarting ended session
    // --------------------------------------------------

    if (appointment.sessionStatus === "ended") {
      return errorResponse(res, {
        statusCode: 409,
        message: "This consultation session has already ended.",
      });
    }

    // --------------------------------------------------
    // Generate internal room identifier
    // --------------------------------------------------

    appointment.sessionRoomId =
      appointment.sessionRoomId || crypto.randomUUID();
    appointment.meetingUrl = buildMeetingUrl(appointment.sessionRoomId);
    appointment.sessionStatus = "active";
    appointment.sessionStartedAt = new Date();
    appointment.sessionEndedAt = undefined;

    await appointment.save();

    return successResponse(res, {
      statusCode: 200,
      message: "Consultation session started successfully.",
      data: {
        session: getSessionDetails(appointment),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// POST /api/appointments/:id/session/end
// --------------------------------------------------
// Doctor ends the consultation.
// --------------------------------------------------

const endSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid appointment ID.",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Appointment not found.",
      });
    }

    // --------------------------------------------------
    // Only assigned doctor can end session
    // --------------------------------------------------

    const isAssignedDoctor =
      req.user.role === "doctor" &&
      appointment.doctor.toString() === req.user.userId;

    if (!isAssignedDoctor) {
      return errorResponse(res, {
        statusCode: 403,
        message: "Only the assigned doctor can end this consultation.",
      });
    }

    // --------------------------------------------------
    // Session must be active
    // --------------------------------------------------

    if (appointment.sessionStatus !== "active") {
      return errorResponse(res, {
        statusCode: 409,
        message: "The consultation session is not active.",
      });
    }

    // --------------------------------------------------
    // End session
    // --------------------------------------------------

    appointment.sessionStatus = "ended";
    appointment.sessionEndedAt = new Date();

    // The appointment itself is completed when the
    // consultation session is explicitly ended.
    appointment.status = "completed";

    await appointment.save();

    return successResponse(res, {
      statusCode: 200,
      message: "Consultation session ended successfully.",
      data: {
        session: getSessionDetails(appointment),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export { getSession, startSession, endSession };
