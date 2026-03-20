import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import Registration from "@/models/Registration";
import Event from "@/models/Event";
import Attendance from "@/models/Attendance";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leaderRegistrationId } = await request.json();

    if (!leaderRegistrationId) {
      return NextResponse.json(
        { error: "Leader registration ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const leaderRegistration = await Registration.findById(leaderRegistrationId)
      .select("_id userId eventId teamCode isTeamLeader")
      .lean();

    if (!leaderRegistration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 },
      );
    }

    const isOwner =
      leaderRegistration.userId?.toString() === session.user.id?.toString();
    if (!isOwner || !leaderRegistration.isTeamLeader) {
      return NextResponse.json(
        { error: "Only the team leader can cancel this team" },
        { status: 403 },
      );
    }

    const event = await Event.findById(leaderRegistration.eventId)
      .select("isOver")
      .lean();
    if (event?.isOver) {
      return NextResponse.json(
        { error: "Cannot cancel a team for an event that is over" },
        { status: 400 },
      );
    }

    const teamRegistrations = await Registration.find({
      eventId: leaderRegistration.eventId,
      teamCode: leaderRegistration.teamCode,
    })
      .select("userId")
      .lean();

    if (!teamRegistrations.length) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const memberUserIds = teamRegistrations.map((r) => r.userId);
    const attendanceExists = await Attendance.exists({
      eventId: leaderRegistration.eventId,
      userId: { $in: memberUserIds },
    });

    if (attendanceExists) {
      return NextResponse.json(
        {
          error:
            "Cannot cancel team after attendance has been marked for this event",
        },
        { status: 400 },
      );
    }

    const deleteResult = await Registration.deleteMany({
      eventId: leaderRegistration.eventId,
      teamCode: leaderRegistration.teamCode,
    });

    return NextResponse.json(
      {
        message: "Team cancelled successfully",
        removedMembers: deleteResult.deletedCount || 0,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error cancelling team:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel team" },
      { status: 500 },
    );
  }
}
