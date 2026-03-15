import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required for registration"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required for registration"],
      trim: true,
    },
    teamCode: {
      type: String,
      required: [true, "Team code is required"],
      trim: true,
    },
    isTeamLeader: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

RegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

if (mongoose.models.Registration) {
  delete mongoose.models.Registration;
}

export default mongoose.model("Registration", RegistrationSchema);
