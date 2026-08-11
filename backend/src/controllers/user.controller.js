import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// --------------------------------------------------
// Safe user serializer
// --------------------------------------------------

const getSafeUser = (user) => {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    doctorProfile: user.doctorProfile,
    patientProfile: user.patientProfile,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// --------------------------------------------------
// GET /api/users/me
// --------------------------------------------------

const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: "User account not found.",
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Profile retrieved successfully.",
      data: {
        user: getSafeUser(user),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// PATCH /api/users/me
// --------------------------------------------------

const updateMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: "User account not found.",
      });
    }

    const {
      firstName,
      lastName,
      phone,
      avatar,
      doctorProfile,
      patientProfile,
      role,
      password,
      email,
    } = req.body;

    // --------------------------------------------------
    // 1. Block protected account fields
    // --------------------------------------------------

    if (role !== undefined || password !== undefined || email !== undefined) {
      return errorResponse(res, {
        statusCode: 400,
        message:
          "Role, password and email cannot be modified through profile update.",
      });
    }

    // --------------------------------------------------
    // 2. Update common profile fields
    // --------------------------------------------------

    if (firstName !== undefined) {
      if (typeof firstName !== "string" || !firstName.trim()) {
        return errorResponse(res, {
          statusCode: 400,
          message: "First name must be a non-empty string.",
        });
      }

      user.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      if (typeof lastName !== "string" || !lastName.trim()) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Last name must be a non-empty string.",
        });
      }

      user.lastName = lastName.trim();
    }

    if (phone !== undefined) {
      if (phone !== null && typeof phone !== "string") {
        return errorResponse(res, {
          statusCode: 400,
          message: "Phone must be a string.",
        });
      }

      user.phone = phone === null ? undefined : phone.trim();
    }

    if (avatar !== undefined) {
      if (avatar !== null && typeof avatar !== "string") {
        return errorResponse(res, {
          statusCode: 400,
          message: "Avatar must be a string.",
        });
      }

      user.avatar = avatar === null ? undefined : avatar.trim();
    }

    // --------------------------------------------------
    // 3. Doctor profile updates
    // --------------------------------------------------

    if (doctorProfile !== undefined) {
      if (user.role !== "doctor") {
        return errorResponse(res, {
          statusCode: 403,
          message: "Only doctors can update doctor profile information.",
        });
      }

      if (
        typeof doctorProfile !== "object" ||
        Array.isArray(doctorProfile) ||
        doctorProfile === null
      ) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Doctor profile must be an object.",
        });
      }

      const allowedDoctorFields = [
        "specialization",
        "licenseNumber",
        "experience",
        "consultationFee",
        "bio",
        "languages",
      ];

      const receivedDoctorFields = Object.keys(doctorProfile);

      const hasInvalidField = receivedDoctorFields.some(
        (field) => !allowedDoctorFields.includes(field),
      );

      if (hasInvalidField) {
        return errorResponse(res, {
          statusCode: 400,
          message: "One or more doctor profile fields are not permitted.",
        });
      }

      if (!user.doctorProfile) {
        user.doctorProfile = {};
      }

      if (doctorProfile.specialization !== undefined) {
        if (
          typeof doctorProfile.specialization !== "string" ||
          !doctorProfile.specialization.trim()
        ) {
          return errorResponse(res, {
            statusCode: 400,
            message: "Specialization must be a non-empty string.",
          });
        }

        user.doctorProfile.specialization = doctorProfile.specialization.trim();
      }

      if (doctorProfile.licenseNumber !== undefined) {
        if (
          typeof doctorProfile.licenseNumber !== "string" ||
          !doctorProfile.licenseNumber.trim()
        ) {
          return errorResponse(res, {
            statusCode: 400,
            message: "License number must be a non-empty string.",
          });
        }

        user.doctorProfile.licenseNumber = doctorProfile.licenseNumber.trim();
      }

      if (doctorProfile.experience !== undefined) {
        if (
          typeof doctorProfile.experience !== "number" ||
          !Number.isFinite(doctorProfile.experience) ||
          doctorProfile.experience < 0
        ) {
          return errorResponse(res, {
            statusCode: 400,
            message: "Experience must be a non-negative number.",
          });
        }

        user.doctorProfile.experience = doctorProfile.experience;
      }

      if (doctorProfile.consultationFee !== undefined) {
        if (
          typeof doctorProfile.consultationFee !== "number" ||
          !Number.isFinite(doctorProfile.consultationFee) ||
          doctorProfile.consultationFee < 0
        ) {
          return errorResponse(res, {
            statusCode: 400,
            message: "Consultation fee must be a non-negative number.",
          });
        }

        user.doctorProfile.consultationFee = doctorProfile.consultationFee;
      }

      if (doctorProfile.bio !== undefined) {
        if (
          doctorProfile.bio !== null &&
          typeof doctorProfile.bio !== "string"
        ) {
          return errorResponse(res, {
            statusCode: 400,
            message: "Bio must be a string.",
          });
        }

        user.doctorProfile.bio =
          doctorProfile.bio === null ? undefined : doctorProfile.bio.trim();
      }

      if (doctorProfile.languages !== undefined) {
        if (
          !Array.isArray(doctorProfile.languages) ||
          doctorProfile.languages.some(
            (language) => typeof language !== "string",
          )
        ) {
          return errorResponse(res, {
            statusCode: 400,
            message: "Languages must be an array of strings.",
          });
        }

        user.doctorProfile.languages = doctorProfile.languages
          .map((language) => language.trim())
          .filter(Boolean);
      }
    }

    // --------------------------------------------------
    // 4. Patient profile updates
    // --------------------------------------------------

    if (patientProfile !== undefined) {
      if (user.role !== "patient") {
        return errorResponse(res, {
          statusCode: 403,
          message: "Only patients can update patient profile information.",
        });
      }

      if (
        typeof patientProfile !== "object" ||
        Array.isArray(patientProfile) ||
        patientProfile === null
      ) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Patient profile must be an object.",
        });
      }

      const allowedPatientFields = [
        "dateOfBirth",
        "gender",
        "bloodGroup",
        "allergies",
        "emergencyContact",
      ];

      const receivedPatientFields = Object.keys(patientProfile);

      const hasInvalidField = receivedPatientFields.some(
        (field) => !allowedPatientFields.includes(field),
      );

      if (hasInvalidField) {
        return errorResponse(res, {
          statusCode: 400,
          message: "One or more patient profile fields are not permitted.",
        });
      }

      if (!user.patientProfile) {
        user.patientProfile = {};
      }

      if (patientProfile.dateOfBirth !== undefined) {
        const date = new Date(patientProfile.dateOfBirth);

        if (Number.isNaN(date.getTime())) {
          return errorResponse(res, {
            statusCode: 400,
            message: "Invalid date of birth.",
          });
        }

        user.patientProfile.dateOfBirth = date;
      }

      if (patientProfile.gender !== undefined) {
        if (!["male", "female", "other"].includes(patientProfile.gender)) {
          return errorResponse(res, {
            statusCode: 400,
            message: "Gender must be male, female or other.",
          });
        }

        user.patientProfile.gender = patientProfile.gender;
      }

      if (patientProfile.bloodGroup !== undefined) {
        if (
          patientProfile.bloodGroup !== null &&
          typeof patientProfile.bloodGroup !== "string"
        ) {
          return errorResponse(res, {
            statusCode: 400,
            message: "Blood group must be a string.",
          });
        }

        user.patientProfile.bloodGroup =
          patientProfile.bloodGroup === null
            ? undefined
            : patientProfile.bloodGroup.trim();
      }

      if (patientProfile.allergies !== undefined) {
        if (
          !Array.isArray(patientProfile.allergies) ||
          patientProfile.allergies.some(
            (allergy) => typeof allergy !== "string",
          )
        ) {
          return errorResponse(res, {
            statusCode: 400,
            message: "Allergies must be an array of strings.",
          });
        }

        user.patientProfile.allergies = patientProfile.allergies
          .map((allergy) => allergy.trim())
          .filter(Boolean);
      }

      if (patientProfile.emergencyContact !== undefined) {
        if (
          typeof patientProfile.emergencyContact !== "object" ||
          Array.isArray(patientProfile.emergencyContact) ||
          patientProfile.emergencyContact === null
        ) {
          return errorResponse(res, {
            statusCode: 400,
            message: "Emergency contact must be an object.",
          });
        }

        const allowedEmergencyFields = ["name", "phone", "relationship"];

        const receivedEmergencyFields = Object.keys(
          patientProfile.emergencyContact,
        );

        const hasInvalidEmergencyField = receivedEmergencyFields.some(
          (field) => !allowedEmergencyFields.includes(field),
        );

        if (hasInvalidEmergencyField) {
          return errorResponse(res, {
            statusCode: 400,
            message: "One or more emergency contact fields are not permitted.",
          });
        }

        if (
          patientProfile.emergencyContact.name !== undefined &&
          typeof patientProfile.emergencyContact.name !== "string"
        ) {
          return errorResponse(res, {
            statusCode: 400,
            message: "Emergency contact name must be a string.",
          });
        }

        if (
          patientProfile.emergencyContact.phone !== undefined &&
          typeof patientProfile.emergencyContact.phone !== "string"
        ) {
          return errorResponse(res, {
            statusCode: 400,
            message: "Emergency contact phone must be a string.",
          });
        }

        if (
          patientProfile.emergencyContact.relationship !== undefined &&
          typeof patientProfile.emergencyContact.relationship !== "string"
        ) {
          return errorResponse(res, {
            statusCode: 400,
            message: "Emergency contact relationship must be a string.",
          });
        }

        if (!user.patientProfile.emergencyContact) {
          user.patientProfile.emergencyContact = {};
        }

        if (patientProfile.emergencyContact.name !== undefined) {
          user.patientProfile.emergencyContact.name =
            patientProfile.emergencyContact.name.trim();
        }

        if (patientProfile.emergencyContact.phone !== undefined) {
          user.patientProfile.emergencyContact.phone =
            patientProfile.emergencyContact.phone.trim();
        }

        if (patientProfile.emergencyContact.relationship !== undefined) {
          user.patientProfile.emergencyContact.relationship =
            patientProfile.emergencyContact.relationship.trim();
        }
      }
    }

    // --------------------------------------------------
    // 5. Save validated changes
    // --------------------------------------------------

    await user.save();

    // --------------------------------------------------
    // 6. Return safe profile
    // --------------------------------------------------

    return successResponse(res, {
      statusCode: 200,
      message: "Profile updated successfully.",
      data: {
        user: getSafeUser(user),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export { getMyProfile, updateMyProfile };
