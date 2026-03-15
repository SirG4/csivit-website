import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
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

    // Fetch user's registrations populated with event details
    const registrations = await Registration.find({ userId: session.user.id })
      .populate("eventId")
      .lean();

    // Filter out registrations where eventId is null (orphaned registrations if event was deleted)
    const validRegistrations = registrations.filter(reg => reg.eventId);

    // For each registration, fetch team members
    const registrationsWithTeam = await Promise.all(
      validRegistrations.map(async (reg) => {
        const teamMembers = await Registration.find({
          eventId: reg.eventId._id,
          teamCode: reg.teamCode,
        })
          .populate("userId", "name email image")
          .lean();

        return { ...reg, teamMembers };
      })
    );

    // Fetch user's attendances to see if they've attended these events
    const attendances = await Attendance.find({ userId: session.user.id }).lean();
    const attendedEventIds = new Set(attendances.map(a => a.eventId.toString()));

    const registrationsWithAttendance = registrationsWithTeam.map(reg => ({
      ...reg,
      hasAttended: attendedEventIds.has(reg.eventId._id.toString())
    }));

    return NextResponse.json(
      { data: registrationsWithAttendance },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
