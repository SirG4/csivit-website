import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Registration from "@/models/Registration";
import Event from "@/models/Event";
import User from "@/models/User";
import Attendance from "@/models/Attendance";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const userId = session.user.id;

    // Simple, fast query: get registrations with populated event
    const registrations = await Registration.find({ userId })
      .populate("eventId", "_id eventName eventDate description poster badgeIcon winnerBadge1 winnerBadge2 winnerBadge3 isRegistrationLive isOver minMembers maxMembers")
      .select("_id userId eventId name phone teamCode isTeamLeader")
      .lean()
      .maxTimeMS(5000); // 5 second timeout

    if (!registrations.length) {
      const response = NextResponse.json(
        { data: [] },
        { status: 200 }
      );
      response.headers.set("Cache-Control", "private, max-age=300");
      return response;
    }

    // Parallel fetch for team members and attendance data
    const [teamMembersData, attendanceData] = await Promise.all([
      // Get all team members for these registrations
      Registration.find({
        eventId: { $in: registrations.map(r => r.eventId._id) },
        teamCode: { $in: registrations.map(r => r.teamCode) }
      })
        .populate("userId", "name email image")
        .select("userId eventId teamCode")
        .lean()
        .maxTimeMS(4000),

      // Get attendance records
      Attendance.find({ userId })
        .select("eventId")
        .lean()
        .maxTimeMS(4000)
    ]);

    // Create lookup maps for fast O(1) access
    const attendanceMap = new Set(attendanceData.map(a => a.eventId.toString()));
    const teamMemberMap = new Map();
    teamMembersData.forEach(member => {
      const key = `${member.eventId}-${member.teamCode}`;
      if (!teamMemberMap.has(key)) {
        teamMemberMap.set(key, []);
      }
      teamMemberMap.get(key).push(member.userId);
    });

    // Enrich registrations with team members and attendance
    const enrichedRegistrations = registrations.map(reg => {
      const key = `${reg.eventId._id}-${reg.teamCode}`;
      const teamMembers = teamMemberMap.get(key) || [];
      const hasAttended = attendanceMap.has(reg.eventId._id.toString());

      return {
        ...reg,
        teamMembers,
        hasAttended
      };
    });

    const response = NextResponse.json(
      { data: enrichedRegistrations },
      { status: 200 }
    );

    // Cache registrations for 5 minutes (user-specific data, medium TTL)
    response.headers.set("Cache-Control", "private, max-age=300");
    return response;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
