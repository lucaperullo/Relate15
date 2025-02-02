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
import { useSocket } from "@/context/socket";

// Define the User type
export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  profilePictureUrl?: string;
  bio: string;
  interests: string[];
  matches: string[];
  matchCount: Record<string, number>;
};

// Define the AuthState type
type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  queueStatus: "idle" | "waiting" | "matched";
  matchedUser: User | null;
  error: string | null;
  isVerifying: boolean;
  events: any[];
};

// Define the Action types
type Action =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_AUTH"; payload: boolean }
  | { type: "SET_QUEUE_STATUS"; payload: AuthState["queueStatus"] }
  | { type: "SET_MATCHED_USER"; payload: User | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOGOUT"; payload?: string | null }
  | { type: "SET_VERIFYING"; payload: boolean }
  | { type: "SET_EVENTS"; payload: any[] };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  queueStatus: "idle",
  matchedUser: null,
  error: null,
  isVerifying: true,
  events: [],
};

// Reducer function
const reducer = (state: AuthState, action: Action): AuthState => {
  console.log(`Action Dispatched: ${action.type}`, action.payload);

  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };

    case "SET_AUTH":
      return { ...state, isAuthenticated: action.payload };

    case "SET_QUEUE_STATUS":
      return { ...state, queueStatus: action.payload };

    case "SET_MATCHED_USER":
      return { ...state, matchedUser: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "LOGOUT":
      return { ...initialState, isLoading: false, isVerifying: false };

    case "SET_VERIFYING":
      return { ...state, isVerifying: action.payload };

    case "SET_EVENTS":
      return { ...state, events: action.payload };

    default:
      console.warn(`Unhandled action type`);
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
};

// Create the AuthContext
const AuthContext = createContext<ContextType>({} as ContextType);

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { socket } = useSocket();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Function to verify authentication
  const verifyAuth = useCallback(async () => {
    console.log("🔍 Verifying authentication...");
    dispatch({ type: "SET_VERIFYING", payload: true });

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      console.log("🟢 Token retrieved for verification:", token);

      if (!token) {
        console.warn("❌ No token found. Logging out.");
        dispatch({ type: "LOGOUT" });
        return;
      }

      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.VERIFY}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("🔍 Auth verification response status:", response.status);

      if (!response.ok) {
        console.error("❌ Auth verification failed. Logging out.");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        dispatch({ type: "LOGOUT" });
        return;
      }

      const userData = await response.json();
      console.log("✅ Auth verification successful. User data:", userData.user);

      if (userData.token) {
        console.log("🔄 Storing refreshed token:", userData.token);
        localStorage.setItem("token", userData.token);
        sessionStorage.setItem("token", userData.token);
      }

      dispatch({ type: "SET_USER", payload: userData.user });
      dispatch({ type: "SET_AUTH", payload: true });
    } catch (error) {
      console.error("❌ Error during authentication verification:", error);
      dispatch({ type: "SET_ERROR", payload: "Session verification failed" });
      dispatch({ type: "LOGOUT" });
    } finally {
      dispatch({ type: "SET_VERIFYING", payload: false });
      console.log("✅ Authentication verification process completed.");
    }
  }, []);

  // **🔥 Listen to WebSocket Events for Matchmaking**
  useEffect(() => {
    if (socket) {
      socket.on("queueStatus", ({ state, matchedUser }: any) => {
        console.log("🔥 WebSocket Queue Status Update:", state, matchedUser);
        dispatch({ type: "SET_QUEUE_STATUS", payload: state });

        if (state === "matched" && matchedUser) {
          dispatch({ type: "SET_MATCHED_USER", payload: matchedUser });
        }
      });

      return () => {
        socket.off("queueStatus");
      };
    }
  }, [socket]);

  // Function to handle logout
  const logout = useCallback(async () => {
    console.log("🔌 Logging out...");
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (token) {
        await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.LOGOUT}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("❌ Error during logout:", error);
    } finally {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      dispatch({ type: "LOGOUT" });
      console.log("✅ Logout process completed.");
    }
  }, []);

  // Initialize authentication on component mount
  useEffect(() => {
    console.log("🔄 Initializing authentication...");
    verifyAuth().finally(() => {
      dispatch({ type: "SET_LOADING", payload: false });
      console.log("✅ Authentication initialization completed.");
    });
  }, []);

  // Log state updates
  useEffect(() => {
    console.log("📝 AuthState Updated:", state);
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
