// src/api/config.ts

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
    MATCH_HISTORY: "/queue/history", // New endpoint for match history
    CURRENT_MATCH: "/queue/match", // New endpoint for current match
    MATCH_COUNTS: "/queue/match-counts", // New endpoint for match counts
    CONFIRM: "/queue/confirm", // New endpoint for confirming participation
  },
  USER: {
    PROFILE: "/user/profile",
  },
  CALENDAR: {
    EVENTS: "/calendar/events", // GET all events, POST create event
    UPDATE: "/calendar/events/:id", // PUT update event
    DELETE: "/calendar/events/:id", // DELETE event
    CONFIRM: "/calendar/events/:id/confirm", // POST confirm participation
  },
  HEALTH: "/health",
};
