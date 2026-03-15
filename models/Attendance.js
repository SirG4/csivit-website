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
      type: String, // Keeping for legacy/general display
      default: null,
    },
    participationBadge: {
      type: String, // Specifically for the event attendance base64
      default: null,
    },
    milestoneBadge: {
      type: String, // Specifically for Level/Gamification name (Rookie, etc)
      default: null,
    },
    prizeBadge: {
      type: String, // Specifically for the Prize base64
      default: null,
    },
    prizeName: {
      type: String, // Prize rank title (1st Prize, etc)
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

if (mongoose.models.Attendance) {
  delete mongoose.models.Attendance;
}

export default mongoose.model("Attendance", AttendanceSchema);
