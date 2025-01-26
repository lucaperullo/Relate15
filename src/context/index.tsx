"use client";

import { API_BASE_URL, ENDPOINTS } from "@/api/config";
import React, {
  createContext,
  useContext,
  useReducer,
  Dispatch,
  useEffect,
  useCallback,
} from "react";

// Define the User type
export type User = {
  _id: string;
  email: string;
  name: string;
  role: string;
  profilePictureUrl?: string;
  bio: string;
  interests: string[];
  matches: string[]; // Add matches array
  matchCount: Record<string, number>; // Add matchCount map
};

// Define the AuthState type
type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  queueStatus: "idle" | "waiting" | "matched";
  error: string | null;
  isVerifying: boolean;
  events: any[]; // Add events to the state
};

// Define the Action types
type Action =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_AUTH"; payload: boolean }
  | { type: "SET_QUEUE_STATUS"; payload: AuthState["queueStatus"] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOGOUT"; payload?: string | null }
  | { type: "SET_VERIFYING"; payload: boolean }
  | { type: "SET_EVENTS"; payload: any[] }; // Add action for setting events

// Initial state for the AuthContext
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  queueStatus: "idle",
  error: null,
  isVerifying: true,
  events: [], // Initialize events as an empty array
};

// Reducer function to handle state transitions
const reducer = (state: AuthState, action: Action): AuthState => {
  console.log(`Action Dispatched: ${action.type}`, action.payload);

  switch (action.type) {
    case "SET_USER":
      console.log("Previous User State:", state.user);
      console.log("Setting User:", action.payload);
      return { ...state, user: action.payload };

    case "SET_AUTH":
      console.log("Previous Auth State:", state.isAuthenticated);
      console.log("Setting Authenticated:", action.payload);
      return { ...state, isAuthenticated: action.payload };

    case "SET_QUEUE_STATUS":
      console.log("Previous Queue Status:", state.queueStatus);
      console.log("Setting Queue Status:", action.payload);
      return { ...state, queueStatus: action.payload };

    case "SET_LOADING":
      console.log("Previous Loading State:", state.isLoading);
      console.log("Setting Loading State:", action.payload);
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      console.log("Previous Error State:", state.error);
      console.log("Setting Error:", action.payload);
      return { ...state, error: action.payload };

    case "LOGOUT":
      console.log("Logging out. Resetting state.");
      return { ...initialState, isLoading: false, isVerifying: false };

    case "SET_VERIFYING":
      console.log("Previous Verifying State:", state.isVerifying);
      console.log("Setting Verifying State:", action.payload);
      return { ...state, isVerifying: action.payload };

    case "SET_EVENTS":
      console.log("Previous Events:", state.events);
      console.log("Setting Events:", action.payload);
      return { ...state, events: action.payload };

    default:
      //@ts-ignore
      console.warn(`Unhandled action type: ${action.type}`);
      return state;
  }
};

// Define the ContextType
type ContextType = {
  state: AuthState;
  dispatch: Dispatch<Action>;
  api: typeof ENDPOINTS;
  baseUrl: string;
  logout: () => Promise<void>;
  verifyAuth: () => Promise<void>;
  fetchEvents: () => Promise<void>; // Add fetchEvents to the context
  fetchQueueStatus: () => Promise<void>; // Add fetchQueueStatus to the context
};

// Create the AuthContext
const AuthContext = createContext<ContextType>({} as ContextType);

// AuthProvider component to wrap around the application
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Function to verify authentication
  const verifyAuth = useCallback(async () => {
    console.log("Verifying authentication...");
    dispatch({ type: "SET_VERIFYING", payload: true });
    try {
      const token = localStorage.getItem("token");
      console.log("Token retrieved for verification:", token);

      if (!token) {
        console.warn("No token found. Logging out.");
        dispatch({ type: "LOGOUT" });
        return;
      }

      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.VERIFY}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Auth verification response status:", response.status);

      if (!response.ok) {
        console.error("Auth verification failed. Logging out.");
        localStorage.removeItem("token");
        dispatch({ type: "LOGOUT" });
        return;
      }

      const userData = await response.json();
      console.log("Auth verification successful. User data:", userData.user);
      dispatch({ type: "SET_USER", payload: userData.user });
      dispatch({ type: "SET_AUTH", payload: true });
    } catch (error) {
      console.error("Error during authentication verification:", error);
      dispatch({ type: "SET_ERROR", payload: "Session verification failed" });
      dispatch({ type: "LOGOUT" });
    } finally {
      dispatch({ type: "SET_VERIFYING", payload: false });
      console.log("Authentication verification process completed.");
    }
  }, []);

  // Function to handle logout
  const logout = useCallback(async () => {
    console.log("Initiating logout process...");
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const token = localStorage.getItem("token");
      console.log("Token retrieved for logout:", token);
      if (token) {
        const response = await fetch(
          `${API_BASE_URL}${ENDPOINTS.AUTH.LOGOUT}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Logout response status:", response.status);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      localStorage.removeItem("token");
      dispatch({ type: "LOGOUT" });
      console.log("Logout process completed.");
    }
  }, []);

  // Function to fetch calendar events
  const fetchEvents = useCallback(async () => {
    console.log("Fetching calendar events...");
    try {
      const token = localStorage.getItem("token");
      console.log("Token retrieved for fetching events:", token);
      if (!token) {
        console.warn("No token found. Cannot fetch events.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.CALENDAR.EVENTS}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Fetch events response status:", response.status);

      if (!response.ok) {
        console.error("Failed to fetch events.");
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      console.log("Events fetched successfully:", data.events);
      dispatch({ type: "SET_EVENTS", payload: data.events });
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to fetch calendar events",
      });
    }
  }, []);

  // Function to fetch queue status
  const fetchQueueStatus = useCallback(async () => {
    console.log("Fetching queue status...");
    try {
      const token = localStorage.getItem("token");
      console.log("Token retrieved for fetching queue status:", token);
      if (!token) {
        console.warn("No token found. Cannot fetch queue status.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.QUEUE.STATUS}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Fetch queue status response status:", response.status);

      if (!response.ok) {
        console.error("Failed to fetch queue status.");
        throw new Error("Failed to fetch queue status");
      }

      const data = await response.json();
      console.log("Queue status fetched successfully:", data.state);
      dispatch({ type: "SET_QUEUE_STATUS", payload: data.state });
    } catch (error) {
      console.error("Error fetching queue status:", error);
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to fetch queue status",
      });
    }
  }, []);

  // Initialize authentication on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("Initializing authentication...");
      await verifyAuth();
      dispatch({ type: "SET_LOADING", payload: false });
      console.log("Authentication initialization completed.");
    };

    initializeAuth();
  }, [verifyAuth]);

  // Log state updates
  useEffect(() => {
    console.log("AuthState Updated:", state);
  }, [state]);

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
        api: ENDPOINTS,
        baseUrl: API_BASE_URL,
        logout,
        verifyAuth,
        fetchEvents,
        fetchQueueStatus, // Add fetchQueueStatus to the context value
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
