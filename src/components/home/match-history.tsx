import { User } from "@/context";
import { Box, Heading, Flex } from "@chakra-ui/react";
import React from "react";
import { AvatarGroup, Avatar } from "../ui/avatar";

export const MatchHistory = ({ matches }: { matches: User[] }) => (
  <Box>
    <Heading size="md" mb={4} textAlign="center">
      Match History
    </Heading>
    <Flex justify="center">
      <AvatarGroup size="md">
        {matches.map((match) => (
          <Avatar
            key={match._id}
            name={match.name}
            src={match.profilePictureUrl}
          />
        ))}
      </AvatarGroup>
    </Flex>
  </Box>
);
