import React, { useEffect, createContext, useContext, useState } from "react";

import { io, Socket } from "socket.io-client";
import { useAuth } from "..";

// Add these type definitions
type ChatMessage = {
  _id: string;
  sender: string | User;
  receiver: string | User;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

type User = {
  _id: string;
  username: string;
  email: string;
  matches: string[];
};

type Notification = {
  _id: string;
  userId: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: Date;
};

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  messages: ChatMessage[];
  notifications: Notification[];
  sendMessage: (receiverId: string, content: string) => void;
  markNotificationRead: (notificationId: string) => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  messages: [],
  notifications: [],
  sendMessage: () => {},
  markNotificationRead: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { state } = useAuth();

  const sendMessage = (receiverId: string, content: string) => {
    if (socket && isConnected) {
      socket.emit("sendMessage", { receiverId, content });
    }
  };

  const markNotificationRead = (notificationId: string) => {
    if (socket && isConnected) {
      socket.emit("markNotificationRead", notificationId);
    }
  };

  useEffect(() => {
    if (state.isAuthenticated && !socket) {
      const newSocket = io("https://relate15-be.onrender.com", {
        auth: {
          token: sessionStorage.getItem("token"),
        },
        transports: ["websocket"],
      });

      newSocket.on("connect", () => {
        setIsConnected(true);
        console.log("Socket connected:", newSocket.id);
      });

      newSocket.on("disconnect", () => {
        setIsConnected(false);
        console.log("Socket disconnected");
      });

      newSocket.on("newMessage", (message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
      });

      newSocket.on("newNotification", (notification: Notification) => {
        setNotifications((prev) => [...prev, notification]);
      });

      newSocket.on("notificationRead", (notificationId: string) => {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
        );
      });

      newSocket.on("error", (error: string) => {
        console.error("Socket error:", error);
      });

      setSocket(newSocket);
    }

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [state.isAuthenticated]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        messages,
        notifications,
        sendMessage,
        markNotificationRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Rest of your existing components remain the same with proper typing
