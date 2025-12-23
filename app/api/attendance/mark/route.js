import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";
import Event from "@/models/Event";
import User from "@/models/User";
import { calculateBadge, getBadgeName } from "@/lib/gamification";

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
