import React, { useEffect, createContext, useContext, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "..";

type ChatMessage = {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt: Date;
};

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  messages: ChatMessage[];
  sendMessage: (receiverId: string, content: string) => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  messages: [],
  sendMessage: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { state } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (state.isAuthenticated && !socket) {
      console.log("Attempting to connect WebSocket...");

      let token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      console.log("🔑 Using token for WebSocket:", token);

      if (!token) {
        console.error("❌ No token found. WebSocket will not connect.");
        return;
      }

      const newSocket = io("http://localhost:5111", {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 5000,
      });

      newSocket.on("connect", () => {
        console.log("✅ WebSocket connected:", newSocket.id);
        setIsConnected(true);
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ WebSocket connection error:", error);
      });

      newSocket.on("disconnect", (reason) => {
        console.warn("⚠️ WebSocket disconnected:", reason);
        setIsConnected(false);
      });

      newSocket.on("newMessage", (message: ChatMessage) => {
        console.log("📩 New message received:", message);
        setMessages((prev) => [...prev, message]);
      });

      newSocket.on("chatHistory", (history: ChatMessage[]) => {
        console.log("📜 Chat history received:", history);
        setMessages(history);
      });

      setSocket(newSocket);

      return () => {
        console.log("🔌 Disconnecting WebSocket...");
        newSocket.disconnect();
      };
    }
  }, [state.isAuthenticated]);

  const sendMessage = (receiverId: string, content: string) => {
    if (socket && isConnected) {
      socket.emit("sendMessage", { receiverId, content });
    } else {
      console.error("Socket is not connected");
    }
  };

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, messages, sendMessage }}
    >
      {children}
    </SocketContext.Provider>
  );
};
