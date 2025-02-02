"use client";

import { Heading, Text, Button, Box, Flex, Grid } from "@chakra-ui/react";
import { GenericPage } from "../../components/ui/generic-page";
import { useColorModeValue } from "@/components/ui/color-mode";
import React, { useEffect, useState } from "react";
import { useAuth, User } from "@/context";
import { useNavigate } from "react-router";
import { useNotify } from "@/context/notify";
import { MatchStatusButton } from "@/components/home/match-status-button";
import { Features } from "@/components/home/features";
import { MatchHistory } from "@/components/home/match-history";
import { UserProfileCard } from "@/components/home/user-profile-card";
import { MatchStatistics } from "@/components/home/match-statistics";
import { StatusDialog } from "@/components/home/status-dialog";
import { useSocket } from "@/context/socket";

export const Home = () => {
  const navigate = useNavigate();
  const gradient = useColorModeValue(
    "linear(to-r, blue.400, purple.500)",
    "linear(to-r, blue.300, purple.200)"
  );

  const { state, dispatch } = useAuth();
  const { notifyPromise } = useNotify();
  const { socket, isConnected } = useSocket();

  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [matchHistory, setMatchHistory] = useState<User[]>([]);
  const [matchCounts, setMatchCounts] = useState<Record<string, number>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>("idle");
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);

  /** 📌 Request Initial Queue Status via WebSocket */
  useEffect(() => {
    if (socket && isConnected) {
      console.log("🔄 Requesting initial queue status...");
      socket.emit("getQueueStatus");

      socket.on("queueStatus", ({ state, matchedWith }) => {
        console.log(`🟢 Initial queue status: ${state}`);
        setCurrentStatus(state);
        dispatch({ type: "SET_QUEUE_STATUS", payload: state });

        if (state === "matched" && matchedWith) {
          setMatchedUser(matchedWith);
          setIsDialogOpen(true);
        }
      });

      return () => {
        socket.off("queueStatus");
      };
    }
  }, [socket, isConnected, dispatch]);

  /** 📌 Listen for Queue Updates */
  useEffect(() => {
    if (socket) {
      socket.on("queueUpdated", ({ state, matchedWith }) => {
        console.log(`🟢 Queue updated: ${state}`);
        setCurrentStatus(state);
        dispatch({ type: "SET_QUEUE_STATUS", payload: state });

        if (state === "matched" && matchedWith) {
          setMatchedUser(matchedWith);
          setIsDialogOpen(true);
        }
      });

      return () => {
        socket.off("queueUpdated");
      };
    }
  }, [socket, dispatch]);

  /** 📌 Fetch Match History & Match Counts */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch match history
        const historyRes = await fetch("/queue/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatchHistory(await historyRes.json());

        // Fetch match counts
        const countsRes = await fetch("/queue/match-counts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatchCounts(await countsRes.json());
      } catch (error) {
        notifyPromise(Promise.reject(error), {
          error: { title: "Error", description: "Failed to load data" },
        });
      }
    };

    fetchInitialData();
  }, [dispatch, navigate, notifyPromise]);

  /** 📌 Book a Call (Join Queue) */
  const handleBookCall = async () => {
    notifyPromise(
      fetch("/queue/book", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then(async (res) => {
        const data = await res.json();
        setCurrentStatus(data.state);
        dispatch({ type: "SET_QUEUE_STATUS", payload: data.state });

        // **🔥 Notify WebSocket Immediately**
        socket?.emit("queueUpdated", {
          state: data.state,
          matchedWith: data.matchedWith || null,
        });

        if (data.state === "matched") {
          setMatchedUser(data.matchedWith);
          setIsDialogOpen(true);
        }

        return data;
      }),
      {
        loading: { title: "Searching...", description: "Looking for matches" },
        success: { title: "Queued!", description: "Searching for connections" },
        error: { title: "Error", description: "Failed to join queue" },
      }
    );
  };

  return (
    <GenericPage>
      <Box p={4}>
        {/* Hero Section */}
        <Box textAlign="center" mb={12}>
          <Heading
            as="h1"
            size="2xl"
            bgGradient={gradient}
            bgClip="text"
            mb={4}
          >
            Connect in 15 Minutes or Less
          </Heading>
          <Text fontSize="xl" color="gray.500" mb={6}>
            Quick, focused conversations to spark creativity and connections
          </Text>

          <Flex
            direction={{ base: "column", md: "row" }}
            align="center"
            justify="center"
            gap={4}
          >
            <MatchStatusButton
              status={currentStatus}
              onClick={handleBookCall}
            />
          </Flex>
        </Box>

        {/* Features Section */}
        <Features />

        {/* Match Information Section */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
          gap={8}
          maxW="6xl"
          mx="auto"
          mb={12}
        >
          <MatchHistory matches={matchHistory} />

          {matchedUser && (
            <Box>
              <Heading size="md" mb={4} textAlign="center">
                Current Match
              </Heading>
              <UserProfileCard user={matchedUser} />
            </Box>
          )}

          <MatchStatistics matches={matchHistory} />
        </Grid>

        {/* Status Dialog */}
        {isDialogOpen && (
          <StatusDialog
            status={currentStatus}
            user={matchedUser}
            isLoading={isLoadingMatch}
            onClose={() => setIsDialogOpen(false)}
          />
        )}
      </Box>
    </GenericPage>
  );
};
