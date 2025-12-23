import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
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
    eventKey: {
      type: String,
      required: [true, "Event key is required"],
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
    badgeEarned: {
      type: String,
      default: null,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

AttendanceSchema.index({ userId: 1, eventId: 1 }, { unique: true });
AttendanceSchema.index({ userId: 1, eventKey: 1 }, { unique: true });

export default mongoose.models.Attendance ||
  mongoose.model("Attendance", AttendanceSchema);
