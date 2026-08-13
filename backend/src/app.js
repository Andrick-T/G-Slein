import express from "express";
import cors from "cors";

import apiRoutes from "./routes/index.js";
import notFoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

// --------------------------------------------------
// Global middleware
// --------------------------------------------------

app.use(cors());
app.use(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// Root endpoint
// --------------------------------------------------

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "G-Slein v1 API is running.",
  });
});

// --------------------------------------------------
// API routes
// --------------------------------------------------

app.use("/api", apiRoutes);

// --------------------------------------------------
// 404 handler
// --------------------------------------------------

app.use(notFoundMiddleware);

// --------------------------------------------------
// Global error handler
// --------------------------------------------------

app.use(errorMiddleware);

export default app;
