import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import Registration from "@/models/Registration";
import Attendance from "@/models/Attendance";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { resolveSessionUserId } from "@/lib/adminAuth";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const userId = await resolveSessionUserId(session);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registrations = await Registration.find({ userId })
      .populate(
        "eventId",
        "_id eventName eventDate description poster isRegistrationLive isOver minMembers maxMembers",
      )
      .select("_id userId eventId name phone teamCode isTeamLeader")
      .lean()
      .maxTimeMS(6000);

    const validRegistrations = registrations.filter((reg) => reg.eventId);

    if (!validRegistrations.length) {
      const response = NextResponse.json({ data: [] }, { status: 200 });
      response.headers.set("Cache-Control", "private, max-age=60");
      return response;
    }

    const eventIds = [
      ...new Set(validRegistrations.map((r) => r.eventId._id.toString())),
    ];
    const teamCodes = [...new Set(validRegistrations.map((r) => r.teamCode))];

    const [teamMembersData, attendances] = await Promise.all([
      Registration.find({
        eventId: { $in: eventIds },
        teamCode: { $in: teamCodes },
      })
        .populate("userId", "name email image")
        .select("userId eventId teamCode isTeamLeader")
        .lean()
        .maxTimeMS(6000),
      Attendance.find({ userId }).select("eventId").lean().maxTimeMS(4000),
    ]);

    const teamMemberMap = new Map();
    for (const member of teamMembersData) {
      const key = `${member.eventId.toString()}::${member.teamCode}`;
      if (!teamMemberMap.has(key)) {
        teamMemberMap.set(key, []);
      }
      teamMemberMap.get(key).push(member.userId);
    }

    const attendedEventIds = new Set(
      attendances.map((a) => a.eventId.toString()),
    );

    const registrationsWithAttendance = validRegistrations.map((reg) => {
      const key = `${reg.eventId._id.toString()}::${reg.teamCode}`;
      return {
        ...reg,
        teamMembers: teamMemberMap.get(key) || [],
        hasAttended: attendedEventIds.has(reg.eventId._id.toString()),
      };
    });

    const response = NextResponse.json(
      { data: registrationsWithAttendance },
      { status: 200 },
    );
    response.headers.set("Cache-Control", "private, max-age=60");
    return response;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch registrations" },
      { status: 500 },
    );
  }
}
