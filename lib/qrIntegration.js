export async function markAttendance(eventKey, eventId) {
  try {
    const response = await fetch("/api/attendance/mark", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventKey,
        eventId,
      }),
    });

    const data = await response.json();

    if (response.status === 409 && data.error === "Already Claimed") {
      return {
        success: false,
        status: 409,
        message: "Already Claimed",
        description: "You already marked attendance for this event",
      };
    }

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data.error || "Failed to mark attendance",
        description: data.message || "",
      };
    }

    return {
      success: true,
      status: 201,
      message: "Attendance Marked!",
      description: `You earned ${data.data.pointsEarned} points${
        data.data.badgeEarned ? ` and unlocked ${data.data.badgeEarned}!` : ""
      }`,
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: "Network Error",
      description: error.message,
    };
  }
}

export function parseQRPayload(qrData) {
  try {
    const payload = JSON.parse(qrData);
    if (payload.eventKey && payload.eventId) {
      return {
        valid: true,
        eventKey: payload.eventKey,
        eventId: payload.eventId,
      };
    }
  } catch (e) {
    // QR data might be in format: eventKey:eventId
    const parts = qrData.split(":");
    if (parts.length === 2) {
      return {
        valid: true,
        eventKey: parts[0],
        eventId: parts[1],
      };
    }
  }

  return {
    valid: false,
    message: "Invalid QR code format",
  };
}
