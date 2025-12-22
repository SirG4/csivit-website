import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { CURRENT_EVENT } from "@/lib/eventConfig";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized: Must be signed in" },
        { status: 401 }
      );
    }

    if (!CURRENT_EVENT.isActive) {
      return NextResponse.json(
        { error: "No active event at this time" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate QR payload
    const qrPayload = {
      userId: user._id.toString(),
      email: user.email,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        message: "QR payload generated",
        payload: JSON.stringify(qrPayload),
        event: CURRENT_EVENT,
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
