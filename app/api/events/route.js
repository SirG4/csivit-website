import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function GET(request) {
  try {
    await dbConnect();

    // Fetch all active events (not over and not hidden), sorted by event date
    const events = await Event.find({ isOver: false, isHidden: false }).sort({ eventDate: 1 });

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
