import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import dbConnect, { resetDbConnection } from "@/lib/db";
import Event from "@/models/Event";
import Registration from "@/models/Registration";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { resolveSessionUserId } from "@/lib/adminAuth";

const getSafeRegistrationError = (error) => {
  const message = error?.message || "";
  const isConnectionIssue =
    error?.name === "MongoServerSelectionError" ||
    error?.name === "MongoNetworkError" ||
    /timed out|ECONNREFUSED|ENOTFOUND|failed to connect/i.test(message);

  if (isConnectionIssue) {
    return "Registration service is temporarily unavailable. Please try again.";
  }

  return message || "Failed to register";
};

const isTransientMongoError = (error) => {
  const message = error?.message || "";
  return (
    error?.name === "MongoNetworkError" ||
    error?.name === "MongoNetworkTimeoutError" ||
    error?.name === "MongoServerSelectionError" ||
    /timed out|connection .* timed out|server selection|topology was destroyed|socket/i.test(
      message,
    )
  );
};

async function withMongoRetry(operation) {
  try {
    return await operation();
  } catch (error) {
    if (!isTransientMongoError(error)) {
      throw error;
    }

    await resetDbConnection();
    await dbConnect();
    return operation();
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionUserId = await resolveSessionUserId(session);
    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, name, phone, teamCode, generateTeamCode, simplified } =
      await request.json();

    let finalName = name;
    let finalPhone = phone;
    let finalGenerateTeamCode = generateTeamCode;
    const normalizedTeamCode = (teamCode || "").trim().toUpperCase();

    if (simplified) {
      if (!session?.user?.name) {
        return NextResponse.json(
          { error: "User name not found in session" },
          { status: 400 },
        );
      }
      finalName = session.user.name;
      finalPhone = "Not Provided (Simplified)";
      finalGenerateTeamCode = true; // 1 team per event logic
    } else if (!eventId || !name || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await dbConnect();

    const result = await withMongoRetry(async () => {
      // Check if event exists
      let event = await Event.findById(eventId)
        .select("_id isRegistrationLive isOver minMembers maxMembers isSolo")
        .lean()
        .maxTimeMS(5000);

      // If not found and it's a known static event ID, create it
      if (
        !event &&
        (eventId === "6b2f1a2b3c4d5e6f7a8b9c01" ||
          eventId === "6b2f1a2b3c4d5e6f7a8b9c02")
      ) {
        const staticEventData =
          eventId === "6b2f1a2b3c4d5e6f7a8b9c01"
            ? {
                _id: new mongoose.Types.ObjectId("6b2f1a2b3c4d5e6f7a8b9c01"),
                eventName: "Design Paradox",
                eventDate: new Date("2026-03-20T16:00:00.000Z"),
                description:
                  "UI and Product Design challenge where teams craft a landing page concept for a fictional energy drink launched by an unexpected legacy brand.",
                poster: "/Profile/parapost.png",
                isRegistrationLive: true,
                isOver: false,
                minMembers: 1,
                maxMembers: 1,
                eventKey: "design-paradox-static",
                badgeIcon: "/Profile/parap.png",
                winnerBadge1: "/Profile/para1.png",
                winnerBadge2: "/Profile/para2.png",
                winnerBadge3: "/Profile/para3.png",
              }
            : {
                _id: new mongoose.Types.ObjectId("6b2f1a2b3c4d5e6f7a8b9c02"),
                eventName: "Code2Create",
                eventDate: new Date("2026-03-25T09:00:00.000Z"),
                description:
                  "CSI-VIT's flagship hackathon. Innovation at its best.",
                poster: "/Profile/steam_poster.jpg", // Using default poster
                isRegistrationLive: true,
                isOver: false,
                minMembers: 1,
                maxMembers: 1,
                eventKey: "code2create-static",
                badgeIcon: "https://api.dicebear.com/7.x/identicon/svg?seed=c2c",
                winnerBadge1:
                  "https://api.dicebear.com/7.x/identicon/svg?seed=c2c-w1",
                winnerBadge2:
                  "https://api.dicebear.com/7.x/identicon/svg?seed=c2c-w2",
                winnerBadge3:
                  "https://api.dicebear.com/7.x/identicon/svg?seed=c2c-w3",
              };
        event = await Event.create(staticEventData);
      }

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

    // Check if registration is live and event is not over
    // For static events, we skip these checks if they were just created with these defaults
    if (!event.isRegistrationLive && !simplified) {
      return NextResponse.json(
        { error: "Registrations are not live for this event" },
        { status: 400 },
      );
    }

    if (event.isOver && !simplified) {
      return NextResponse.json(
        { error: "This event is over" },
        { status: 400 },
      );
    }

      // Check if already registered
      const existingRegistration = await Registration.findOne({
        userId: sessionUserId,
        eventId: eventId,
      })
        .select("_id")
        .lean()
        .maxTimeMS(4000);

      if (existingRegistration) {
        return NextResponse.json(
          { error: "Already registered for this event" },
          { status: 400 },
        );
      }

    let finalTeamCode = normalizedTeamCode;
    let isTeamLeader = false;

    const isSoloEvent = event.isSolo !== undefined ? event.isSolo : (event.maxMembers === 1);
    if (isSoloEvent) {
      finalGenerateTeamCode = true;
    }

    if (finalGenerateTeamCode) {
      // Generate random 6-character alphanumeric string
      finalTeamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      isTeamLeader = true;
    } else {
      if (!normalizedTeamCode) {
        return NextResponse.json(
          { error: "Team code is required if not generating one" },
          { status: 400 },
        );
      }
      // Check if team code exists for this event
      const existingTeamMembers = await Registration.find({
        eventId: eventId,
        teamCode: normalizedTeamCode,
      })
        .select("_id isTeamLeader")
        .lean()
        .maxTimeMS(5000);

      if (existingTeamMembers.length === 0) {
        return NextResponse.json(
          { error: "Invalid team code" },
          { status: 400 },
        );
      }

      const teamLeader = existingTeamMembers.find((m) => m.isTeamLeader);
      if (!teamLeader) {
        return NextResponse.json(
          { error: "Invalid team code" },
          { status: 400 },
        );
      }

      if (existingTeamMembers.length >= event.maxMembers) {
        return NextResponse.json({ error: "Team is full" }, { status: 400 });
      }
    }

      const newRegistration = await Registration.create({
        userId: sessionUserId,
        eventId: eventId,
        name: finalName,
        phone: finalPhone,
        teamCode: finalTeamCode,
        isTeamLeader,
      });

      return NextResponse.json(
        { message: "Successfully registered", registration: newRegistration },
        { status: 201 },
      );
    });

    return result;
  } catch (error) {
    console.error("Registration error:", {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      cause: error?.cause?.message,
    });
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Already registered for this event" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: getSafeRegistrationError(error) },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionUserId = await resolveSessionUserId(session);
    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { registrationId, name, phone, teamCode, generateTeamCode } =
      await request.json();

    if (!registrationId || !name || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await dbConnect();

    const result = await withMongoRetry(async () => {
      // Find registration and verify ownership
      const registration = await Registration.findOne({
        _id: registrationId,
        userId: sessionUserId,
      }).maxTimeMS(5000);

      if (!registration) {
        return NextResponse.json(
          { error: "Registration not found" },
          { status: 404 },
        );
      }

      // Check if event is over
      const event = await Event.findById(registration.eventId)
        .select("_id isOver maxMembers")
        .maxTimeMS(5000);
      if (event && event.isOver) {
        return NextResponse.json(
          { error: "Cannot edit registration for a past event" },
          { status: 400 },
        );
      }

    // Update fields
    registration.name = name;
    registration.phone = phone;

    // Handle teamCode change or generation
    if (generateTeamCode) {
      // Generate random 6-character alphanumeric string
      registration.teamCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      registration.isTeamLeader = true;
    } else if (teamCode && teamCode !== registration.teamCode) {
      // Check if the new team code exists for this event
      const teamExists = await Registration.findOne({
        eventId: registration.eventId,
        teamCode: teamCode,
      })
        .select("_id")
        .lean()
        .maxTimeMS(4000);

      if (!teamExists) {
        return NextResponse.json(
          { error: "Invalid team code" },
          { status: 400 },
        );
      }

      // Check if team is full
      const teamMembersCount = await Registration.countDocuments({
        eventId: registration.eventId,
        teamCode: teamCode,
      }).maxTimeMS(4000);

      if (teamMembersCount >= event.maxMembers) {
        return NextResponse.json({ error: "Team is full" }, { status: 400 });
      }

      registration.teamCode = teamCode.toUpperCase();
      registration.isTeamLeader = false; // Joining an existing team
    }

      await registration.save();

      return NextResponse.json(
        { message: "Registration updated successfully", registration },
        { status: 200 },
      );
    });

    return result;
  } catch (error) {
    console.error("Update registration error:", {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      cause: error?.cause?.message,
    });
    return NextResponse.json(
      { error: getSafeRegistrationError(error) },
      { status: 500 },
    );
  }
}
