export const ADMIN_RESPONSES = {
  UNAUTHORIZED: {
    status: 401,
    body: { error: "Unauthorized", message: "Authentication required" },
  },
  FORBIDDEN: {
    status: 403,
    body: { error: "Access denied", message: "Admin access required" },
  },
  NOT_FOUND: {
    status: 404,
    body: { error: "Not found", message: "Resource not found" },
  },
  CONFLICT: {
    status: 409,
    body: { error: "Conflict", message: "Resource already exists" },
  },
  ALREADY_CLAIMED: {
    status: 409,
    body: {
      error: "Already Claimed",
      message: "You already marked attendance for this event",
    },
  },
  INACTIVE_EVENT: {
    status: 400,
    body: {
      error: "Event inactive",
      message: "This event is not currently active",
    },
  },
};

export function createResponse(status, data) {
  return {
    status,
    body: data,
  };
}
