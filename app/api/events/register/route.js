import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
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

    const { eventId, name, phone, teamCode, generateTeamCode, simplified } = await request.json();

    let finalName = name;
    let finalPhone = phone;
    let finalGenerateTeamCode = generateTeamCode;

    if (simplified) {
      if (!session?.user?.name) {
        return NextResponse.json({ error: "User name not found in session" }, { status: 400 });
      }
      finalName = session.user.name;
      finalPhone = "Not Provided (Simplified)";
      finalGenerateTeamCode = true; // 1 team per event logic
    } else if (!eventId || !name || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Check if event exists
    let event = await Event.findById(eventId);
    
    // If not found and it's a known static event ID, create it
    if (!event && (eventId === "6b2f1a2b3c4d5e6f7a8b9c01" || eventId === "6b2f1a2b3c4d5e6f7a8b9c02")) {
      const staticEventData = eventId === "6b2f1a2b3c4d5e6f7a8b9c01" 
        ? {
            _id: new mongoose.Types.ObjectId("6b2f1a2b3c4d5e6f7a8b9c01"),
            eventName: "CSIVIT Orientation",
            eventDate: new Date("2026-03-20T10:00:00.000Z"),
            description: "Welcome to CSIVIT! Join us for an introductory session.",
            poster: "/Profile/steam_poster.jpg", // Using default poster
            isRegistrationLive: true,
            isOver: false,
            minMembers: 1,
            maxMembers: 1,
            eventKey: "orientation-static",
            badgeIcon: "https://api.dicebear.com/7.x/identicon/svg?seed=orientation",
            winnerBadge1: "https://api.dicebear.com/7.x/identicon/svg?seed=orientation-w1",
            winnerBadge2: "https://api.dicebear.com/7.x/identicon/svg?seed=orientation-w2",
            winnerBadge3: "https://api.dicebear.com/7.x/identicon/svg?seed=orientation-w3"
          }
        : {
            _id: new mongoose.Types.ObjectId("6b2f1a2b3c4d5e6f7a8b9c02"),
            eventName: "Code2Create",
            eventDate: new Date("2026-03-25T09:00:00.000Z"),
            description: "CSI-VIT's flagship hackathon. Innovation at its best.",
            poster: "/Profile/steam_poster.jpg", // Using default poster
            isRegistrationLive: true,
            isOver: false,
            minMembers: 1,
            maxMembers: 1,
            eventKey: "code2create-static",
            badgeIcon: "https://api.dicebear.com/7.x/identicon/svg?seed=c2c",
            winnerBadge1: "https://api.dicebear.com/7.x/identicon/svg?seed=c2c-w1",
            winnerBadge2: "https://api.dicebear.com/7.x/identicon/svg?seed=c2c-w2",
            winnerBadge3: "https://api.dicebear.com/7.x/identicon/svg?seed=c2c-w3"
          };
      event = await Event.create(staticEventData);
    }

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if registration is live and event is not over
    // For static events, we skip these checks if they were just created with these defaults
    if (!event.isRegistrationLive && !simplified) {
      return NextResponse.json({ error: "Registrations are not live for this event" }, { status: 400 });
    }

    if (event.isOver && !simplified) {
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

    if (finalGenerateTeamCode) {
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
      name: finalName,
      phone: finalPhone,
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
