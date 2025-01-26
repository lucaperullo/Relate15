import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Home } from "./pages/Home";
import { Calendar } from "./pages/Calendar";
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "./context";
import { useColorModeValue } from "./components/ui/color-mode";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { state } = useAuth();
  const location = useLocation();

  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const gradient = useColorModeValue(
    "linear(to-r, blue.400, purple.500)",
    "linear(to-r, blue.300, purple.200)"
  );
  return (
    <motion.div
      animate={{
        background: [
          gradient,
          "linear-gradient(to right, #667eea, #764ba2)",
          gradient,
        ],
      }}
      style={{ background: gradient }}
      className="flex min-h-screen"
    >
      <main className="flex-1 p-8">{children}</main>
      <Toaster />
    </motion.div>
  );
};

export const App = () => {
  const { state, dispatch } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch("/api/auth/verify", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            dispatch({ type: "SET_AUTH", payload: true });
            dispatch({ type: "SET_USER", payload: data.user });
          } else {
            sessionStorage.removeItem("token");
            dispatch({ type: "SET_AUTH", payload: false });
          }
        } catch (error) {
          sessionStorage.removeItem("token");
          dispatch({ type: "SET_AUTH", payload: false });
        }
      }
    };
    checkAuth();
  }, [dispatch]);

  useEffect(() => {
    if (state.isAuthenticated && location.pathname === "/login") {
      const from = location.state?.from?.pathname || "/home";
      navigate(from, { replace: true });
    }
  }, [state.isAuthenticated, location, navigate]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Home />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Home />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Calendar />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AnimatePresence>
  );
};
