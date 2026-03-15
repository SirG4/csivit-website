import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request) {
  try {
    await requireAdmin();
    await dbConnect();

    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: events,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    await dbConnect();

    const body = await request.json();
    const {
      eventName,
      eventDate,
      description,
      pointsPerAttendance,
      poster,
      minMembers,
      maxMembers,
      badgeIcon,
      winnerBadge1,
      winnerBadge2,
      winnerBadge3,
      isRegistrationLive,
      isHidden,
    } = body;

    console.log("EVENT CREATION PAYLOAD SIZES:");
    console.log("poster size:", poster ? poster.length : 0);
    console.log("badgeIcon size:", badgeIcon ? badgeIcon.length : 0);
    console.log("winnerBadge1 size:", winnerBadge1 ? winnerBadge1.length : 0);
    console.log("winnerBadge2 size:", winnerBadge2 ? winnerBadge2.length : 0);
    console.log("winnerBadge3 size:", winnerBadge3 ? winnerBadge3.length : 0);


    if (!eventName || !eventDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const event = new Event({
      eventName,
      eventDate: new Date(eventDate),
      description,
      pointsPerAttendance: pointsPerAttendance || 10,
      poster: poster || "/Events/Icons/event1.png",
      minMembers: minMembers || 1,
      maxMembers: maxMembers || 1,
      badgeIcon: badgeIcon || "",
      winnerBadge1: winnerBadge1 || "",
      winnerBadge2: winnerBadge2 || "",
      winnerBadge3: winnerBadge3 || "",
      isRegistrationLive: isRegistrationLive || false,
      isHidden: isHidden || false,
    });

    await event.save();

    return NextResponse.json(
      {
        success: true,
        data: event,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating event:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Event already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
