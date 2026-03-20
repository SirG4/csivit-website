import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

export async function GET(request) {
  try {
    await dbConnect();

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get("upcoming") === "true";
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);

    // Build filter query
    const filter = { isHidden: false };
    if (upcoming) {
      filter.isOver = false;
    }

    // Fetch events with selected fields only, sorted by event date
    // Only select fields needed for profile display
    const events = await Event.find(filter)
      .select(
        "_id eventName eventDate description poster badgeIcon winnerBadge1 winnerBadge2 winnerBadge3 isRegistrationLive isOver minMembers maxMembers eventKey",
      )
      .sort({ eventDate: 1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .maxTimeMS(3000); // 3 second timeout for fast fail

    // Cache events for 5 minutes in CDN/browser (events don't change frequently)
    const response = NextResponse.json(
      {
        success: true,
        data: events,
      },
      { status: 200 },
    );

    // Set cache headers for better performance
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600",
    );
    return response;
  } catch (error) {
    console.error("Error fetching events:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
