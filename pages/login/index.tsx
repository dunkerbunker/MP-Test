"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Box, Button, Container, TextField, Typography } from "@mui/material";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Check if the user has an existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get("/api/auth/check-session", {
          withCredentials: true,
        });
        if (response.status === 200 && response.data.isAuthenticated) {
          // Redirect to home or dashboard if the session is valid
          router.push("/");
        }
      } catch (err) {
        console.error("Error checking session:", err);
        // No need to set any error here; user is allowed to stay on the login page
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    try {
      const response = await axios.post(
        "/api/auth/login",
        { email, password },
        {
          withCredentials: true, // Allow sending and receiving cookies
        },
      );

      if (response.status === 200 && response.data.success) {
        console.log("Login successful:", response.data);

        // Redirect to home or dashboard
        router.push("/");
      } else {
        // Handle any errors returned from the API
        setError(
          response.data.error?.message || "Unexpected error. Please try again.",
        );
      }
    } catch (err) {
      // Catch any errors that might happen during the request
      console.error("Login error:", err);
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </form>
      </Box>
    </Container>
  );
}
