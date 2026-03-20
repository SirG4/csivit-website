import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

const EVENTS_CACHE_TTL_MS = 5 * 60 * 1000;

function getEventsCacheStore() {
  if (!global.eventsApiCache) {
    global.eventsApiCache = {
      all: { data: [], timestamp: 0 },
      upcoming: { data: [], timestamp: 0 },
    };
  }
  return global.eventsApiCache;
}

function withTimeout(promise, timeoutMs, timeoutMessage) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    }),
  ]);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const upcoming = searchParams.get("upcoming") === "true";
  const light = searchParams.get("light") === "true";
  const limit = parseInt(searchParams.get("limit") || "100", 10);
  const skip = parseInt(searchParams.get("skip") || "0", 10);
  const cacheStore = getEventsCacheStore();
  const cacheKey = upcoming ? "upcoming" : "all";

  try {
    await withTimeout(
      dbConnect(),
      10000,
      "Database connection timed out while fetching events",
    );

    // Build filter query
    const filter = { isHidden: false };
    if (upcoming) {
      filter.isOver = false;
    }

    // Fetch events with selected fields only, sorted by event date
    // Only select fields needed for profile display
    const projection = light
      ? "_id eventName eventDate description poster isRegistrationLive isOver minMembers maxMembers eventKey"
      : "_id eventName eventDate description poster badgeIcon winnerBadge1 winnerBadge2 winnerBadge3 isRegistrationLive isOver minMembers maxMembers eventKey";

    const events = await withTimeout(
      Event.find(filter)
        .select(projection)
        .sort({ eventDate: 1 })
        .limit(limit)
        .skip(skip)
        .lean()
        .maxTimeMS(12000),
      20000,
      "Events query timed out",
    );

    cacheStore[cacheKey] = {
      data: events,
      timestamp: Date.now(),
    };

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

    // Serve stale cache instead of failing the profile experience.
    const cached = cacheStore[cacheKey];
    const cacheIsFresh = Date.now() - cached.timestamp < EVENTS_CACHE_TTL_MS;
    if (cached.data.length > 0 && cacheIsFresh) {
      const fallbackResponse = NextResponse.json(
        {
          success: true,
          data: cached.data,
          degraded: true,
          warning: "Serving cached events due to temporary database issue",
        },
        { status: 200 },
      );
      fallbackResponse.headers.set(
        "Cache-Control",
        "public, s-maxage=60, stale-while-revalidate=300",
      );
      return fallbackResponse;
    }

    return NextResponse.json(
      {
        success: false,
        data: [],
        error: error.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}
