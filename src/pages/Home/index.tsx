// src/pages/home/Home.tsx

"use client";

import { Heading, Text, Button, Box, Flex, Grid } from "@chakra-ui/react";
import { GenericPage } from "../../components/ui/generic-page";

import { useColorModeValue } from "@/components/ui/color-mode";
import React, { useEffect, useState } from "react";

import { useAuth, User } from "@/context";
import { API_BASE_URL, ENDPOINTS } from "@/api/config";

import { useNavigate } from "react-router";

import { useNotify } from "@/context/notify";
import { MatchStatusButton } from "@/components/home/match-status-button";
import { Features } from "@/components/home/features";
import { MatchHistory } from "@/components/home/match-history";
import { UserProfileCard } from "@/components/home/user-profile-card";
import { MatchStatistics } from "@/components/home/match-statistics";
import { StatusDialog } from "@/components/home/status-dialog";

export const Home = () => {
  const navigate = useNavigate();

  const gradient = useColorModeValue(
    "linear(to-r, blue.400, purple.500)",
    "linear(to-r, blue.300, purple.200)"
  );
  const { state, dispatch } = useAuth();
  const { notifyPromise } = useNotify();
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [matchHistory, setMatchHistory] = useState<User[]>([]);
  const [matchCounts, setMatchCounts] = useState<Record<string, number>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>("idle");
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);

  // Fetch initial data and match details
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch queue status
        const statusRes = await fetch(
          `${API_BASE_URL}${ENDPOINTS.QUEUE.STATUS}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const statusData = await statusRes.json();
        setCurrentStatus(statusData.state);
        dispatch({ type: "SET_QUEUE_STATUS", payload: statusData.state });

        // Fetch match history
        const historyRes = await fetch(
          `${API_BASE_URL}${ENDPOINTS.QUEUE.MATCH_HISTORY}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMatchHistory(await historyRes.json());

        // Fetch match counts
        const countsRes = await fetch(
          `${API_BASE_URL}${ENDPOINTS.QUEUE.MATCH_COUNTS}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMatchCounts(await countsRes.json());
      } catch (error) {
        notifyPromise(Promise.reject(error), {
          error: { title: "Error", description: "Failed to load data" },
        });
      }
    };

    fetchInitialData();
  }, [dispatch, navigate, notifyPromise]);

  // Fetch match details when status changes to matched
  useEffect(() => {
    const fetchMatchDetails = async () => {
      if (currentStatus === "matched") {
        setIsLoadingMatch(true);
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(
            `${API_BASE_URL}${ENDPOINTS.QUEUE.CURRENT_MATCH}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = await res.json();
          setMatchedUser(data);
          setIsDialogOpen(true);
        } catch (error) {
          console.error("Failed to fetch match details:", error);
        } finally {
          setIsLoadingMatch(false);
        }
      }
    };

    if (currentStatus === "matched") fetchMatchDetails();
  }, [currentStatus]);

  const handleBookCall = () => {
    notifyPromise(
      fetch(`${API_BASE_URL}${ENDPOINTS.QUEUE.BOOK}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then(async (res) => {
        const data = await res.json();
        setCurrentStatus(data.state);
        dispatch({ type: "SET_QUEUE_STATUS", payload: data.state });
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

  // Removed handleConfirmParticipation

  const handleCheckStatus = () => {
    notifyPromise(
      fetch(`${API_BASE_URL}${ENDPOINTS.QUEUE.STATUS}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then(async (res) => {
        const data = await res.json();
        setCurrentStatus(data.state);
        dispatch({ type: "SET_QUEUE_STATUS", payload: data.state });
        setIsDialogOpen(true);
        return data;
      }),
      {
        loading: { title: "Checking...", description: "Fetching status" },
        success: {
          title: "Status Updated",
          description: "Queue status refreshed",
        },
        error: { title: "Error", description: "Failed to check status" },
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
            <Button
              shadow="xl"
              borderRadius="lg"
              variant="solid"
              colorPalette={"blue"}
              size="lg"
              px={8}
              py={6}
              fontSize="xl"
              onClick={handleCheckStatus}
            >
              Check Status
            </Button>
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

          {currentStatus === "matched" && matchedUser && (
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
            // Removed onConfirm handler
            onClose={() => setIsDialogOpen(false)}
          />
        )}
      </Box>
    </GenericPage>
  );
};
