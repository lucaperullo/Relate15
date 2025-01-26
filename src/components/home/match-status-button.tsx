import React from "react";
import { Button, Spinner } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaClock, FaRandom } from "react-icons/fa";

import { keyframes } from "@emotion/react";

export const MatchStatusButton = ({
  status,
  onClick,
}: {
  status: string;
  onClick: () => void;
}) => {
  const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;
  return (
    <motion.div
      whileHover={status === "idle" ? { scale: 1.05 } : {}}
      whileTap={status === "idle" ? { scale: 0.95 } : {}}
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
        animation={status === "idle" ? `${pulse} 2s infinite` : undefined}
        onClick={onClick}
        disabled={["matched", "waiting"].includes(status)}
      >
        {status === "waiting" ? (
          <>
            <Spinner size="sm" mr={2} />
            Searching for connections!
          </>
        ) : status === "matched" ? (
          <>
            <FaClock /> Match found!
          </>
        ) : (
          <>
            <FaRandom /> Start Matching
          </>
        )}
      </Button>
    </motion.div>
  );
};
