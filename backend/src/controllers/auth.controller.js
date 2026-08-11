import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

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
// POST /api/auth/register
// --------------------------------------------------

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // --------------------------------------------------
    // 1. Validate required fields
    // --------------------------------------------------

    if (!firstName || !lastName || !email || !password) {
      return errorResponse(res, {
        statusCode: 400,
        message: "First name, last name, email and password are required.",
      });
    }

    // --------------------------------------------------
    // 2. Normalize email
    // --------------------------------------------------

    const normalizedEmail = email.trim().toLowerCase();

    // --------------------------------------------------
    // 3. Basic password validation
    // --------------------------------------------------

    if (password.length < 8) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Password must be at least 8 characters long.",
      });
    }

    // --------------------------------------------------
    // 4. Check whether email already exists
    // --------------------------------------------------

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return errorResponse(res, {
        statusCode: 409,
        message: "Unable to register with the provided credentials.",
      });
    }

    // --------------------------------------------------
    // 5. Create patient account
    // --------------------------------------------------
    //
    // Public registration always creates a patient.
    //
    // Role, doctorProfile and patientProfile are deliberately
    // not accepted from the client to prevent privilege
    // escalation or unauthorized profile manipulation.
    //

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
      role: "patient",
      phone,
    });

    // --------------------------------------------------
    // 6. Return safe user data
    // --------------------------------------------------

    return successResponse(res, {
      statusCode: 201,
      message: "Registration successful.",
      data: {
        user: getSafeUser(user),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// POST /api/auth/login
// --------------------------------------------------

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // --------------------------------------------------
    // 1. Validate request
    // --------------------------------------------------

    if (!email || !password) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Email and password are required.",
      });
    }

    // --------------------------------------------------
    // 2. Normalize email
    // --------------------------------------------------

    const normalizedEmail = email.trim().toLowerCase();

    // --------------------------------------------------
    // 3. Retrieve user + password hash
    // --------------------------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    // --------------------------------------------------
    // 4. Handle unknown email
    // --------------------------------------------------

    if (!user) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Invalid email or password.",
      });
    }

    // --------------------------------------------------
    // 5. Compare password
    // --------------------------------------------------

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Invalid email or password.",
      });
    }

    // --------------------------------------------------
    // 6. Generate JWT
    // --------------------------------------------------

    const token = createToken(user);

    // --------------------------------------------------
    // 7. Return authentication result
    // --------------------------------------------------

    return successResponse(res, {
      statusCode: 200,
      message: "Login successful.",
      data: {
        user: getSafeUser(user),
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------------------
// GET /api/auth/me
// --------------------------------------------------

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return errorResponse(res, {
        statusCode: 401,
        message: "User account no longer exists.",
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Current user retrieved successfully.",
      data: {
        user: getSafeUser(user),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export { register, login, getCurrentUser };
