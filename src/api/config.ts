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
    MATCH_HISTORY: "/queue/history",
    CURRENT_MATCH: "/queue/current",
    MATCH_COUNTS: "/queue/match-counts",
    CONFIRM: "/queue/confirm",
  },
  CHAT: {
    SEND: "/chat/send",
    MARK_AS_READ: "/chat/mark-as-read",
  },
  HEALTH: "/health",
};
