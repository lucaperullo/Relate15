import React from "react";
import { Button, Spinner } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaClock, FaRandom } from "react-icons/fa";
import { keyframes } from "@emotion/react";
import { useSocket } from "@/context/socket";

export const StartQueueButton = () => {
  const { queueStatus, isLoadingQueue, bookCall } = useSocket();

  const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  `;

  return (
    <motion.div
      whileHover={
        queueStatus === "idle" && !isLoadingQueue ? { scale: 1.05 } : {}
      }
      whileTap={
        queueStatus === "idle" && !isLoadingQueue ? { scale: 0.95 } : {}
      }
    >
      <Button
        colorScheme="blue"
        size="lg"
        px={8}
        py={6}
        fontSize="xl"
        borderRadius="xl"
        boxShadow="xl"
        _hover={{ textDecoration: "none" }}
        animation={queueStatus === "idle" ? `${pulse} 2s infinite` : undefined}
        onClick={bookCall}
        disabled={
          ["matched", "waiting"].includes(queueStatus) || isLoadingQueue
        }
      >
        {isLoadingQueue ? (
          <>
            <Spinner size="sm" mr={2} />
            Searching...
          </>
        ) : queueStatus === "waiting" ? (
          <>
            <Spinner size="sm" mr={2} />
            Searching for connections!
          </>
        ) : queueStatus === "matched" ? (
          <>
            <FaClock /> Match found!
          </>
        ) : (
          <>
            <FaRandom /> Start Queue
          </>
        )}
      </Button>
    </motion.div>
  );
};
