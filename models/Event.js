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
    isOver: {
      type: Boolean,
      default: false,
    },
    pointsPerAttendance: {
      type: Number,
      default: 10,
    },
    description: {
      type: String,
      default: "",
    },
    poster: {
      type: String,
      default: "/Events/Icons/event1.png",
    },
    minMembers: {
      type: Number,
      default: 1,
    },
    maxMembers: {
      type: Number,
      default: 1,
    },
    badgeIcon: {
      type: String,
      default: "",
    },
    winnerBadge1: {
      type: String,
      default: "",
    },
    winnerBadge2: {
      type: String,
      default: "",
    },
    winnerBadge3: {
      type: String,
      default: "",
    },
    isRegistrationLive: {
      type: Boolean,
      default: false,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Add indexes for faster queries
EventSchema.index({ isHidden: 1, eventDate: 1 }); // Most common query pattern
EventSchema.index({ isOver: 1, eventDate: 1 }); // For filtering past/upcoming events
EventSchema.index({ isHidden: 1, isOver: 1, eventDate: 1 }); // Exact match for profile upcoming-events query
EventSchema.index({ eventName: 1 }); // For event lookups by name
EventSchema.index({ isHidden: 1 }); // Filter non-hidden events

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

if (mongoose.models.Event) {
  delete mongoose.models.Event;
}

export default mongoose.model("Event", EventSchema);
