"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  VStack,
  Text,
  Spinner,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster";
import axios from "axios";
import { useAuth } from "@/context";
import { motion } from "framer-motion";
import { useColorModeValue } from "@/components/ui/color-mode";

export const Login = () => {
  const { state, dispatch, baseUrl, api } = useAuth();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const gradient = useColorModeValue(
    "linear(to-r, blue.400, purple.500)",
    "linear(to-r, blue.300, purple.200)"
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const response = await axios.post(
        `${baseUrl}${api.AUTH.LOGIN}`,
        credentials
      );

      localStorage.setItem("token", response.data.token);
      sessionStorage.setItem("token", response.data.token);

      dispatch({ type: "SET_USER", payload: response.data.user });
      dispatch({ type: "SET_AUTH", payload: true });

      toaster.create({
        description: "Login successful!",
        type: "success",
        duration: 5000,
      });

      const redirectPath = location.state?.from?.pathname || "/home";
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });

      toaster.create({
        description: errorMessage,
        type: "error",
        duration: 5000,
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ duration: 0.5 }}
    >
      <Flex minH="100vh" width="full">
        {/* Left Side - Login Form */}
        <Flex
          width={{ base: "100%", md: "50%" }}
          align="center"
          justify="center"
          p={8}
          bg={useColorModeValue("white", "black")}
        >
          <Box width="full" maxW="400px">
            <Heading mb={6} textAlign="center" fontSize="3xl">
              Welcome to Relate15
            </Heading>

            <form onSubmit={handleLogin}>
              <VStack gap="6">
                <Field label="Email" required>
                  <Input
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={(e) =>
                      setCredentials((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter your email"
                    autoComplete="username"
                    disabled={state.isLoading}
                  />
                </Field>

                <Field label="Password" required>
                  <Input
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Enter password"
                    autoComplete="current-password"
                    disabled={state.isLoading}
                  />
                </Field>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  disabled={state.isLoading}
                >
                  {state.isLoading ? <Spinner size="sm" /> : "Sign in"}
                </Button>

                <Text textAlign="center">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    state={{ direction: "forward" }}
                    style={{ color: "blue.500", fontWeight: "semibold" }}
                  >
                    Create Account
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
                  Connect with your co-workers in seconds
                </Text>
              </motion.div>
            </Flex>
          </motion.div>
        </Box>
      </Flex>
    </motion.div>
  );
};
