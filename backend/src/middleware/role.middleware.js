import { errorResponse } from "../utils/apiResponse.js";

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // --------------------------------------------------
    // 1. Ensure authentication middleware ran first
    // --------------------------------------------------

    if (!req.user) {
      return errorResponse(res, {
        statusCode: 401,
        message: "Authentication required.",
      });
    }

    // --------------------------------------------------
    // 2. Validate configured roles
    // --------------------------------------------------

    if (allowedRoles.length === 0) {
      return errorResponse(res, {
        statusCode: 500,
        message: "No authorization roles configured.",
      });
    }

    // --------------------------------------------------
    // 3. Check whether user's role is allowed
    // --------------------------------------------------

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, {
        statusCode: 403,
        message: "You do not have permission to perform this action.",
      });
    }

    // --------------------------------------------------
    // 4. Authorization successful
    // --------------------------------------------------

    next();
  };
};

export default authorizeRoles;
