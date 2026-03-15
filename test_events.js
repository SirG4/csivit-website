const fs = require("fs");
const mongoose = require("mongoose");

const env = fs.readFileSync(".env.local", "utf8");
let mongoUri = "";
for (const line of env.split("\n")) {
  if (line.trim().startsWith("MONGO_URI=")) {
    mongoUri = line.split("=").slice(1).join("=").trim();
  }
}

const EventSchema = new mongoose.Schema({
  eventName: String,
  poster: String,
  badgeIcon: String,
  winnerBadge1: String,
  winnerBadge2: String,
  winnerBadge3: String,
}, { strict: false });

const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

async function main() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");
  const events = await Event.find().sort({ _id: -1 }).limit(3).select("eventName poster badgeIcon winnerBadge1 winnerBadge2 winnerBadge3");
  for (const ev of events) {
    console.log("Event:", ev.eventName);
    console.log("  posterLen:", ev.poster?.length || 0);
    console.log("  badgeLen:", ev.badgeIcon?.length || 0);
    console.log("  w1Len:", ev.winnerBadge1?.length || 0);
    console.log("  w2Len:", ev.winnerBadge2?.length || 0);
    console.log("  w3Len:", ev.winnerBadge3?.length || 0);
  }
  process.exit(0);
}

main().catch(console.error);
