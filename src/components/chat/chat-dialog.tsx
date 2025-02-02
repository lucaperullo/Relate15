"use client";

import React, { forwardRef, useEffect, useState, useRef } from "react";
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
} from "@/components/ui/dialog";
import { useAuth, User } from "@/context";
import { useSocket } from "@/context/socket";
import { Avatar } from "../ui/avatar";

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    profilePictureUrl?: string;
  };
  content: string;
  createdAt: string;
  read: boolean;
}

export const ScrollView = forwardRef<HTMLDivElement, BoxProps>(
  ({ children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        overflowY="auto"
        height="400px"
        css={{
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
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
  const { socket, sendMessage, messages, joinRoom } = useSocket();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(
    match?.id || null
  );
  const [input, setInput] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /** 📌 When chat opens, join the room & ensure correct match */
  useEffect(() => {
    if (match?.id) {
      setSelectedMatch(match.id);
    }
  }, [match?.id]);

  useEffect(() => {
    if (socket && selectedMatch) {
      console.log(`📢 Joining room: ${selectedMatch}`);
      joinRoom(selectedMatch);
    }
  }, [socket, selectedMatch]);

  /** 📌 Auto-scroll when new messages arrive */
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages[selectedMatch || ""]]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  /** 📌 Send a message */
  const handleSendMessage = () => {
    if (input.trim() && selectedMatch) {
      sendMessage(selectedMatch, input.trim());
      setInput("");
    }
  };

  const chatHistory = messages[selectedMatch || ""] || [];

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
          onClick={() => setIsOpen(true)}
        >
          <HStack gap="0">
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
            </VStack>
          </HStack>
        </Box>
      </DialogTrigger>
      <DialogContent maxW="600px">
        <DialogHeader>
          <DialogTitle>Chat with {match?.name || "Match"}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <ScrollView>
            <VStack align="stretch">
              {chatHistory.map((msg, index) => {
                const isSender = msg.sender.id === state.user.id;
                return (
                  <Flex
                    key={index}
                    justify={isSender ? "flex-end" : "flex-start"}
                    align="center"
                    gap="2"
                  >
                    {!isSender && (
                      <Avatar
                        name={msg.sender.name}
                        size="sm"
                        src={msg.sender.profilePictureUrl}
                      />
                    )}
                    <Box
                      bg={isSender ? "blue.500" : "gray.300"}
                      color={isSender ? "white" : "black"}
                      px={4}
                      py={2}
                      borderRadius="lg"
                      maxW="60%"
                      position="relative"
                      css={{
                        clipPath: isSender
                          ? "polygon(10px 0%, 100% 0, 100% 100%, 0% 100%, 10px 80%)"
                          : "polygon(0 0, calc(100% - 10px) 0, 100% 80%, calc(100% - 10px) 100%, 0% 100%)",
                      }}
                    >
                      <Text>{msg.content}</Text>
                    </Box>
                    {isSender && (
                      <Avatar
                        name={state.user.name}
                        size="sm"
                        src={state.user.profilePictureUrl}
                      />
                    )}
                  </Flex>
                );
              })}
              <div ref={messagesEndRef} />
            </VStack>
          </ScrollView>
        </DialogBody>
        <DialogFooter>
          <HStack width="100%">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button colorScheme="blue" onClick={handleSendMessage}>
              Send
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};
