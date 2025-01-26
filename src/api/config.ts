export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    VERIFY: "/auth/verify",
    LOGOUT: "/auth/logout",
  },
  QUEUE: {
    BOOK: "/queue/book",
    STATUS: "/queue/status",
    MATCH_HISTORY: "/queue/match-history", // New endpoint for match history
    CURRENT_MATCH: "/queue/current-match", // New endpoint for current match
    MATCH_COUNTS: "/queue/match-counts", // New endpoint for match counts
    CONFIRM: "/queue/confirm", // New endpoint for confirming participation
  },
  USER: {
    PROFILE: "/user/profile",
  },
  CALENDAR: {
    EVENTS: "/calendar/events", // Get all events for the user
    BOOK: "/calendar/book", // Book a new event
    UPDATE: "/calendar/events/:id", // Update an event
    DELETE: "/calendar/events/:id", // Delete an event
  },
  HEALTH: "/health",
};
