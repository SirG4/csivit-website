import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Must be signed in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const event = await Event.findById(eventId);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.isActive) {
      return NextResponse.json(
        { error: "This event is not currently active" },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const qrPayload = {
      eventKey: event.eventKey,
      eventId: event._id.toString(),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "QR payload generated",
        payload: JSON.stringify(qrPayload),
        event: {
          _id: event._id,
          eventName: event.eventName,
          eventKey: event.eventKey,
          eventDate: event.eventDate,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating QR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate QR" },
      { status: 500 }
    );
  }
}
