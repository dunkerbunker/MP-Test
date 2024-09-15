import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Typography,
  Box,
  Container,
  CircularProgress,
  Alert,
} from "@mui/material";
import { styled } from "@mui/system";
import RecommendationForm from "../components/RecommendationForm"; // Import the form component

const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#ff0000";
const secondaryColor = process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#ffffff";

// Styled X Button in the corner
const XButton = styled(Button)({
  position: "fixed",
  top: "20px",
  right: "30px",
  backgroundColor: secondaryColor,
  color: primaryColor,
  fontSize: "25px",
  fontWeight: "bold",
  paddingTop: "15px",
  paddingBottom: "15px",
  paddingLeft: "28px",
  paddingRight: "28px",
  borderRadius: "50%",
  "&:hover": {
    backgroundColor: `${primaryColor}33`,
  },
});

export default function CreatePage() {
  const router = useRouter();

  // State variables
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false); // State to manage form visibility

  useEffect(() => {
    // Load initial data if needed (optional)
    setLoading(false);
  }, []);

  const handleProceed = () => {
    // Show the form for creating a new recommendation
    setShowForm(true);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <XButton onClick={() => router.push("/")}>X</XButton>

      {!showForm && (
        <>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: "bold", color: primaryColor }}
          >
            Create New Magey Pack
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}
          <Typography variant="subtitle1" sx={{ color: "#555", mb: 4 }}>
            This is a live change. Please ensure that the data is correct and
            that all the required approvals are in place.
            <br />
            <br />
            Magey pack allows for different allowances for different days. After
            creating pack, custom allowance for each day can be set by editing.
          </Typography>

          <Button
            onClick={handleProceed}
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: primaryColor,
              color: secondaryColor,
              padding: "10px 20px",
              borderRadius: "30px",
              fontSize: "16px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              transition: "background-color 0.3s ease",
              "&:hover": {
                backgroundColor: `${primaryColor}CC`,
              },
            }}
          >
            Proceed to Form
          </Button>
        </>
      )}

      {/* If the form is visible, render the form for creating a new recommendation */}
      {showForm && <RecommendationForm isEdit={false} id={null} />}
    </Container>
  );
}
