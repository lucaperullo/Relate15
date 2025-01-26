import { Box, Grid } from "@chakra-ui/react";
import { FaRandom, FaClock, FaComments } from "react-icons/fa";
import { FeatureCard } from "../ui/feature-card";
import React from "react";

export const Features = () => {
  const features = [
    {
      icon: FaRandom,
      title: "Instant Matching",
      description: "Connect with colleagues in seconds",
    },
    {
      icon: FaClock,
      title: "Focused Chats",
      description: "15-minute time-boxed conversations",
    },
    {
      icon: FaComments,
      title: "Expand Network",
      description: "Meet team members outside your circle",
    },
  ];

  return (
    <Box mb={12}>
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
        gap={6}
        maxW="5xl"
        mx="auto"
        placeItems="center"
      >
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </Grid>
    </Box>
  );
};
