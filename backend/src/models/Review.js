import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
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
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index(
  {
    patient: 1,
    appointment: 1,
  },
  {
    unique: true,
  },
);

reviewSchema.index({
  doctor: 1,
  createdAt: -1,
});

export default mongoose.model("Review", reviewSchema);
