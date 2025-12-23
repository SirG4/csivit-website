import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (body.eventName) event.eventName = body.eventName;
    if (body.eventDate) event.eventDate = new Date(body.eventDate);
    if (body.description) event.description = body.description;
    if (body.pointsPerAttendance)
      event.pointsPerAttendance = body.pointsPerAttendance;
    if (body.isActive !== undefined) event.isActive = body.isActive;

    await event.save();

    return NextResponse.json(
      {
        success: true,
        data: event,
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

export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    event.isActive = false;
    await event.save();

    return NextResponse.json(
      {
        success: true,
        message: "Event soft deleted",
        data: event,
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
