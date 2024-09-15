"use client";

import { useEffect, useState } from "react";
import { Container, Grid, Typography, Button, Box, Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import axios from "axios";
import { styled } from "@mui/system";

// Define the interface for Recommendation data
interface Recommendation {
  recno: number;
  bundle_price: number;
  data_volume: number;
  data_validity: number;
  onnet_min: number;
  onnet_validity: number;
  local_min: number;
  local_validity: number;
  sms: number;
  sms_validity: number;
  package_name: string;
  Short_Desc: string;
  Ribbon_text: string | null;
  Giftpack: string;
  mageypackid: string;
  day: number;
}

// User-friendly field names
const fieldTitles: { [key: string]: string } = {
  bundle_price: "Bundle Price",
  data_volume: "Data Volume",
  data_validity: "Data Validity",
  onnet_min: "On-net Minutes",
  onnet_validity: "On-net Validity",
  local_min: "Local Minutes",
  local_validity: "Local Validity",
  sms: "SMS Count",
  sms_validity: "SMS Validity",
  package_name: "Package Name",
  Short_Desc: "Short Description",
  Ribbon_text: "Ribbon Text",
  Giftpack: "Gift Pack",
  mageypackid: "Magey Pack ID",
  day: "Day",
};

export default function ConfirmChanges() {
  const router = useRouter();
  const [previousData, setPreviousData] = useState<Recommendation | null>(null);
  const [modifiedData, setModifiedData] = useState<Recommendation | null>(null);
  const [comparisonResults, setComparisonResults] = useState<
    { key: string; oldValue: string | number; newValue: string | number; changed: boolean }[]
  >([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showFailureAlert, setShowFailureAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#ff0000";
  const secondaryColor = process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#ffffff";


    // Authentication check
    useEffect(() => {
      const checkSession = async () => {
        try {
          const response = await axios.get("/api/auth/check-session");
          if (response.status !== 200) {
            router.push("/login");
          }
        } catch (error) {
          router.push("/login");
        }
      };
  
      checkSession();
    }, [router]);


  useEffect(() => {
    const prevData = sessionStorage.getItem("previousData");
    const modData = sessionStorage.getItem("modifiedData");
    const storedStartDate = sessionStorage.getItem("startDate");
    const storedEndDate = sessionStorage.getItem("endDate");

    if (storedStartDate && storedEndDate) {
      setStartDate(storedStartDate);
      setEndDate(storedEndDate);
    }

    if (prevData && modData) {
      const prevParsed = JSON.parse(prevData);
      const modParsed = JSON.parse(modData);

      setPreviousData(prevParsed);
      setModifiedData(modParsed);

      const excludedFields = ["data_price", "onnet_price", "local_price", "sms_price", "package_Verbiage", "day", "recno"];

      const results = Object.keys(modParsed)
        .filter((key) => !excludedFields.includes(key))
        .map((key) => {
          const oldValue = prevParsed[key];
          const newValue = modParsed[key];

          return {
            key,
            oldValue: oldValue === 0 ? 0 : oldValue ? oldValue.toString() : "N/A",
            newValue: newValue === 0 ? 0 : newValue ? newValue.toString() : "N/A",
            changed: oldValue !== newValue,
          };
        });

      setComparisonResults(results);
    }
  }, []);

  useEffect(() => {
    if (showSuccessAlert) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      if (countdown === 0) {
        router.push("/");
      }

      return () => clearInterval(interval);
    }
  }, [countdown, showSuccessAlert, router]);

  const handleConfirm = async () => {
    try {
      const storedStartDate = sessionStorage.getItem("startDate");
      const storedEndDate = sessionStorage.getItem("endDate");

      if (!storedStartDate || !storedEndDate) {
        throw new Error("Start date or end date is missing.");
      }

      // Convert stored dates to numeric values (days)
      const startDate = Number(storedStartDate);
      const endDate = Number(storedEndDate);

      // Step 1: Fetch all variants for the given recno (id)
      const response = await axios.get(`/api/recommendations/${modifiedData?.recno}?getVariants=true&startDate=${startDate}&endDate=${endDate}`);
      const variants = response.data;

      // Step 2: Update each filtered variant
      for (const variant of variants) {
        const updatedData = {
          ...modifiedData, // Assuming you're applying the same modifications for all variants
          day: variant.day,
          recno: variant.recno,
        };

        // Call the update API for each recno
        await axios.put(`/api/recommendations/${variant.recno}`, updatedData);
      }

      // Show success message and start countdown
      setShowSuccessAlert(true);
      setShowFailureAlert(false); // Hide failure alert if shown

      // Clear session storage
      sessionStorage.removeItem("previousData");
      sessionStorage.removeItem("modifiedData");
      sessionStorage.removeItem("startDate");
      sessionStorage.removeItem("endDate");

    } catch (error) {
      console.error("Error during confirmation:", error);

      setShowSuccessAlert(false);
      setShowFailureAlert(true); // Show failure alert

      // Properly handle axios error
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || "An error occurred while updating.");
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    }
  };

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

  return (
    <Container>
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: "100vh" }}>
        <Grid item xs={12}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              color: primaryColor,
              fontWeight: "bold",
              fontSize: "2rem",
              textTransform: "uppercase",
              marginBottom: "1rem",
              marginTop: "3rem",
            }}
          >
            Confirm Changes
          </Typography>

          <Typography variant="h6" component="p" sx={{ marginBottom: "2rem" }}>
            Changes will be made for {startDate || "N/A"} to {endDate || "N/A"}
          </Typography>

            {/* Success Alert */}
        {showSuccessAlert && (
          <Alert severity="success" sx={{ mt: 4 }}>
            Success! Changes have been confirmed. You will be redirected to the homepage in {countdown} seconds.
          </Alert>
        )}

        {/* Failure Alert */}
        {showFailureAlert && (
          <Alert severity="error" sx={{ mt: 4 }}>
            {errorMessage}
          </Alert>
        )}

          {comparisonResults.length > 0 ? (
            <Grid container spacing={2}>
              {comparisonResults.map(({ key, oldValue, newValue, changed }, index) => (
                <Grid item xs={12} key={index}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 15px",
                      borderRadius: "8px",
                      boxShadow: changed
                        ? "0 0 10px rgba(0,0,0,0.1)"
                        : "0 0 5px rgba(0,0,0,0.05)",
                      backgroundColor: changed ? "#fafafa" : "#f9f9f9",
                    }}
                  >
                    {/* Key */}
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", color: "#333", width: "20%" }}
                    >
                      {fieldTitles[key] || key}
                    </Typography>

                    {/* Old Value */}
                    <Typography
                      variant="body2"
                      sx={{
                        width: "35%",
                        color: changed ? "#ff0000" : "#666",
                        fontWeight: changed ? "bold" : "normal",
                        padding: "5px",
                        backgroundColor: changed ? "#ffebeb" : "transparent",
                        borderRadius: "4px",
                        textAlign: "center",
                      }}
                    >
                      {oldValue}
                    </Typography>

                    {/* New Value */}
                    <Typography
                      variant="body2"
                      sx={{
                        width: "35%",
                        color: changed ? "#008000" : "#666",
                        fontWeight: changed ? "bold" : "normal",
                        padding: "5px",
                        backgroundColor: changed ? "#e8f5e8" : "transparent",
                        borderRadius: "4px",
                        textAlign: "center",
                      }}
                    >
                      {newValue}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>No changes detected.</Typography>
          )}

          <Grid container spacing={2} sx={{ mt: 4 }}>
            <Grid item xs={12} sm={6} mb={5}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: primaryColor,
                  color: secondaryColor,
                  padding: "10px 20px",
                  fontSize: "1rem",
                  width: "100%",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  borderRadius: "30px",
                  "&:hover": {
                    backgroundColor: `${primaryColor}CC`,
                  },
                }}
                onClick={handleConfirm}
              >
                Confirm Changes
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                sx={{
                  borderColor: primaryColor,
                  color: primaryColor,
                  padding: "10px 20px",
                  fontSize: "1rem",
                  width: "100%",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  borderRadius: "30px",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                }}
                onClick={() => router.push("/")}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Fixed X Button */}
      <XButton onClick={() => router.push("/")}>X</XButton>

    </Container>
  );
}
