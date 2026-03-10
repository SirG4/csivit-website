import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function GET(request) {
  try {
    await dbConnect();

    // Fetch all active events, sorted by event date
    const events = await Event.find({ isActive: true }).sort({ eventDate: 1 });

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
