import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "rejected"],
      default: "pending",
    },

    consultationType: {
      type: String,
      enum: ["video"],
      default: "video",
    },

    // --------------------------------------------------
    // Consultation/session foundation
    // --------------------------------------------------

    meetingUrl: {
      type: String,
      trim: true,
    },

    sessionRoomId: {
      type: String,
      trim: true,
    },

    sessionStatus: {
      type: String,
      enum: ["not_started", "active", "ended"],
      default: "not_started",
    },

    sessionStartedAt: {
      type: Date,
    },

    sessionEndedAt: {
      type: Date,
    },

    reason: {
      type: String,
      trim: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

appointmentSchema.index({
  doctor: 1,
  date: 1,
  startTime: 1,
});

appointmentSchema.index({
  patient: 1,
  date: -1,
});

export default mongoose.model("Appointment", appointmentSchema);
