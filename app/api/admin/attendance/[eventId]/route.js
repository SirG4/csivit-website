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

    const [event, registrations, attendanceRecords] = await Promise.all([
      Event.findById(eventId)
        .select("-poster -badgeIcon -winnerBadge1 -winnerBadge2 -winnerBadge3")
        .lean(),
      Registration.find({ eventId })
        .populate("userId", "name email image")
        .sort({ createdAt: -1 })
        .lean(),
      Attendance.find({ eventId })
        .populate("userId", "_id")
        .sort({ scannedAt: -1 })
        .lean()
    ]);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }


    const attendanceMap = {};
    attendanceRecords.forEach((record) => {
      if (record.userId) {
        attendanceMap[record.userId._id.toString()] = record;
      }
    });

    const mergedRegistrations = registrations.map((reg) => {
      const att = reg.userId ? attendanceMap[reg.userId._id.toString()] : null;
      
      return {
        ...reg,
        hasAttended: !!att,
        scannedAt: att ? att.scannedAt : null,
        badgeEarned: att ? att.badgeEarned : null,
        pointsEarned: att ? att.pointsEarned : 0,
        participationBadge: att ? att.participationBadge : null,
        milestoneBadge: att ? att.milestoneBadge : null,
        prizeBadge: att ? att.prizeBadge : null,
        prizeName: att ? att.prizeName : null,
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
          totalAttendees,
          registrations: mergedRegistrations,
          teams,
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
