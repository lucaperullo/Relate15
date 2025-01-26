import { User } from "@/context";
import { Stack, Badge, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { HiAtSymbol } from "react-icons/hi";
import { Avatar } from "../ui/avatar";
import { useColorModeValue } from "../ui/color-mode";
import { Skeleton, SkeletonCircle } from "../ui/skeleton";

export const UserProfileCard = ({ user }: { user?: User }) => {
  const cardBg = useColorModeValue("gray.50", "gray.800");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const subtleTextColor = useColorModeValue("gray.500", "gray.400");

  if (!user) {
    return (
      <Stack
        direction="column"
        align="center"
        bg={cardBg}
        p={4}
        borderRadius="md"
        boxShadow="sm"
      >
        <SkeletonCircle size="xl" />
        <Stack align="center" w="full">
          <Skeleton height="24px" width="60%" />
          <Skeleton height="20px" width="40%" />
          <Flex align="center" w="full" justify="center">
            <Skeleton height="16px" width="70%" />
          </Flex>
          <Flex wrap="wrap" gap={2} justify="center" w="full">
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                height="20px"
                width="60px"
                borderRadius="full"
              />
            ))}
          </Flex>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack
      direction="column"
      align="center"
      bg={cardBg}
      p={4}
      borderRadius="md"
      boxShadow="sm"
    >
      <Avatar
        shape="square"
        name={user.name}
        src={user.profilePictureUrl}
        size="2xl"
      />
      <Text fontSize="lg" fontWeight="bold" color={textColor}>
        {user.name}
      </Text>
      <Badge colorScheme="green" px={2} py={1}>
        {user.role || "Team Member"}
      </Badge>
      <Text fontSize="sm" color={subtleTextColor}>
        <HiAtSymbol style={{ marginRight: 4, verticalAlign: "middle" }} />
        {user.email}
      </Text>
      {user.interests?.length > 0 && (
        <Flex wrap="wrap" gap={2} justify="center">
          {user.interests.map((interest) => (
            <Badge
              key={interest}
              colorScheme="blue"
              variant="subtle"
              fontSize="xs"
              px={2}
              py={1}
            >
              {interest}
            </Badge>
          ))}
        </Flex>
      )}
    </Stack>
  );
};
