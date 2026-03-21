import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";

const EVENTS_CACHE_TTL_MS = 5 * 60 * 1000;

function getEventsCacheStore() {
  if (!global.eventsApiCache) {
    global.eventsApiCache = {
      data: [],
      timestamp: 0,
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
  const cacheStore = getEventsCacheStore();

  try {
    await withTimeout(
      dbConnect(),
      8000,
      "Database connection timed out while fetching events",
    );

    const events = await withTimeout(
      Event.find({ isHidden: false })
        .select(
          "eventName eventDate description poster minMembers maxMembers isRegistrationLive isOver",
        )
        .sort({ eventDate: 1 })
        .lean()
        .maxTimeMS(10000),
      15000,
      "Events query timed out",
    );

    cacheStore.data = events;
    cacheStore.timestamp = Date.now();

    const response = NextResponse.json(
      {
        success: true,
        data: events,
      },
      { status: 200 },
    );

    response.headers.set(
      "Cache-Control",
      "public, s-maxage=120, stale-while-revalidate=300",
    );
    return response;
  } catch (error) {
    const hasFreshCache =
      cacheStore.data.length > 0 &&
      Date.now() - cacheStore.timestamp < EVENTS_CACHE_TTL_MS;

    if (hasFreshCache) {
      const fallbackResponse = NextResponse.json(
        {
          success: true,
          data: cacheStore.data,
          degraded: true,
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
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
