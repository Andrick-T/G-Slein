import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { errorResponse } from "../utils/apiResponse.js";

const authenticate = async (req, res, next) => {
  try {
    // --------------------------------------------------
    // 1. Read Authorization header
    // --------------------------------------------------

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Authentication required.",
      });
    }

    // --------------------------------------------------
    // 2. Validate Bearer token format
    // --------------------------------------------------

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Invalid authorization header format.",
      });
    }

    // --------------------------------------------------
    // 3. Verify JWT
    // --------------------------------------------------

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // --------------------------------------------------
    // 4. Validate JWT payload
    // --------------------------------------------------

    if (!decoded.userId) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Invalid authentication token.",
      });
    }

    // --------------------------------------------------
    // 5. Retrieve authenticated user
    // --------------------------------------------------

    const user = await User.findById(decoded.userId);

    if (!user) {
      return errorResponse(res, {
        statusCode: 401,
        message: "User account no longer exists.",
      });
    }

    // --------------------------------------------------
    // 6. Attach authenticated user to request
    // --------------------------------------------------

    req.user = {
      userId: user._id.toString(),
      role: user.role,
    };

    // --------------------------------------------------
    // 7. Continue request
    // --------------------------------------------------

    next();
  } catch (error) {
    // --------------------------------------------------
    // JWT-specific errors
    // --------------------------------------------------

    if (error instanceof jwt.TokenExpiredError) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Authentication token has expired.",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Invalid authentication token.",
      });
    }

    return next(error);
  }
};

export default authenticate;
