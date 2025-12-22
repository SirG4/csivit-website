// Event definitions (code-driven)
export const EVENTS = {
  CSI_ORIENTATION_2025: {
    eventKey: "CSI_ORIENTATION_2025",
    eventName: "CSI Orientation 2025",
    badgeName: "Orientation Explorer",
    isActive: true,
  },
  // Add more events as needed
};

// Get current active event
export const CURRENT_EVENT =
  Object.values(EVENTS).find((e) => e.isActive) || EVENTS.CSI_ORIENTATION_2025;
