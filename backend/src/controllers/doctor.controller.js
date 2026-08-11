import mongoose from "mongoose";

import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// --------------------------------------------------
// Safe doctor serializer
// --------------------------------------------------

const getSafeDoctor = (doctor) => {
  return {
    id: doctor._id,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    email: doctor.email,
    phone: doctor.phone,
    avatar: doctor.avatar,
    role: doctor.role,
    doctorProfile: doctor.doctorProfile,
    createdAt: doctor.createdAt,
    updatedAt: doctor.updatedAt,
  };
};

// --------------------------------------------------
// GET /api/doctors
// --------------------------------------------------

const getDoctors = async (req, res, next) => {
  try {
    const { specialization, name } = req.query;

    const filter = {
      role: "doctor",
    };

    // --------------------------------------------------
    // Specialization filter
    // --------------------------------------------------

    if (specialization !== undefined) {
      if (typeof specialization !== "string" || !specialization.trim()) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Specialization must be a non-empty string.",
        });
      }

      filter["doctorProfile.specialization"] = {
        $regex: specialization.trim(),
        $options: "i",
      };
    }

    // --------------------------------------------------
    // Name filter
    // --------------------------------------------------

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Name must be a non-empty string.",
        });
      }

      const nameRegex = {
        $regex: name.trim(),
        $options: "i",
      };

      filter.$or = [{ firstName: nameRegex }, { lastName: nameRegex }];
    }

    const doctors = await User.find(filter)
      .select(
        "firstName lastName email phone avatar role doctorProfile createdAt updatedAt",
      )
      .sort({
        firstName: 1,
        lastName: 1,
      });

    return successResponse(res, {
      statusCode: 200,
      message: "Doctors retrieved successfully.",
      data: {
        doctors: doctors.map(getSafeDoctor),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// GET /api/doctors/:id
// --------------------------------------------------

const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------
    // Validate MongoDB ObjectId
    // --------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Invalid doctor ID.",
      });
    }

    // --------------------------------------------------
    // Find doctor only
    // --------------------------------------------------

    const doctor = await User.findOne({
      _id: id,
      role: "doctor",
    }).select(
      "firstName lastName email phone avatar role doctorProfile createdAt updatedAt",
    );

    if (!doctor) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Doctor not found.",
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Doctor retrieved successfully.",
      data: {
        doctor: getSafeDoctor(doctor),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// PATCH /api/doctors/profile
// --------------------------------------------------

const updateDoctorProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        message: "User account not found.",
      });
    }

    // --------------------------------------------------
    // Ensure authenticated user is a doctor
    // --------------------------------------------------

    if (user.role !== "doctor") {
      return errorResponse(res, {
        statusCode: 403,
        message: "Only doctors can update doctor profiles.",
      });
    }

    const {
      firstName,
      lastName,
      phone,
      avatar,
      specialization,
      licenseNumber,
      experience,
      consultationFee,
      bio,
      languages,
      isVerified,
    } = req.body;

    // --------------------------------------------------
    // isVerified is administrative data
    // --------------------------------------------------

    if (isVerified !== undefined) {
      return errorResponse(res, {
        statusCode: 403,
        message: "Doctor verification status cannot be modified here.",
      });
    }

    // --------------------------------------------------
    // Common user fields
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
    // Doctor profile
    // --------------------------------------------------

    if (!user.doctorProfile) {
      user.doctorProfile = {};
    }

    if (specialization !== undefined) {
      if (typeof specialization !== "string" || !specialization.trim()) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Specialization must be a non-empty string.",
        });
      }

      user.doctorProfile.specialization = specialization.trim();
    }

    if (licenseNumber !== undefined) {
      if (typeof licenseNumber !== "string" || !licenseNumber.trim()) {
        return errorResponse(res, {
          statusCode: 400,
          message: "License number must be a non-empty string.",
        });
      }

      user.doctorProfile.licenseNumber = licenseNumber.trim();
    }

    if (experience !== undefined) {
      if (
        typeof experience !== "number" ||
        !Number.isFinite(experience) ||
        experience < 0
      ) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Experience must be a non-negative number.",
        });
      }

      user.doctorProfile.experience = experience;
    }

    if (consultationFee !== undefined) {
      if (
        typeof consultationFee !== "number" ||
        !Number.isFinite(consultationFee) ||
        consultationFee < 0
      ) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Consultation fee must be a non-negative number.",
        });
      }

      user.doctorProfile.consultationFee = consultationFee;
    }

    if (bio !== undefined) {
      if (bio !== null && typeof bio !== "string") {
        return errorResponse(res, {
          statusCode: 400,
          message: "Bio must be a string.",
        });
      }

      user.doctorProfile.bio = bio === null ? undefined : bio.trim();
    }

    if (languages !== undefined) {
      if (
        !Array.isArray(languages) ||
        languages.some((language) => typeof language !== "string")
      ) {
        return errorResponse(res, {
          statusCode: 400,
          message: "Languages must be an array of strings.",
        });
      }

      user.doctorProfile.languages = languages
        .map((language) => language.trim())
        .filter(Boolean);
    }

    // --------------------------------------------------
    // Save
    // --------------------------------------------------

    await user.save();

    return successResponse(res, {
      statusCode: 200,
      message: "Doctor profile updated successfully.",
      data: {
        doctor: getSafeDoctor(user),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export { getDoctors, getDoctorById, updateDoctorProfile };
