// lib/devTools.js
// Development utilities for testing the admin panel

export const MOCK_EVENTS = [
  {
    _id: "507f1f77bcf86cd799439011",
    eventName: "Tech Workshop",
    eventDate: new Date(Date.now() + 86400000).toISOString(),
    poster: "/Events/Icons/event1.png",
    eventKey: "a1b2c3d4",
    isActive: true,
    pointsPerAttendance: 10,
    description: "Learn about web development",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "507f1f77bcf86cd799439012",
    eventName: "Coding Challenge",
    eventDate: new Date(Date.now() + 172800000).toISOString(),
    poster: "/Events/Icons/event2.png",
    eventKey: "e5f6g7h8",
    isActive: true,
    pointsPerAttendance: 15,
    description: "Compete in coding challenges",
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_ATTENDEES = [
  {
    _id: "607f1f77bcf86cd799439011",
    userId: {
      _id: "507f1f77bcf86cd799439013",
      name: "John Doe",
      email: "john@example.com",
      image: "https://ui-avatars.com/api/?name=John+Doe",
    },
    eventId: "507f1f77bcf86cd799439011",
    eventKey: "a1b2c3d4",
    scannedAt: new Date().toISOString(),
    badgeEarned: "Rookie Explorer",
    pointsEarned: 10,
  },
  {
    _id: "607f1f77bcf86cd799439012",
    userId: {
      _id: "507f1f77bcf86cd799439014",
      name: "Jane Smith",
      email: "jane@example.com",
      image: "https://ui-avatars.com/api/?name=Jane+Smith",
    },
    eventId: "507f1f77bcf86cd799439011",
    eventKey: "a1b2c3d4",
    scannedAt: new Date(Date.now() - 3600000).toISOString(),
    badgeEarned: null,
    pointsEarned: 10,
  },
];

export const MOCK_ADMIN_USER = {
  id: "507f1f77bcf86cd799439015",
  name: "Admin User",
  email: "maitrey.bharambe24@gmail.com",
  image: "https://ui-avatars.com/api/?name=Admin",
};

// Test data generator
export function generateTestEvent() {
  const eventNumber = Math.floor(Math.random() * 10000);
  return {
    eventName: `Test Event ${eventNumber}`,
    eventDate: new Date(Date.now() + Math.random() * 604800000).toISOString(),
    poster: `/Events/Icons/event${(eventNumber % 3) + 1}.png`,
    pointsPerAttendance: Math.floor(Math.random() * 20) + 5,
    description: `Auto-generated test event #${eventNumber}`,
  };
}

export function generateTestAttendee(eventId) {
  const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Eve"];
  const lastNames = ["Johnson", "Williams", "Brown", "Jones", "Garcia"];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  return {
    userId: {
      _id: `507f1f77bcf86cd7994390${Math.floor(Math.random() * 100)}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      image: `https://ui-avatars.com/api/?name=${firstName}+${lastName}`,
    },
    eventId,
    scannedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    badgeEarned: Math.random() > 0.5 ? "Rookie Explorer" : null,
    pointsEarned: Math.floor(Math.random() * 20) + 5,
  };
}

// API helpers for development
export async function testCreateEvent(eventData = generateTestEvent()) {
  const response = await fetch("/api/admin/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });
  const data = await response.json();
  console.log(`[CREATE EVENT] Status: ${response.status}`, data);
  return data;
}

export async function testGetEvents() {
  const response = await fetch("/api/admin/events");
  const data = await response.json();
  console.log(
    `[GET EVENTS] Status: ${response.status}, Count: ${data.data?.length}`
  );
  return data;
}

export async function testGetAttendees(eventId) {
  const response = await fetch(`/api/admin/attendance/${eventId}`);
  const data = await response.json();
  console.log(
    `[GET ATTENDEES] Status: ${response.status}, Count: ${data.data?.attendees?.length}`
  );
  return data;
}

export async function testMarkAttendance(eventKey, eventId) {
  const response = await fetch("/api/attendance/mark", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventKey, eventId }),
  });
  const data = await response.json();
  console.log(`[MARK ATTENDANCE] Status: ${response.status}`, data);
  return data;
}

export async function testGenerateQR(eventId) {
  const response = await fetch("/api/qr/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId }),
  });
  const data = await response.json();
  console.log(`[GENERATE QR] Status: ${response.status}`, {
    eventKey: data.event?.eventKey,
    eventId: data.event?._id,
  });
  return data;
}

// Console commands for manual testing
export const DevConsole = {
  // Paste in browser console while logged in as admin
  async runFullFlow() {
    console.log("🚀 Running full integration test...");

    // 1. Create event
    const eventResponse = await testCreateEvent();
    const eventId = eventResponse.data?._id;
    const eventKey = eventResponse.data?.eventKey;

    if (!eventId) {
      console.error("❌ Failed to create event");
      return;
    }

    console.log(`✅ Event created: ${eventId}`);

    // 2. Get all events
    await testGetEvents();

    // 3. Generate QR
    const qrResponse = await testGenerateQR(eventId);
    console.log(`✅ QR payload: ${qrResponse.payload}`);

    // 4. Mark attendance
    const attendanceResponse = await testMarkAttendance(eventKey, eventId);
    console.log(
      `✅ Attendance marked. Points: ${attendanceResponse.data?.pointsEarned}`
    );

    // 5. Try duplicate (should fail)
    const dupResponse = await testMarkAttendance(eventKey, eventId);
    if (dupResponse.error === "Already Claimed") {
      console.log("✅ Duplicate prevention working!");
    }

    // 6. Get attendees
    await testGetAttendees(eventId);

    console.log("✅ Full test completed successfully!");
  },
};

// For use in browser console during development
if (typeof window !== "undefined") {
  window._devTools = DevConsole;
  console.log("🎮 Dev tools available! Run: window._devTools.runFullFlow()");
}

export default {
  MOCK_EVENTS,
  MOCK_ATTENDEES,
  MOCK_ADMIN_USER,
  generateTestEvent,
  generateTestAttendee,
  testCreateEvent,
  testGetEvents,
  testGetAttendees,
  testMarkAttendance,
  testGenerateQR,
  DevConsole,
};
