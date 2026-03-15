import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import Registration from "@/models/Registration";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, name, phone, teamCode, generateTeamCode } = await request.json();

    if (!eventId || !name || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if registration is live and event is not over
    if (!event.isRegistrationLive) {
      return NextResponse.json({ error: "Registrations are not live for this event" }, { status: 400 });
    }

    if (event.isOver) {
      return NextResponse.json({ error: "This event is over" }, { status: 400 });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      userId: session.user.id,
      eventId: eventId,
    });

    if (existingRegistration) {
      return NextResponse.json({ error: "Already registered for this event" }, { status: 400 });
    }

    let finalTeamCode = teamCode;
    let isTeamLeader = false;

    if (generateTeamCode) {
      // Generate random 6-character alphanumeric string
      finalTeamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      isTeamLeader = true;
    } else {
      if (!teamCode) {
        return NextResponse.json({ error: "Team code is required if not generating one" }, { status: 400 });
      }
      // Check if team code exists for this event
      const existingTeamMembers = await Registration.find({
        eventId: eventId,
        teamCode: teamCode
      });

      if (existingTeamMembers.length === 0) {
        return NextResponse.json({ error: "Invalid team code" }, { status: 400 });
      }

      const teamLeader = existingTeamMembers.find((m) => m.isTeamLeader);
      if (!teamLeader) {
        return NextResponse.json({ error: "Invalid team code" }, { status: 400 });
      }

      if (existingTeamMembers.length >= event.maxMembers) {
        return NextResponse.json({ error: "Team is full" }, { status: 400 });
      }
    }

    const newRegistration = await Registration.create({
      userId: session.user.id,
      eventId: eventId,
      name,
      phone,
      teamCode: finalTeamCode,
      isTeamLeader,
    });

    return NextResponse.json(
      { message: "Successfully registered", registration: newRegistration },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
        return NextResponse.json({ error: "Already registered for this event" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to register" },
      { status: 500 }
    );
  }
}
