import mongoose from "mongoose";

import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const isValidDate = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const normalizeTime = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const time = value.trim();

  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return null;
  }

  return time;
};

const getAppointmentDetails = (appointment) => {
  return {
    id: appointment._id,
    patient: appointment.patient,
    doctor: appointment.doctor,
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    status: appointment.status,
    consultationType: appointment.consultationType,
    meetingUrl: appointment.meetingUrl,
    sessionRoomId: appointment.sessionRoomId,
    sessionStatus: appointment.sessionStatus,
    sessionStartedAt: appointment.sessionStartedAt,
    sessionEndedAt: appointment.sessionEndedAt,
    reason: appointment.reason,
    paymentStatus: appointment.paymentStatus,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
  };
};

// --------------------------------------------------
// POST /api/appointments
// Patient books an appointment
// --------------------------------------------------

const createAppointment = async (req, res, next) => {
  try {
    const { doctor, date, startTime, endTime, consultationType, reason } =
      req.body;

    // --------------------------------------------------
    // Validate doctor ID
    // --------------------------------------------------

    if (!doctor || !isValidObjectId(doctor)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "A valid doctor ID is required.",
      });
    }

    // --------------------------------------------------
    // Validate date
    // --------------------------------------------------

    if (!date || !isValidDate(date)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "A valid appointment date is required.",
      });
    }

    // --------------------------------------------------
    // Validate time
    // --------------------------------------------------

    const normalizedStartTime = normalizeTime(startTime);
    const normalizedEndTime = normalizeTime(endTime);

    if (!normalizedStartTime || !normalizedEndTime) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Start time and end time must use HH:mm format.",
      });
    }

    if (normalizedStartTime >= normalizedEndTime) {
      return errorResponse(res, {
        statusCode: 400,
        message: "End time must be later than start time.",
      });
    }

    // --------------------------------------------------
    // Validate consultation type
    // --------------------------------------------------

    if (consultationType !== undefined && consultationType !== "video") {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid consultation type.",
      });
    }

    // --------------------------------------------------
    // Verify doctor exists and is actually a doctor
    // --------------------------------------------------

    const doctorUser = await User.findOne({
      _id: doctor,
      role: "doctor",
    }).select("_id");

    if (!doctorUser) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Doctor not found.",
      });
    }

    // --------------------------------------------------
    // Prevent overlapping appointment for doctor
    // --------------------------------------------------

    const appointmentDate = new Date(date);

    const existingAppointments = await Appointment.find({
      doctor: doctorUser._id,
      date: appointmentDate,
      status: {
        $in: ["pending", "confirmed"],
      },
    }).select("startTime endTime");

    const hasOverlap = existingAppointments.some((appointment) => {
      return (
        normalizedStartTime < appointment.endTime &&
        normalizedEndTime > appointment.startTime
      );
    });

    if (hasOverlap) {
      return errorResponse(res, {
        statusCode: 409,
        message: "The doctor is not available during the selected time.",
      });
    }

    // --------------------------------------------------
    // Create appointment
    // --------------------------------------------------

    const appointment = await Appointment.create({
      patient: req.user.userId,
      doctor: doctorUser._id,
      date: appointmentDate,
      startTime: normalizedStartTime,
      endTime: normalizedEndTime,
      status: "pending",
      consultationType: consultationType || "video",
      reason: typeof reason === "string" ? reason.trim() : undefined,
      paymentStatus: "pending",
    });

    return successResponse(res, {
      statusCode: 201,
      message:
        "Appointment created. Complete payment to confirm your consultation.",
      data: {
        appointment: getAppointmentDetails(appointment),
        paymentRequired: appointment.paymentStatus !== "paid",
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// GET /api/appointments
// --------------------------------------------------

const getAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = {};

    // --------------------------------------------------
    // Patient → own appointments only
    // Doctor → own appointments only
    // Admin → all appointments
    // --------------------------------------------------

    if (req.user.role === "patient") {
      filter.patient = req.user.userId;
    }

    if (req.user.role === "doctor") {
      filter.doctor = req.user.userId;
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "rejected",
      ];

      if (!allowedStatuses.includes(status)) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Invalid appointment status.",
        });
      }

      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate("patient", "firstName lastName email phone avatar")
      .populate("doctor", "firstName lastName email phone avatar doctorProfile")
      .sort({
        date: 1,
        startTime: 1,
      });

    return successResponse(res, {
      statusCode: 200,
      message: "Appointments retrieved successfully.",
      data: {
        appointments,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// GET /api/appointments/:id
// --------------------------------------------------

const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid appointment ID.",
      });
    }

    const appointment = await Appointment.findById(id)
      .populate("patient", "firstName lastName email phone avatar")
      .populate(
        "doctor",
        "firstName lastName email phone avatar doctorProfile",
      );

    if (!appointment) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Appointment not found.",
      });
    }

    // --------------------------------------------------
    // Resource-level authorization
    // --------------------------------------------------

    const isPatient =
      req.user.role === "patient" &&
      appointment.patient._id.toString() === req.user.userId;

    const isDoctor =
      req.user.role === "doctor" &&
      appointment.doctor._id.toString() === req.user.userId;

    const isAdmin = req.user.role === "admin";

    if (!isPatient && !isDoctor && !isAdmin) {
      return errorResponse(res, {
        statusCode: 403,
        message: "You do not have access to this appointment.",
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Appointment retrieved successfully.",
      data: {
        appointment,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// PATCH /api/appointments/:id
// --------------------------------------------------

const updateAppointment = async (req, res, next) => {
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

    const { status } = req.body;

    const isPatient =
      req.user.role === "patient" &&
      appointment.patient.toString() === req.user.userId;

    const isDoctor =
      req.user.role === "doctor" &&
      appointment.doctor.toString() === req.user.userId;

    const isAdmin = req.user.role === "admin";

    if (!isPatient && !isDoctor && !isAdmin) {
      return errorResponse(res, {
        statusCode: 403,
        message: "You do not have access to this appointment.",
      });
    }

    // --------------------------------------------------
    // Only status updates are allowed here.
    // --------------------------------------------------

    const protectedFields = [
      "patient",
      "doctor",
      "date",
      "startTime",
      "endTime",
      "consultationType",
      "paymentStatus",
      "meetingUrl",
    ];

    const attemptedProtectedField = protectedFields.some(
      (field) => req.body[field] !== undefined,
    );

    if (attemptedProtectedField) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Only appointment status can be updated here.",
      });
    }

    if (status === undefined) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Appointment status is required.",
      });
    }

    const allowedStatuses = [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid appointment status.",
      });
    }

    // --------------------------------------------------
    // State transition rules
    // --------------------------------------------------

    const currentStatus = appointment.status;

    // Patient can only cancel own appointment.
    if (isPatient) {
      if (status !== "cancelled") {
        return errorResponse(res, {
          statusCode: 403,
          message: "Patients can only cancel their appointments.",
        });
      }

      if (!["pending", "confirmed"].includes(currentStatus)) {
        return errorResponse(res, {
          statusCode: 409,
          message: "This appointment cannot be cancelled.",
        });
      }
    }

    // Doctor can confirm, reject, complete, or cancel.
    if (isDoctor) {
      const allowedDoctorTransitions = {
        pending: ["confirmed", "rejected", "cancelled"],
        confirmed: ["completed", "cancelled"],
        completed: [],
        cancelled: [],
        rejected: [],
      };

      if (!allowedDoctorTransitions[currentStatus]?.includes(status)) {
        return errorResponse(res, {
          statusCode: 409,
          message: `Appointment cannot transition from ${currentStatus} to ${status}.`,
        });
      }
    }

    // Admin may manage appointment state, but cannot resurrect
    // completed/cancelled/rejected appointments.
    if (isAdmin) {
      if (["completed", "cancelled", "rejected"].includes(currentStatus)) {
        return errorResponse(res, {
          statusCode: 409,
          message: `Appointment cannot transition from ${currentStatus} to ${status}.`,
        });
      }
    }

    appointment.status = status;

    await appointment.save();

    return successResponse(res, {
      statusCode: 200,
      message: "Appointment updated successfully.",
      data: {
        appointment: getAppointmentDetails(appointment),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// DELETE /api/appointments/:id
// --------------------------------------------------

const deleteAppointment = async (req, res, next) => {
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

    const isPatient =
      req.user.role === "patient" &&
      appointment.patient.toString() === req.user.userId;

    const isAdmin = req.user.role === "admin";

    if (!isPatient && !isAdmin) {
      return errorResponse(res, {
        statusCode: 403,
        message: "You do not have permission to delete this appointment.",
      });
    }

    // --------------------------------------------------
    // Do not physically delete active/completed appointments.
    // --------------------------------------------------

    if (!["cancelled", "rejected"].includes(appointment.status)) {
      return errorResponse(res, {
        statusCode: 409,
        message: "Only cancelled or rejected appointments can be deleted.",
      });
    }

    await appointment.deleteOne();

    return successResponse(res, {
      statusCode: 200,
      message: "Appointment deleted successfully.",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};

export {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};
