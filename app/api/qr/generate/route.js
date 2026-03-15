import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import Registration from "@/models/Registration";
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

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid request: Body is required" },
        { status: 400 }
      );
    }

    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 1. Check if event exists and is active
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

    // 2. Check if user is registered for this event
    const registration = await Registration.findOne({
      userId: session.user.id,
      eventId: eventId,
    });

    if (!registration) {
      return NextResponse.json(
        { error: "You must be registered for this event to generate a QR code" },
        { status: 403 }
      );
    }

    // 3. Generate static QR payload with only eventId and userId
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Session error: User ID missing" },
        { status: 500 }
      );
    }

    const qrPayload = {
      eventId: event._id.toString(),
      userId: userId,
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

