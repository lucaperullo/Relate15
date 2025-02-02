import { User } from "@/context";
import { Flex, Spinner, Button, Text } from "@chakra-ui/react";
import React from "react";
import { UserProfileCard } from "./user-profile-card";
import { Avatar } from "../ui/avatar";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "../ui/dialog";

/** 📌 Status Indicator Avatar */
const StatusIndicator = ({ status }: { status?: string }) => (
  <Avatar
    position="absolute"
    transform="translateY(-9px)"
    name={status === "idle" ? "!" : "?"}
  />
);

export const StatusDialog = ({
  status,
  user,
  isLoading,
  onClose,
}: {
  status: string;
  user: User | null;
  isLoading: boolean;
  onClose: () => void;
}) => (
  <DialogRoot open onOpenChange={onClose}>
    <DialogContent maxW="500px">
      <DialogHeader>
        <DialogTitle>
          {status === "matched"
            ? "🎉 You've Got a Match!"
            : status === "waiting"
              ? "🔍 Searching..."
              : "Queue Status"}
        </DialogTitle>
      </DialogHeader>

      <DialogBody>
        {status === "matched" ? (
          isLoading ? (
            <Flex direction="column" align="center" justify="center">
              <Spinner size="lg" />
              <Text mt={4}>Loading match details...</Text>
            </Flex>
          ) : (
            user && <UserProfileCard user={user} />
          )
        ) : status === "waiting" ? (
          <Flex direction="column" align="center" justify="center">
            <StatusIndicator />
            <Spinner size="lg" mt={4} />
            <Text mt={4} color="gray.500">
              Searching for matches...
            </Text>
          </Flex>
        ) : (
          <Flex direction="column" align="center" justify="center">
            <StatusIndicator status="idle" />
            <Text mt="100px" color="gray.500">
              Ready to start matching!
            </Text>
          </Flex>
        )}
      </DialogBody>

      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </DialogRoot>
);
