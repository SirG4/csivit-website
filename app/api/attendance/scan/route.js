import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Attendance from "@/models/Attendance";
import { CURRENT_EVENT } from "@/lib/eventConfig";

const QR_EXPIRY_SECONDS = 60; // QR valid for 60 seconds

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, email, timestamp } = body;

    if (!userId || !email || !timestamp) {
      return NextResponse.json(
        { error: "Invalid QR payload" },
        { status: 400 }
      );
    }

    if (!CURRENT_EVENT.isActive) {
      return NextResponse.json(
        { error: "No active event at this time" },
        { status: 400 }
      );
    }

    // Validate timestamp (QR expiry)
    const qrTime = new Date(timestamp);
    const now = new Date();
    const diffSeconds = (now - qrTime) / 1000;

    if (diffSeconds > QR_EXPIRY_SECONDS) {
      return NextResponse.json(
        { error: "QR code expired. Please generate a new one." },
        { status: 400 }
      );
    }

    if (diffSeconds < 0) {
      return NextResponse.json(
        { error: "Invalid QR timestamp" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify email matches
    if (user.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 403 });
    }

    // Check if attendance already exists for this event
    const existingAttendance = await Attendance.findOne({
      userId: user._id,
      eventKey: CURRENT_EVENT.eventKey,
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          error: "Badge already earned for this event",
          badge: user.badges.find((b) => b.eventKey === CURRENT_EVENT.eventKey),
        },
        { status: 409 }
      );
    }

    // Create attendance record
    const attendance = await Attendance.create({
      userId: user._id,
      eventKey: CURRENT_EVENT.eventKey,
      scannedAt: now,
    });

    // Check if badge already exists (additional safety)
    const existingBadge = user.badges.find(
      (b) => b.eventKey === CURRENT_EVENT.eventKey
    );

    if (existingBadge) {
      return NextResponse.json(
        { error: "Badge already earned for this event", badge: existingBadge },
        { status: 409 }
      );
    }

    // Assign badge
    user.badges.push({
      eventKey: CURRENT_EVENT.eventKey,
      badgeName: CURRENT_EVENT.badgeName,
      earnedAt: now,
    });

    await user.save();

    return NextResponse.json(
      {
        message: "Attendance marked and badge earned",
        attendance,
        badge: {
          eventKey: CURRENT_EVENT.eventKey,
          badgeName: CURRENT_EVENT.badgeName,
          earnedAt: now,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error scanning QR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process QR scan" },
      { status: 500 }
    );
  }
}
