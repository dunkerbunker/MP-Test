// pages/edit/[id]/confirm.tsx
"use client";

import { useEffect, useState } from "react";
import { Container, Grid, Typography, Button, Box, Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import axios from "axios";
import { styled } from "@mui/system"; // Import styled for custom button

// Define the interface for Recommendation data
interface Recommendation {
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
};

export default function ConfirmChanges() {
  const router = useRouter();
  const [previousData, setPreviousData] = useState<Recommendation | null>(null);
  const [modifiedData, setModifiedData] = useState<Recommendation | null>(null);
  const [comparisonResults, setComparisonResults] = useState<
    { key: string; oldValue: string | number; newValue: string | number; changed: boolean }[]
  >([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#ff0000";
  const secondaryColor = process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#ffffff";

  useEffect(() => {
    const prevData = sessionStorage.getItem("previousData");
    const modData = sessionStorage.getItem("modifiedData");

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
      // Submit modified data
      await axios.post("/api/recommendations/update", modifiedData);

      // Show success message and start countdown
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error during confirmation:", error);
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
            Changes will be made for $startdate to $enddate
          </Typography>

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
            <Grid item xs={12} sm={6}>
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

      {/* Success Alert */}
      {showSuccessAlert && (
        <Alert severity="success" sx={{ mt: 4 }}>
          Success! Changes have been confirmed. You will be redirected to the homepage in {countdown} seconds.
        </Alert>
      )}
    </Container>
  );
}
