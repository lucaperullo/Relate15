"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Textarea,
  VStack,
  Text,
  Spinner,
  Alert,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context";
import { motion } from "framer-motion";
import { useColorModeValue } from "@/components/ui/color-mode";

export const Signup = () => {
  const { state, dispatch, baseUrl, api } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "user",
    interests: "",
    bio: "",
    profilePicture: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const gradient = useColorModeValue(
    "linear(to-r, blue.400, purple.500)",
    "linear(to-r, blue.300, purple.200)"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Clear any previous error in the context
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const formPayload = new FormData();
      formPayload.append("email", formData.email);
      formPayload.append("password", formData.password);
      formPayload.append("name", formData.name);
      formPayload.append("role", formData.role);
      formPayload.append("interests", formData.interests);
      formPayload.append("bio", formData.bio);
      if (formData.profilePicture) {
        formPayload.append("profilePicture", formData.profilePicture);
      }

      const response = await axios.post(
        `${baseUrl}${api.AUTH.REGISTER}`,
        formPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toaster.create({
        description: response.data.message,
        type: "success",
        duration: 5000,
      });
      navigate("/login");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      // Dispatch the error to the context
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      toaster.create({
        description: errorMessage,
        type: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        profilePicture: e.target.files[0],
      });
    }
  };
  useEffect(() => {
    return () => {
      dispatch({ type: "SET_ERROR", payload: null });
    };
  }, []);
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ duration: 0.5 }}
    >
      <Flex minH="100vh" width="full">
        {/* Left Side - Signup Form */}
        <Flex
          width={{ base: "100%", md: "50%" }}
          align="center"
          justify="center"
          p={8}
          bg={useColorModeValue("white", "black")}
        >
          <Box width="full" maxW="400px">
            <Heading mb={6} textAlign="center" fontSize="3xl">
              Join Relate15
            </Heading>

            {/* Conditionally render the error alert if state.error exists */}
            {state.error && (
              <Alert.Root status="error" mb={4}>
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>{state.error}</Alert.Title>
                </Alert.Content>
              </Alert.Root>
            )}

            <form onSubmit={handleSubmit}>
              <VStack gap="6">
                <Field label="Email" required>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </Field>

                <Field label="Password" required>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    disabled={loading}
                  />
                </Field>

                <Field label="Full Name" required>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </Field>

                <Field label="Interests (comma separated)">
                  <Input
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder="e.g., music, sports, technology"
                    disabled={loading}
                  />
                </Field>

                <Field label="Bio">
                  <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself"
                    disabled={loading}
                  />
                </Field>

                <Field label="Profile Picture">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    p={1}
                    disabled={loading}
                  />
                </Field>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : "Create Account"}
                </Button>

                <Text textAlign="center">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    style={{ color: "blue.500", fontWeight: "semibold" }}
                  >
                    Login
                  </Link>
                </Text>
              </VStack>
            </form>
          </Box>
        </Flex>

        {/* Right Side - Animated Gradient */}
        <Box
          width="50%"
          display={{ base: "none", md: "block" }}
          position="relative"
          overflow="hidden"
        >
          <motion.div
            style={{
              background: gradient,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.5 },
            }}
            animate={{
              background: [
                gradient,
                "linear-gradient(to right, #667eea, #764ba2)",
                gradient,
              ],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            <Flex
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              color="white"
              direction="column"
              align="center"
              textAlign="center"
              px={8}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Heading size="2xl" mb={4}>
                  Relate15
                </Heading>
                <Text fontSize="xl">
                  Start connecting in 15 minutes or less
                </Text>
              </motion.div>
            </Flex>
          </motion.div>
        </Box>
      </Flex>
    </motion.div>
  );
};
