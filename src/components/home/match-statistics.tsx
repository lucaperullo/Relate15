import { User } from "@/context";
import { Box, Heading, Flex, Text, Badge } from "@chakra-ui/react";
import React from "react";
import { useColorModeValue } from "../ui/color-mode";

const getRandomColor = () => {
  const colors = [
    "red",
    "orange",
    "yellow",
    "green",
    "teal",
    "blue",
    "cyan",
    "purple",
    "pink",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const MatchStatistics = ({ matches }: { matches: User[] }) => {
  const matchCounts = matches.reduce(
    (acc, user) => {
      user.matches.forEach((matchId) => {
        acc[matchId] = (acc[matchId] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  // Color mode values
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const emailColor = useColorModeValue("gray.600", "gray.400");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const badgeTextColor = useColorModeValue("gray.900", "gray.50");

  return (
    <Box>
      <Heading size="md" mb={4} textAlign="center" color={textColor}>
        Match Counts
      </Heading>
      <Flex flexDir="column" gap={2}>
        {Object.entries(matchCounts).map(([userId, count]) => {
          const matchedUser = matches.find((user) => user.id === userId);
          if (!matchedUser) return null;

          return (
            <Flex
              key={userId}
              justify="space-between"
              align="center"
              p={2}
              borderRadius="md"
              _hover={{ bg: hoverBg }}
              gap={4}
              transition="background 0.2s ease"
            >
              <Text
                width="120px"
                minWidth="120px"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                overflow="hidden"
                fontWeight="medium"
                title={matchedUser.name}
                color={textColor}
              >
                {matchedUser.name}
              </Text>

              <Text
                flex={1}
                color={emailColor}
                fontSize="sm"
                title={matchedUser.email}
              >
                {matchedUser.email}
              </Text>

              <Badge
                colorScheme={getRandomColor()}
                px={3}
                py={1}
                borderRadius="full"
                flexShrink={0}
                color={badgeTextColor}
              >
                {count} {count === 1 ? "volta" : "volte"}
              </Badge>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};
