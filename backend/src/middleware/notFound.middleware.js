import { errorResponse } from "../utils/apiResponse.js";

const notFoundMiddleware = (req, res) => {
  return errorResponse(res, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export default notFoundMiddleware;
