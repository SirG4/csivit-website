import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch only the badges field using lean() for faster query
    const user = await User.findById(session.user.id)
      .select("badges")
      .lean()
      .maxTimeMS(2000); // 2 second timeout

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response = NextResponse.json(
      { badges: user.badges || [] },
      { status: 200 },
    );

    // Cache badges for 10 minutes (user-specific, shorter TTL for personalization)
    response.headers.set("Cache-Control", "private, max-age=600");
    return response;
  } catch (error) {
    console.error("Error fetching badges:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to fetch badges" },
      { status: 500 },
    );
  }
}
