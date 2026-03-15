import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Attendance from "@/models/Attendance";
import Event from "@/models/Event";
import Registration from "@/models/Registration";


const QR_EXPIRY_SECONDS = 300; // Increased to be more lenient for static QR

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized: Please sign in again" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Handle both object payload and legacy string payload
    let eventId, eventKey, timestamp, userId;

    if (typeof body === 'string') {
      // If the body is just a string (ID), try to use it as eventId
      eventId = body;
    } else if (body && typeof body === 'object') {
      ({ eventKey, eventId, timestamp, userId } = body);
    }

    if (!eventId) {
      return NextResponse.json(
        { error: "Invalid QR payload: Missing Event ID", received: body },
        { status: 400 }
      );
    }

    // Determination of who to mark attendance for
    let targetUserId = session.user.id;

    // If a userId is present in the scan, it's an admin scanning a user
    if (userId) {
      await dbConnect();
      const scanner = await User.findById(session.user.id);
      if (scanner?.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden: Only admins can scan user entry passes" },
          { status: 403 }
        );
      }
      targetUserId = userId;
    }

    await dbConnect();

    // 1. Check if event exists and is active
    const event = await Event.findById(eventId);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.isActive) {
      return NextResponse.json(
        { error: "This event is not currently active" },
        { status: 400 }
      );
    }

    // If eventKey is provided in payload, it must match
    if (eventKey && event.eventKey !== eventKey) {
      return NextResponse.json({ error: "Invalid event key for this event" }, { status: 400 });
    }

    // 2. Enforce registration check
    const registration = await Registration.findOne({
      userId: targetUserId,
      eventId: eventId,
    });

    if (!registration) {
      const user = await User.findById(targetUserId);
      return NextResponse.json(
        { error: `${user?.name || "User"} is not registered for this event` },
        { status: 403 }
      );
    }

    // 3. Mark attendance
    const existingAttendance = await Attendance.findOne({
      userId: targetUserId,
      eventId,
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          error: "Already Claimed",
          message: "Attendance already marked for this event",
        },
        { status: 409 }
      );
    }

    const userAttendanceCount = await Attendance.countDocuments({
      userId: targetUserId,
    });

    const pointsEarned = event.pointsPerAttendance || 10;
    const finalBadgeEarned = event.badgeIcon || null;

    const attendance = new Attendance({
      userId: targetUserId,
      eventId,
      eventKey: event.eventKey,
      badgeEarned: finalBadgeEarned,
      participationBadge: event.badgeIcon || null,
      pointsEarned,
    });

    await attendance.save();

    const targetUser = await User.findById(targetUserId);

    if (targetUser) {
      if (event.badgeIcon) {
        const existingEventBadge = targetUser.badges.find(
          (b) => b.eventKey === event.eventKey && b.badgeName === event.eventName
        );
        if (!existingEventBadge) {
          targetUser.badges.push({
            eventKey: event.eventKey,
            badgeName: event.eventName,
            badgeIcon: event.badgeIcon,
          });
        }
      }

      await targetUser.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Attendance marked successfully",
        data: {
          attendance,
          pointsEarned,
          badgeEarned: finalBadgeEarned,
          badge: event.badgeIcon ? { badgeName: event.eventName } : null,
          eventName: event.eventName,
          userName: targetUser?.name,
        },
        badge: event.badgeIcon ? { badgeName: event.eventName } : null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "Already Claimed",
          message: "Attendance already marked for this event",
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


