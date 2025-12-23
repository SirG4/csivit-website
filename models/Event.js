import mongoose from "mongoose";
import crypto from "crypto";

const EventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, "Please provide an event name"],
      trim: true,
    },
    eventDate: {
      type: Date,
      required: [true, "Please provide an event date"],
    },
    eventKey: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    pointsPerAttendance: {
      type: Number,
      default: 10,
    },
    description: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

EventSchema.pre("save", async function () {
  if (!this.eventKey) {
    let eventKey;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      eventKey = crypto.randomBytes(8).toString("hex");
      const existingEvent = await mongoose.models.Event?.findOne({
        eventKey,
      });
      if (!existingEvent) {
        isUnique = true;
      }
      attempts++;
    }

    if (isUnique) {
      this.eventKey = eventKey;
    }
  }
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
