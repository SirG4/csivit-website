import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function GET(request) {
  try {
    await dbConnect();

    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: events,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { eventName, eventDate, description, pointsPerAttendance } = body;

    if (!eventName || !eventDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const event = new Event({
      eventName,
      eventDate: new Date(eventDate),
      description,
      pointsPerAttendance: pointsPerAttendance || 10,
    });

    await event.save();

    return NextResponse.json(
      {
        success: true,
        data: event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Event already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
