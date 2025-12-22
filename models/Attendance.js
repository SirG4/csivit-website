import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    eventKey: {
      type: String,
      required: [true, "Event key is required"],
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: one attendance per user per event
AttendanceSchema.index({ userId: 1, eventKey: 1 }, { unique: true });

export default mongoose.models.Attendance ||
  mongoose.model("Attendance", AttendanceSchema);
