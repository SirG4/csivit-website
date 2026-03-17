import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Registration from "@/models/Registration";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import { requireAdmin } from "@/lib/adminAuth";
import Event from "@/models/Event";

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    await dbConnect();

    const { registrationId } = await params;

    const registration = await Registration.findById(registrationId, "userId eventId").lean();
    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    const { userId, eventId } = registration;

    // Fetch event key and delete records in parallel
    const [event] = await Promise.all([
      Event.findById(eventId, "eventKey").lean(),
      Registration.findByIdAndDelete(registrationId),
      Attendance.findOneAndDelete({ userId, eventId })
    ]);

    const eventKey = event?.eventKey;

    // Remove event-specific badges from user
    if (userId && eventKey) {
      await User.findByIdAndUpdate(userId, {
        $pull: { badges: { eventKey: eventKey } },
      });
    }

    return NextResponse.json(
      { success: true, message: "Registration deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete registration error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
