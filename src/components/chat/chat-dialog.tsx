"use client";

import React, { forwardRef, useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  VStack,
  HStack,
  Text,
  BoxProps,
  Badge,
} from "@chakra-ui/react";
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from "@/components/ui/dialog";
import { useAuth, User } from "@/context";
import io from "socket.io-client";
import { ENDPOINTS, API_BASE_URL } from "@/api/config";
import { Avatar } from "../ui/avatar";

// Initialize Socket.IO client
const socket = io(API_BASE_URL, {
  auth: {
    token: sessionStorage.getItem("token"), // Pass token for authentication
  },
});

interface Message {
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
}

export const ScrollView = forwardRef<HTMLDivElement, BoxProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        overflowY="auto"
        css={{
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "var(--colors-border-muted)",
            borderRadius: "3px",
          },
        }}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

export const ChatDialog = ({
  match,
  isCurrent,
}: {
  match?: User;
  isCurrent?: boolean;
}) => {
  const { state } = useAuth();

  const [selectedMatch, setSelectedMatch] = useState<string | null>(
    match?._id || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  // Fetch chat history with a specific match
  const fetchChatHistory = async (matchId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.CALENDAR.EVENTS}/${matchId}/chat`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch chat history");
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  // Handle sending a message
  const sendMessage = () => {
    if (!input.trim() || !selectedMatch) return;

    const messagePayload = {
      receiverId: selectedMatch,
      content: input.trim(),
    };

    // Emit the message via Socket.IO
    socket.emit("sendMessage", messagePayload);

    // Optimistically update the chat
    const newMessage: Message = {
      sender: state.user._id,
      receiver: selectedMatch,
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);

    // Clear the input field
    setInput("");
  };

  // Listen for incoming messages
  useEffect(() => {
    socket.on("newMessage", (message: Message) => {
      if (
        (message.sender === selectedMatch &&
          message.receiver === state.user._id) ||
        (message.sender === state.user._id &&
          message.receiver === selectedMatch)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off("newMessage");
    };
  }, [selectedMatch, state.user._id]);

  // Auto-fetch chat history when match prop changes
  useEffect(() => {
    if (match?._id) {
      setSelectedMatch(match._id);
      fetchChatHistory(match._id);
    }
  }, [match?._id]);

  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <Box
          p="4"
          bg="gray.950"
          _light={{ bg: "gray.50" }}
          cursor="pointer"
          _hover={{ opacity: 0.8 }}
          transition="opacity 0.2s"
        >
          <HStack gap="4">
            <Avatar
              name={match?.name || "Unknown Match"}
              size="lg"
              src={match?.profilePictureUrl}
            />
            <VStack gap="0">
              <Text _light={{ color: "gray.950" }} fontWeight="medium">
                {match?.name || "New Match"}
                {isCurrent && (
                  <Badge ml="2" colorScheme="green">
                    Current
                  </Badge>
                )}
              </Text>
              <Text
                color="fg.muted"
                textStyle="sm"
                textOverflow="ellipsis"
                overflow="hidden"
                w="80%"
                whiteSpace="nowrap"
              >
                {/* {match?.matchedAt
                  ? `Matched: ${new Date(match.matchedAt).toLocaleDateString()}`
                  : "Click to view chat"} */}
              </Text>
            </VStack>
          </HStack>
        </Box>
      </DialogTrigger>

      <DialogContent maxW="500px">
        <DialogHeader>
          <DialogTitle>Chat with {match?.name || "Match"}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <VStack align="stretch">
            {/* Chat Messages */}
            {selectedMatch && (
              <Box
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
                p={4}
                h="300px"
                overflowY="scroll"
              >
                <ScrollView>
                  <VStack align="stretch">
                    {messages.map((msg, index) => (
                      <Flex
                        key={index}
                        justify={
                          msg.sender === state.user._id
                            ? "flex-end"
                            : "flex-start"
                        }
                      >
                        <Box
                          bg={
                            msg.sender === state.user._id
                              ? "blue.500"
                              : "gray.200"
                          }
                          color={
                            msg.sender === state.user._id ? "white" : "black"
                          }
                          px={4}
                          py={2}
                          borderRadius="md"
                          maxW="70%"
                        >
                          <Text>{msg.content}</Text>
                        </Box>
                      </Flex>
                    ))}
                  </VStack>
                </ScrollView>
              </Box>
            )}

            {/* Message Input */}
            {selectedMatch && (
              <HStack>
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                />
                <Button onClick={sendMessage} colorScheme="blue">
                  Send
                </Button>
              </HStack>
            )}
          </VStack>
        </DialogBody>
        <DialogFooter>
          <DialogCloseTrigger asChild>
            <Button variant="outline" colorScheme="red">
              Close
            </Button>
          </DialogCloseTrigger>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};
