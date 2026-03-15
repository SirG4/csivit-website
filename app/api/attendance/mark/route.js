import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";
import Event from "@/models/Event";
import User from "@/models/User";
import Registration from "@/models/Registration";


export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { eventKey, eventId } = body;

    if (!eventKey || !eventId) {
      return NextResponse.json(
        { error: "Missing eventKey or eventId" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 1. Check if event exists and is active
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

    // 2. Check if user is registered for this event
    const registration = await Registration.findOne({
      userId: session.user.id,
      eventId: eventId,
    });

    if (!registration) {
      return NextResponse.json(
        { error: "You must be registered for this event to mark attendance" },
        { status: 403 }
      );
    }

    // 3. Mark attendance
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
    const finalBadgeEarned = event.badgeIcon || null;

    const attendance = new Attendance({
      userId: session.user.id,
      eventId,
      eventKey,
      badgeEarned: finalBadgeEarned,
      participationBadge: event.badgeIcon || null,
      pointsEarned,
    });

    await attendance.save();

    const user = await User.findById(session.user.id);

    if (user) {
      if (event.badgeIcon) {
        const existingEventBadge = user.badges.find(
          (b) => b.eventKey === eventKey && b.badgeName === event.eventName
        );
        if (!existingEventBadge) {
          user.badges.push({
            eventKey,
            badgeName: event.eventName,
            badgeIcon: event.badgeIcon,
          });
        }
      }

      await user.save();
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
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

