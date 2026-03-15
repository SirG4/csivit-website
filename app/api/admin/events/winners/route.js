import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import Registration from "@/models/Registration";
import Attendance from "@/models/Attendance";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(request) {
  try {
    await requireAdmin();
    await dbConnect();

    const body = await request.json();
    const { eventId, rank, targetUserId, teamCode } = body;

    if (!eventId || !rank || (!targetUserId && !teamCode)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const rankNum = parseInt(rank);
    const badgeIcon = rankNum === 1 ? event.winnerBadge1 : rankNum === 2 ? event.winnerBadge2 : event.winnerBadge3;
    const badgeName = `${rankNum === 1 ? "🥇 1st" : rankNum === 2 ? "🥈 2nd" : "🥉 3rd"} Prize: ${event.eventName}`;

    if (!badgeIcon) {
      return NextResponse.json(
        { error: "No badge icon defined for this rank in this event" },
        { status: 400 }
      );
    }

    let userIds = [];
    if (targetUserId) {
      userIds = [targetUserId];
    } else if (teamCode) {
      const registrations = await Registration.find({ eventId, teamCode });
      userIds = registrations.map(r => r.userId);
    }

    const results = await Promise.all(
      userIds.map(async (userId) => {
        const user = await User.findById(userId);
        if (user) {
          // Remove existing prize badge for this event if any
          user.badges = user.badges.filter(b => b.eventKey !== event.eventKey || !b.badgeName.includes("Prize"));
          
          user.badges.push({
            eventKey: event.eventKey,
            badgeName,
            badgeIcon,
          });
          await user.save();

          // Also update attendance record if it exists
          const attendance = await Attendance.findOne({ userId, eventId });
          if (attendance) {
            attendance.prizeBadge = badgeIcon;
            attendance.prizeName = badgeName;
            await attendance.save();
          }

          return user.name;
        }
        return null;
      })
    );

    return NextResponse.json(
      { success: true, message: `Awarded to: ${results.filter(Boolean).join(", ")}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error awarding prize:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await requireAdmin();
    await dbConnect();

    const body = await request.json();
    const { eventId, rank, targetUserId } = body;

    const event = await Event.findById(eventId);
    const user = await User.findById(targetUserId);

    if (user && event) {
      const rankNum = parseInt(rank);
      const prizeTitle = `${rankNum === 1 ? "🥇 1st" : rankNum === 2 ? "🥈 2nd" : "🥉 3rd"} Prize`;
      user.badges = user.badges.filter(
        b => !(b.eventKey === event.eventKey && b.badgeName.includes(prizeTitle))
      );
      await user.save();

      // Also update attendance record if it exists
      const attendance = await Attendance.findOne({ userId: targetUserId, eventId });
      if (attendance) {
        attendance.prizeBadge = null;
        attendance.prizeName = null;
        await attendance.save();
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
