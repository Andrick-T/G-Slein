import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const doctorProfileSchema = new mongoose.Schema(
  {
    specialization: {
      type: String,
      trim: true,
    },

    licenseNumber: {
      type: String,
      trim: true,
    },

    experience: {
      type: Number,
      min: 0,
    },

    consultationFee: {
      type: Number,
      min: 0,
    },

    bio: {
      type: String,
      trim: true,
    },

    languages: {
      type: [String],
      default: [],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const patientProfileSchema = new mongoose.Schema(
  {
    dateOfBirth: Date,

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    bloodGroup: String,

    allergies: {
      type: [String],
      default: [],
    },

    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },

    phone: {
      type: String,
      trim: true,
    },

    avatar: {
      type: String,
    },

    doctorProfile: doctorProfileSchema,

    patientProfile: patientProfileSchema,
  },
  {
    timestamps: true,
  },
);

// --------------------------------------------------
// Password hashing
// --------------------------------------------------

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

// --------------------------------------------------
// Password comparison
// --------------------------------------------------

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
