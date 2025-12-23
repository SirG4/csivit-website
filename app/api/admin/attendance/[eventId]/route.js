import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";
import Event from "@/models/Event";
import User from "@/models/User";

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { eventId } = params;

    const event = await Event.findById(eventId);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const attendanceRecords = await Attendance.find({ eventId })
      .populate("userId", "name email image")
      .sort({ scannedAt: -1 });

    const totalAttendees = attendanceRecords.length;

    return NextResponse.json(
      {
        success: true,
        data: {
          event,
          attendees: attendanceRecords,
          totalAttendees,
          eventKey: event.eventKey,
        },
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
