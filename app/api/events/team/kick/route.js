import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import Registration from "@/models/Registration";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetRegistrationId } = await request.json();

    if (!targetRegistrationId) {
      return NextResponse.json({ error: "Target registration ID is required" }, { status: 400 });
    }

    await dbConnect();

    // Find the target registration
    const targetRegistration = await Registration.findById(targetRegistrationId);

    if (!targetRegistration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // Check if the current user is the team leader for this team
    const leaderRegistration = await Registration.findOne({
      userId: session.user.id,
      eventId: targetRegistration.eventId,
      teamCode: targetRegistration.teamCode,
      isTeamLeader: true,
    });

    if (!leaderRegistration) {
      return NextResponse.json({ error: "You are not authorized to kick members from this team" }, { status: 403 });
    }

    // Check if leader is trying to kick themselves
    if (targetRegistration.userId.toString() === session.user.id.toString()) {
      return NextResponse.json({ error: "You cannot kick yourself" }, { status: 400 });
    }

    // Delete the target registration
    await Registration.findByIdAndDelete(targetRegistrationId);

    return NextResponse.json(
      { message: "Team member kicked successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error kicking team member:", error);
    return NextResponse.json(
      { error: error.message || "Failed to kick team member" },
      { status: 500 }
    );
  }
}
