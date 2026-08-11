import mongoose from "mongoose";
import MedicalRecord from "../models/MedicalRecord.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// --------------------------------------------------
// Helper: validate MongoDB ObjectId
// --------------------------------------------------

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// --------------------------------------------------
// Helper: verify doctor-patient relationship
// --------------------------------------------------
//
// A doctor is considered authorized to access a patient's
// medical history if they have an appointment relationship
// with that patient.
//
// We deliberately do not require the appointment to be
// currently active. Historical completed consultations still
// establish a legitimate doctor-patient relationship.
// Cancelled/rejected appointments do not.
//
// --------------------------------------------------

const doctorHasPatientRelationship = async (doctorId, patientId) => {
  const appointment = await Appointment.findOne({
    doctor: doctorId,
    patient: patientId,
    status: { $nin: ["cancelled", "rejected"] },
  }).select("_id");

  return Boolean(appointment);
};

// --------------------------------------------------
// POST /api/medical-records
// --------------------------------------------------
//
// Patient:
//   Can upload a document for themselves.
//
// Doctor:
//   Can upload a document for a patient they legitimately
//   treat.
//
// Admin:
//   Can upload/manage records administratively.
//
// --------------------------------------------------

const createMedicalRecord = async (req, res, next) => {
  try {
    const { patient, title, description, fileUrl, fileName, fileType } =
      req.body;

    // --------------------------------------------------
    // 1. Validate required fields
    // --------------------------------------------------

    if (!title || !fileUrl || !fileName || !fileType) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Title, file URL, file name and file type are required.",
      });
    }

    // --------------------------------------------------
    // 2. Determine target patient
    // --------------------------------------------------

    let patientId = req.user.userId;

    // A patient can only create a record for themselves.
    if (req.user.role === "patient") {
      if (patient && patient !== req.user.userId) {
        return errorResponse(res, {
          statusCode: 403,
          message:
            "You are not allowed to create a medical record for another patient.",
        });
      }
    }

    // Doctors/admins may specify a patient.
    if (req.user.role === "doctor" || req.user.role === "admin") {
      if (!patient) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Patient ID is required.",
        });
      }

      patientId = patient;
    }

    // --------------------------------------------------
    // 3. Validate patient ID
    // --------------------------------------------------

    if (!isValidObjectId(patientId)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid patient ID.",
      });
    }

    // --------------------------------------------------
    // 4. Verify patient exists and is actually a patient
    // --------------------------------------------------

    const targetPatient = await User.findOne({
      _id: patientId,
      role: "patient",
    }).select("_id");

    if (!targetPatient) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Patient not found.",
      });
    }

    // --------------------------------------------------
    // 5. Verify doctor-patient relationship
    // --------------------------------------------------

    if (req.user.role === "doctor") {
      const hasRelationship = await doctorHasPatientRelationship(
        req.user.userId,
        patientId,
      );

      if (!hasRelationship) {
        return errorResponse(res, {
          statusCode: 403,
          message:
            "You are not authorized to create a medical record for this patient.",
        });
      }
    }

    // --------------------------------------------------
    // 6. Create medical record
    // --------------------------------------------------

    const medicalRecord = await MedicalRecord.create({
      patient: patientId,
      title: title.trim(),
      description: description?.trim(),
      fileUrl: fileUrl.trim(),
      fileName: fileName.trim(),
      fileType: fileType.trim(),
      uploadedBy: req.user.userId,
    });

    // --------------------------------------------------
    // 7. Return created record
    // --------------------------------------------------

    return successResponse(res, {
      statusCode: 201,
      message: "Medical record created successfully.",
      data: {
        medicalRecord,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// GET /api/medical-records
// --------------------------------------------------
//
// Patient:
//   Returns own medical history.
//
// Doctor:
//   Requires ?patientId=...
//   Returns complete history of authorized patient.
//
// Admin:
//   Requires ?patientId=...
//
// --------------------------------------------------

const getMedicalRecords = async (req, res, next) => {
  try {
    let patientId = req.user.userId;

    // --------------------------------------------------
    // 1. Determine target patient
    // --------------------------------------------------

    if (req.user.role === "patient") {
      if (req.query.patientId && req.query.patientId !== req.user.userId) {
        return errorResponse(res, {
          statusCode: 403,
          message:
            "You are not allowed to access another patient's medical records.",
        });
      }
    } else {
      if (!req.query.patientId) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Patient ID is required.",
        });
      }

      patientId = req.query.patientId;
    }

    // --------------------------------------------------
    // 2. Validate patient ID
    // --------------------------------------------------

    if (!isValidObjectId(patientId)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid patient ID.",
      });
    }

    // --------------------------------------------------
    // 3. Verify target patient exists
    // --------------------------------------------------

    const targetPatient = await User.findOne({
      _id: patientId,
      role: "patient",
    }).select("_id");

    if (!targetPatient) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Patient not found.",
      });
    }

    // --------------------------------------------------
    // 4. Verify doctor relationship
    // --------------------------------------------------

    if (req.user.role === "doctor") {
      const hasRelationship = await doctorHasPatientRelationship(
        req.user.userId,
        patientId,
      );

      if (!hasRelationship) {
        return errorResponse(res, {
          statusCode: 403,
          message:
            "You are not authorized to access this patient's medical records.",
        });
      }
    }

    // --------------------------------------------------
    // 5. Retrieve complete patient history
    // --------------------------------------------------

    const medicalRecords = await MedicalRecord.find({
      patient: patientId,
    })
      .sort({ createdAt: -1 })
      .lean();

    // --------------------------------------------------
    // 6. Return records
    // --------------------------------------------------

    return successResponse(res, {
      statusCode: 200,
      message: "Medical records retrieved successfully.",
      data: {
        medicalRecords,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// GET /api/medical-records/:id
// --------------------------------------------------

const getMedicalRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------
    // 1. Validate record ID
    // --------------------------------------------------

    if (!isValidObjectId(id)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid medical record ID.",
      });
    }

    // --------------------------------------------------
    // 2. Retrieve record
    // --------------------------------------------------

    const medicalRecord = await MedicalRecord.findById(id).lean();

    if (!medicalRecord) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Medical record not found.",
      });
    }

    const patientId = medicalRecord.patient.toString();

    // --------------------------------------------------
    // 3. Patient access
    // --------------------------------------------------

    if (req.user.role === "patient") {
      if (patientId !== req.user.userId) {
        return errorResponse(res, {
          statusCode: 403,
          message: "You are not allowed to access this medical record.",
        });
      }
    }

    // --------------------------------------------------
    // 4. Doctor access
    // --------------------------------------------------

    if (req.user.role === "doctor") {
      const hasRelationship = await doctorHasPatientRelationship(
        req.user.userId,
        patientId,
      );

      if (!hasRelationship) {
        return errorResponse(res, {
          statusCode: 403,
          message: "You are not authorized to access this medical record.",
        });
      }
    }

    // --------------------------------------------------
    // 5. Admin access
    // --------------------------------------------------

    // Admins are allowed to access records for administrative
    // purposes. No additional relationship check is required.

    return successResponse(res, {
      statusCode: 200,
      message: "Medical record retrieved successfully.",
      data: {
        medicalRecord,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export { createMedicalRecord, getMedicalRecords, getMedicalRecordById };
