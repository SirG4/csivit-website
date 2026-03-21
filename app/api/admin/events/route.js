import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import { requireAdmin } from "@/lib/adminAuth";
import { uploadEventPosterFromDataUrl } from "@/lib/azureBlob";

export async function GET(request) {
  try {
    await requireAdmin();
    await dbConnect();

    const events = await Event.find()
      .select("-poster -badgeIcon -winnerBadge1 -winnerBadge2 -winnerBadge3")
      .sort({ createdAt: -1 })
      .lean();

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
      isOver,
    } = body;

    if (!eventName || !eventDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let posterUrl = poster || "/Events/Icons/event1.png";
    if (typeof poster === "string" && poster.startsWith("data:image/")) {
      posterUrl = await uploadEventPosterFromDataUrl(poster);
    }

    const event = new Event({
      eventName,
      eventDate: new Date(eventDate),
      description,
      pointsPerAttendance: pointsPerAttendance || 10,
      poster: posterUrl,
      minMembers: minMembers || 1,
      maxMembers: maxMembers || 1,
      badgeIcon: badgeIcon || "",
      winnerBadge1: winnerBadge1 || "",
      winnerBadge2: winnerBadge2 || "",
      winnerBadge3: winnerBadge3 || "",
      isRegistrationLive: isRegistrationLive || false,
      isHidden: isHidden || false,
      isOver: isOver || false,
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
