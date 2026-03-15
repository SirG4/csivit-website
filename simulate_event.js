const fs = require('fs');

async function createEvent() {
  const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="; // 1x1 png
  
  const payload = {
    eventName: "Test Event API",
    eventDate: new Date().toISOString(),
    description: "Testing badge storage",
    pointsPerAttendance: 10,
    poster: dummyBase64,
    minMembers: 1,
    maxMembers: 1,
    badgeIcon: dummyBase64,
    winnerBadge1: dummyBase64,
    winnerBadge2: dummyBase64,
    winnerBadge3: dummyBase64,
    isRegistrationLive: true,
    isHidden: false,
  };

  try {
    const res = await fetch("http://localhost:3000/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

createEvent();
