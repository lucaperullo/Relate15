import React, { useEffect, createContext, useContext, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "..";

type ChatMessage = {
  id: string;
  sender: {
    id: string;
    name: string;
    profilePictureUrl?: string;
  };
  content: string;
  createdAt: any;
  read: boolean;
};

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  messages: Record<string, ChatMessage[]>; // 🔥 Store chat history per user
  sendMessage: (receiverId: string, content: string) => void;
  joinRoom: (receiverId: string) => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  messages: {},
  sendMessage: () => {},
  joinRoom: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { state } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});

  useEffect(() => {
    if (state.isAuthenticated && !socket) {
      console.log("Attempting to connect WebSocket...");

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      console.log("🔑 Using token for WebSocket:", token);

      if (!token) {
        console.error("❌ No token found. WebSocket will not connect.");
        return;
      }

      const websocketUrl =
        import.meta.env.MODE === "production"
          ? "wss://relate15.onrender.com"
          : "http://localhost:5111";

      const newSocket = io(websocketUrl, {
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

      newSocket.on(
        "chatHistory",
        ({
          receiverId,
          history,
        }: {
          receiverId: string;
          history: ChatMessage[];
        }) => {
          console.log("📜 Chat history received for", receiverId, ":", history);
          setMessages((prev) => ({
            ...prev,
            [receiverId]: history, // Store chat history per user
          }));
        }
      );

      newSocket.on("newMessage", (message: ChatMessage) => {
        console.log("📩 New message received:", message);
        setMessages((prev) => ({
          ...prev,
          [message.sender.id]: [...(prev[message.sender.id] || []), message],
        }));
      });

      setSocket(newSocket);

      return () => {
        console.log("🔌 Disconnecting WebSocket...");
        newSocket.disconnect();
      };
    }
  }, [state.isAuthenticated]);

  /** 📌 Function to join a chat room and fetch chat history */
  const joinRoom = (receiverId: string) => {
    if (socket) {
      console.log(`📢 Joining chat room: ${receiverId}`);
      socket.emit("joinRoom", receiverId);
    }
  };

  /** 📌 Function to send a message */
  const sendMessage = (receiverId: string, content: string) => {
    if (socket && isConnected) {
      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: {
          id: state.user.id,
          name: state.user.name,
          profilePictureUrl: state.user.profilePictureUrl,
        },
        content,
        createdAt: new Date().toISOString(),
        read: false,
      };

      // ✅ Update UI instantly for faster feedback
      setMessages((prev) => ({
        ...prev,
        [receiverId]: [...(prev[receiverId] || []), newMessage],
      }));

      socket.emit("sendMessage", { receiverId, content });
    } else {
      console.error("Socket is not connected");
    }
  };

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, messages, sendMessage, joinRoom }}
    >
      {children}
    </SocketContext.Provider>
  );
};
