import {
  Flex,
  Box,
  VStack,
  Button,
  Link as ChakraLink,
  ClientOnly,
  Skeleton,
  Spacer,
  HStack,
  Stack,
  Text,
  Badge,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Link, Outlet } from "react-router";
import React, { ReactChild, useState, useEffect } from "react";
import { ColorModeButton, useColorModeValue } from "./color-mode";
import {
  RiHomeLine,
  RiCalendarLine,
  RiArrowRightLine,
  RiLogoutBoxRLine,
  RiMenuLine,
  RiCloseLine,
} from "react-icons/ri";
import { Avatar } from "@/components/ui/avatar";
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
  DialogCloseTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/context";
import { motion } from "framer-motion";

import { API_BASE_URL, ENDPOINTS } from "@/api/config";
import { ChatDialog } from "../chat/chat-dialog";

export const GenericPage = ({ children }: { children: ReactChild }) => {
  const { state, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState("");

  const gradient = useColorModeValue(
    "linear(to-r, blue.400, purple.500)",
    "linear(to-r, blue.300, purple.200)"
  );

  const isMobile = useBreakpointValue({ base: true, md: false });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const fetchCurrentMatch = async () => {
    setIsLoadingCurrent(true);
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}${ENDPOINTS.QUEUE.CURRENT_MATCH}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch current match");
      console.log("this is current match -", await res.json());
      setCurrentMatch(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingCurrent(false);
    }
  };

  const fetchMatchHistory = async () => {
    setIsLoadingHistory(true);
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}${ENDPOINTS.QUEUE.MATCH_HISTORY}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch match history");
      console.log(await res.json());
      setMatchHistory(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchCurrentMatch();
    fetchMatchHistory();
  }, []);

  return (
    <Flex height="100dvh" w="100%" bg="gray.200" _dark={{ bg: "gray.800" }}>
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          w="100vw"
          h="100vh"
          bg="blackAlpha.600"
          zIndex="overlay"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <motion.div
        style={{
          position: isMobile ? "fixed" : "relative",
          width: "250px",
          height: "100dvh",
          zIndex: "99999",
          background: gradient,
          left: isMobile ? -250 : 0, // Initial position
        }}
        animate={{
          left: isMobile ? (isSidebarOpen ? 0 : -250) : 0,
          background: [
            gradient,
            "linear-gradient(to right, #667eea, #764ba2)",
            gradient,
          ],
        }}
        transition={{
          left: {
            type: "tween",
            duration: 0.3,
            ease: "easeInOut",
          },
          background: {
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      >
        <Box
          bg="transparent"
          h="full"
          w="250px"
          color="white"
          display="flex"
          flexDirection="column"
          boxShadow="md"
        >
          {/* Close Button for Mobile */}
          {isMobile && (
            <Button
              onClick={closeSidebar}
              position="absolute"
              right="4"
              top="4"
              variant="ghost"
              _hover={{ bg: "blackAlpha.300" }}
            >
              <RiCloseLine size="20px" />
            </Button>
          )}

          <VStack align="stretch" flex={1} pt={isMobile ? "60px" : "0"}>
            {/* Navigation Links */}
            <Flex flexDir="column" w="100%">
              <ChakraLink asChild p={0}>
                <Link to="/home">
                  <Button
                    borderLeftRadius={0}
                    colorPalette={"gray"}
                    variant="surface"
                    justifyContent="flex-start"
                    w="full"
                    _hover={{ transform: "translateX(4px)" }}
                    transition="all 0.2s"
                  >
                    <RiHomeLine /> Home
                  </Button>
                </Link>
              </ChakraLink>

              <ChakraLink asChild p={0}>
                <Link to="/calendar">
                  <Button
                    borderLeftRadius={0}
                    disabled
                    colorPalette={"gray"}
                    variant="surface"
                    justifyContent="flex-start"
                    w="full"
                    _hover={{ transform: "translateX(4px)" }}
                    transition="all 0.2s"
                  >
                    <RiCalendarLine /> Calendar
                  </Button>
                </Link>
              </ChakraLink>
            </Flex>

            {/* Current Match */}
            {currentMatch && <ChatDialog match={currentMatch} isCurrent />}

            {/* Match History */}
            {/* {matchHistory.map((match) => (
              <ChatDialog key={match.id} match={match} />
            ))} */}

            <Spacer />

            {/* Account Section */}
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
                      name={state.user.name}
                      size="lg"
                      src={state.user.profilePictureUrl}
                    />
                    <Stack gap="0">
                      <Text _light={{ color: "gray.950" }} fontWeight="medium">
                        {state.user.name}
                      </Text>
                      <Text
                        color="fg.muted"
                        textStyle="sm"
                        textOverflow="ellipsis"
                        overflow="hidden"
                        w="80%"
                        whiteSpace="nowrap"
                      >
                        {state.user.email}
                      </Text>
                    </Stack>
                  </HStack>
                </Box>
              </DialogTrigger>

              <DialogContent maxW="400px">
                <DialogHeader>
                  <DialogTitle>Account Information</DialogTitle>
                </DialogHeader>
                <DialogBody>
                  <VStack textAlign="center">
                    <Avatar
                      name={state.user?.name || "Anonymous"}
                      size="xl"
                      src={state.user?.profilePictureUrl}
                    />
                    <Text fontSize="xl" fontWeight="bold">
                      {state.user?.name || "Anonymous"}
                    </Text>
                    <Badge colorScheme="green" fontSize="sm">
                      {state.user?.role || "User"}
                    </Badge>
                    <Text fontSize="sm" color="gray.500">
                      {state.user?.email || "No email"}
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      {state.user?.bio || "No bio available"}
                    </Text>
                  </VStack>
                </DialogBody>
                <DialogFooter>
                  <DialogCloseTrigger asChild>
                    <Button variant="outline" size="sm">
                      Close
                    </Button>
                  </DialogCloseTrigger>
                  <Button
                    w="120px"
                    size="xs"
                    colorPalette={"red"}
                    variant="surface"
                    justifyContent="flex-start"
                    onClick={logout}
                  >
                    <RiLogoutBoxRLine /> Log Out
                  </Button>
                </DialogFooter>
              </DialogContent>
            </DialogRoot>
          </VStack>
        </Box>
      </motion.div>

      {/* Main Content Area */}
      <Box flex={1} p={4} overflow="auto" position="relative">
        {/* Hamburger Button for Mobile */}
        <Button
          onClick={toggleSidebar}
          display={{ base: "flex", md: "none" }}
          position="absolute"
          top="4"
          left="4"
          zIndex="docked"
          alignItems="center"
          justifyContent="center"
          p="2"
        >
          <RiMenuLine size="24px" />
        </Button>

        {children}

        {/* Color mode button */}
        <Box position="absolute" top="4" right="4">
          <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
            <HStack>
              <ColorModeButton
                colorPalette={useColorModeValue("yellow", "gray")}
              />
              <Button variant="outline" size="sm">
                <RiArrowRightLine /> Support
              </Button>
            </HStack>
          </ClientOnly>
        </Box>
      </Box>
    </Flex>
  );
};
