import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";
import Event from "@/models/Event";
import User from "@/models/User";
import { requireAdmin } from "@/lib/adminAuth";
import Registration from "@/models/Registration";

export async function GET(request, { params }) {
  try {
    await requireAdmin();
    await dbConnect();

    const { eventId } = await params;

    const event = await Event.findById(eventId);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const registrations = await Registration.find({ eventId })
      .populate("userId", "name email image badges")
      .sort({ createdAt: -1 });

    const attendanceRecords = await Attendance.find({ eventId })
      .populate("userId", "name email image badges")
      .sort({ scannedAt: -1 });

    const attendanceMap = {};
    attendanceRecords.forEach((record) => {
      if (record.userId) {
        attendanceMap[record.userId._id.toString()] = record;
      }
    });

    const mergedRegistrations = registrations.map((reg) => {
      const att = reg.userId ? attendanceMap[reg.userId._id.toString()] : null;
      // Get all badges for this event from the user record
      const eventBadges = reg.userId?.badges?.filter(b => b.eventKey === event.eventKey) || [];
      
      return {
        ...reg.toObject(),
        hasAttended: !!att,
        scannedAt: att ? att.scannedAt : null,
        badgeEarned: att ? att.badgeEarned : null,
        pointsEarned: att ? att.pointsEarned : 0,
        participationBadge: att ? att.participationBadge : null,
        milestoneBadge: att ? att.milestoneBadge : null,
        prizeBadge: att ? att.prizeBadge : null,
        prizeName: att ? att.prizeName : null,
        eventBadges: eventBadges,
      };
    });

    const totalAttendees = attendanceRecords.length;
    const totalRegistrations = registrations.length;

    // Group by teams
    const teams = {};
    mergedRegistrations.forEach((reg) => {
      if (!teams[reg.teamCode]) {
        teams[reg.teamCode] = [];
      }
      teams[reg.teamCode].push(reg);
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          event,
          attendees: attendanceRecords,
          registrations: mergedRegistrations,
          teams,
          totalAttendees,
          totalRegistrations,
          eventKey: event.eventKey,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
