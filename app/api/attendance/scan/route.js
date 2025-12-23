import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Attendance from "@/models/Attendance";
import Event from "@/models/Event";
import { calculateBadge } from "@/lib/gamification";

const QR_EXPIRY_SECONDS = 60;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { eventKey, eventId, timestamp } = body;

    if (!eventKey || !eventId) {
      return NextResponse.json(
        { error: "Invalid QR payload" },
        { status: 400 }
      );
    }

    // Validate QR timestamp if provided
    if (timestamp) {
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
    }

    await dbConnect();

    const event = await Event.findById(eventId);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.isActive) {
      return NextResponse.json(
        { error: "Event is not active" },
        { status: 400 }
      );
    }

    if (event.eventKey !== eventKey) {
      return NextResponse.json({ error: "Invalid event key" }, { status: 400 });
    }

    const existingAttendance = await Attendance.findOne({
      userId: session.user.id,
      eventId,
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          error: "Already Claimed",
          message: "You already marked attendance for this event",
        },
        { status: 409 }
      );
    }

    const userAttendanceCount = await Attendance.countDocuments({
      userId: session.user.id,
    });

    const pointsEarned = event.pointsPerAttendance || 10;
    const badgeData = calculateBadge(userAttendanceCount + 1);
    const badgeName = badgeData ? badgeData.name : null;

    const attendance = new Attendance({
      userId: session.user.id,
      eventId,
      eventKey,
      badgeEarned: badgeName,
      pointsEarned,
    });

    await attendance.save();

    const user = await User.findById(session.user.id);

    if (user && badgeName) {
      const existingBadge = user.badges.find((b) => b.badgeName === badgeName);

      if (!existingBadge) {
        user.badges.push({
          eventKey,
          badgeName,
        });

        await user.save();
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Attendance marked successfully",
        data: {
          attendance,
          pointsEarned,
          badgeEarned: badgeName,
          eventName: event.eventName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "Already Claimed",
          message: "You already marked attendance for this event",
        },
        { status: 409 }
      );
    }

    console.error("Error scanning QR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process QR scan" },
      { status: 500 }
    );
  }
}
