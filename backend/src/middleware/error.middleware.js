import { errorResponse } from "../utils/apiResponse.js";

const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  return errorResponse(res, {
    statusCode,
    message: statusCode === 500 ? "Internal server error" : err.message,
  });
};

export default errorMiddleware;
