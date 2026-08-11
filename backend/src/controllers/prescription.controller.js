import mongoose from "mongoose";

import Prescription from "../models/Prescription.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// --------------------------------------------------
// Helper: validate ObjectId
// --------------------------------------------------

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// --------------------------------------------------
// POST /api/prescriptions
// --------------------------------------------------
// Doctor creates a prescription for a patient.
//
// Critical rules:
// - Only doctors can create prescriptions.
// - Doctor must exist.
// - Patient must exist.
// - Appointment must exist.
// - Appointment must belong to this doctor.
// - Appointment must belong to this patient.
// - Appointment must be completed.
// - At least one medication is required.
// --------------------------------------------------

const createPrescription = async (req, res, next) => {
  try {
    const { patient, appointment, medications, notes } = req.body;

    // --------------------------------------------------
    // 1. Validate required fields
    // --------------------------------------------------

    if (!patient || !appointment || !medications) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Patient, appointment and medications are required.",
      });
    }

    // --------------------------------------------------
    // 2. Validate IDs
    // --------------------------------------------------

    if (!isValidObjectId(patient)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid patient ID.",
      });
    }

    if (!isValidObjectId(appointment)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid appointment ID.",
      });
    }

    // --------------------------------------------------
    // 3. Validate medications
    // --------------------------------------------------

    if (!Array.isArray(medications) || medications.length === 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: "At least one medication is required.",
      });
    }

    for (const medication of medications) {
      if (
        !medication.name ||
        !medication.dosage ||
        !medication.frequency ||
        !medication.duration
      ) {
        return errorResponse(res, {
          statusCode: 400,
          message:
            "Each medication requires name, dosage, frequency and duration.",
        });
      }
    }

    // --------------------------------------------------
    // 4. Verify patient exists and is actually a patient
    // --------------------------------------------------

    const patientUser = await User.findOne({
      _id: patient,
      role: "patient",
    });

    if (!patientUser) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Patient not found.",
      });
    }

    // --------------------------------------------------
    // 5. Verify appointment relationship
    // --------------------------------------------------

    const existingAppointment = await Appointment.findOne({
      _id: appointment,
      patient,
      doctor: req.user.userId,
    });

    if (!existingAppointment) {
      return errorResponse(res, {
        statusCode: 403,
        message:
          "You are not authorized to create a prescription for this patient.",
      });
    }

    // --------------------------------------------------
    // 6. Prescription only after completed consultation
    // --------------------------------------------------

    if (existingAppointment.status !== "completed") {
      return errorResponse(res, {
        statusCode: 400,
        message:
          "A prescription can only be created after the appointment is completed.",
      });
    }

    // --------------------------------------------------
    // 7. Prevent duplicate prescription for same appointment
    // --------------------------------------------------

    const existingPrescription = await Prescription.findOne({
      appointment,
    });

    if (existingPrescription) {
      return errorResponse(res, {
        statusCode: 409,
        message: "A prescription already exists for this appointment.",
      });
    }

    // --------------------------------------------------
    // 8. Create prescription
    // --------------------------------------------------

    const prescription = await Prescription.create({
      patient,
      doctor: req.user.userId,
      appointment,
      medications,
      notes,
    });

    // --------------------------------------------------
    // 9. Return populated prescription
    // --------------------------------------------------

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate("patient", "firstName lastName email")
      .populate("doctor", "firstName lastName email doctorProfile")
      .populate(
        "appointment",
        "date startTime endTime status consultationType",
      );

    return successResponse(res, {
      statusCode: 201,
      message: "Prescription created successfully.",
      data: {
        prescription: populatedPrescription,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// GET /api/prescriptions
// --------------------------------------------------
// Patient → own prescriptions
// Doctor  → prescriptions they created
// Admin   → all prescriptions
// --------------------------------------------------

const getPrescriptions = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === "patient") {
      query.patient = req.user.userId;
    }

    if (req.user.role === "doctor") {
      query.doctor = req.user.userId;
    }

    const prescriptions = await Prescription.find(query)
      .populate("patient", "firstName lastName email")
      .populate("doctor", "firstName lastName email doctorProfile")
      .populate("appointment", "date startTime endTime status consultationType")
      .sort({ createdAt: -1 });

    return successResponse(res, {
      statusCode: 200,
      message: "Prescriptions retrieved successfully.",
      data: {
        prescriptions,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// GET /api/prescriptions/:id
// --------------------------------------------------
// Patient → own prescription
// Doctor  → prescription they created
// Admin   → any prescription
// --------------------------------------------------

const getPrescriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid prescription ID.",
      });
    }

    const prescription = await Prescription.findById(id)
      .populate("patient", "firstName lastName email")
      .populate("doctor", "firstName lastName email doctorProfile")
      .populate(
        "appointment",
        "date startTime endTime status consultationType",
      );

    if (!prescription) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Prescription not found.",
      });
    }

    // --------------------------------------------------
    // Resource-level authorization
    // --------------------------------------------------

    const userId = req.user.userId;

    const isPatient =
      req.user.role === "patient" &&
      prescription.patient._id.toString() === userId;

    const isDoctor =
      req.user.role === "doctor" &&
      prescription.doctor._id.toString() === userId;

    const isAdmin = req.user.role === "admin";

    if (!isPatient && !isDoctor && !isAdmin) {
      return errorResponse(res, {
        statusCode: 403,
        message: "You are not authorized to access this prescription.",
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Prescription retrieved successfully.",
      data: {
        prescription,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// PATCH /api/prescriptions/:id
// --------------------------------------------------
// Doctor → can modify their own prescription.
// Patient → cannot modify.
// Admin → administrative modification.
//
// Keep modification intentionally limited.
// --------------------------------------------------

const updatePrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { medications, notes } = req.body;

    if (!isValidObjectId(id)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid prescription ID.",
      });
    }

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Prescription not found.",
      });
    }

    // --------------------------------------------------
    // Resource authorization
    // --------------------------------------------------

    const isOwnerDoctor =
      req.user.role === "doctor" &&
      prescription.doctor.toString() === req.user.userId;

    const isAdmin = req.user.role === "admin";

    if (!isOwnerDoctor && !isAdmin) {
      return errorResponse(res, {
        statusCode: 403,
        message: "You are not authorized to modify this prescription.",
      });
    }

    // --------------------------------------------------
    // Validate medications when provided
    // --------------------------------------------------

    if (medications !== undefined) {
      if (!Array.isArray(medications) || medications.length === 0) {
        return errorResponse(res, {
          statusCode: 400,
          message: "At least one medication is required.",
        });
      }

      for (const medication of medications) {
        if (
          !medication.name ||
          !medication.dosage ||
          !medication.frequency ||
          !medication.duration
        ) {
          return errorResponse(res, {
            statusCode: 400,
            message:
              "Each medication requires name, dosage, frequency and duration.",
          });
        }
      }

      prescription.medications = medications;
    }

    if (notes !== undefined) {
      prescription.notes = notes;
    }

    await prescription.save();

    const updatedPrescription = await Prescription.findById(prescription._id)
      .populate("patient", "firstName lastName email")
      .populate("doctor", "firstName lastName email doctorProfile")
      .populate(
        "appointment",
        "date startTime endTime status consultationType",
      );

    return successResponse(res, {
      statusCode: 200,
      message: "Prescription updated successfully.",
      data: {
        prescription: updatedPrescription,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription,
};
