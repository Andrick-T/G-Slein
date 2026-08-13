import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
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

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "XAF",
      uppercase: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "refunded"],
      default: "pending",
    },

    provider: {
      type: String,
      enum: ["simulated", "stripe"],
      default: "stripe",
    },

    transactionId: {
      type: String,
      trim: true,
    },

    transactionReference: {
      type: String,
      trim: true,
    },

    providerPaymentId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({
  patient: 1,
  createdAt: -1,
});

export default mongoose.model("Payment", paymentSchema);
