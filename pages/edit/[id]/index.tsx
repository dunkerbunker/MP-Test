import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Button,
  Typography,
  Box,
  Container,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import { styled } from "@mui/system";
import { CustomModal } from "../../components/Modal"; // Import the newly styled modal
import RecommendationForm from "../../components/RecommendationForm"; // Import the form component

// Define types for Recommendation and selectedRange
interface Recommendation {
  day: number;
  bundle_price: number;
  data_volume: number;
  package_name: string;
}

const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#ff0000";
const secondaryColor = process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#ffffff";

// Styled component for each day box
const DayBox = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: theme.palette.getContrastText(primaryColor),
  fontWeight: "bold",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
  backgroundColor: secondaryColor,
  "&:hover": {
    backgroundColor: `${primaryColor}66`,
  },
}));

const ProceedButton = styled(Button)({
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
});

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

export default function EditPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const router = useRouter();

  // State variables
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [variants, setVariants] = useState<Recommendation[]>([]);
  const [selectedRange, setSelectedRange] = useState<
    [number | null, number | null]
  >([null, null]);
  const [packageName, setPackageName] = useState<string>("");
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false); // State to manage form visibility

  useEffect(() => {
    if (!id) {
      router.push("/");
    } else {
      // Fetch all variants for the package
      axios
        .get(`/api/recommendations/${id}?getVariants=true`)
        .then((response) => {
          setVariants(response.data);
          setPackageName(response.data[0]?.package_name || "");
          setLoading(false);
        })
        .catch((err) => {
          setError("Error loading recommendations");
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, router]);

  // Handle the click of a day to select the range
  const handleDayClick = (day: number) => {
    if (
      selectedRange[0] === null ||
      (selectedRange[0] !== null && selectedRange[1] !== null)
    ) {
      setSelectedRange([day, null]);
    } else if (selectedRange[0] !== null && selectedRange[1] === null) {
      if (day > selectedRange[0]) {
        setSelectedRange([selectedRange[0], day]);
      } else {
        setSelectedRange([day, selectedRange[0]]);
      }
    }
  };

  const handleProceed = () => {
    const startDay = selectedRange[0];
    const endDay = selectedRange[1];

    if (!startDay || !endDay) {
      setError("Please select a valid range.");
      return;
    }

    const differentValues = checkForDifferences(variants, startDay, endDay);

    if (differentValues.length === 0) {
      setConfirmationMessage(
        `You are modifying ${packageName} from Day ${startDay} to Day ${endDay}.`,
      );
    } else {
      setConfirmationMessage(
        `You are modifying ${packageName} from Day ${startDay} to Day ${endDay}. However, ${differentValues.join(
          ", ",
        )} have different values. They will be overwritten.`,
      );
    }

    setShowConfirmModal(true);
  };

  const checkForDifferences = (
    variants: Recommendation[],
    startDay: number,
    endDay: number,
  ) => {
    const differences: string[] = [];
    const selectedVariants = variants.filter(
      (v) => v.day >= startDay && v.day <= endDay,
    );
    const firstVariant = selectedVariants[0];

    selectedVariants.forEach((v) => {
      if (
        v.bundle_price !== firstVariant.bundle_price ||
        v.data_volume !== firstVariant.data_volume
      ) {
        differences.push(`Day ${v.day}`);
      }
    });

    return differences;
  };

  const proceedWithModifications = () => {
    // Close the modal and hide the calendar, then show the form with pre-filled values
    setShowConfirmModal(false);
    setShowForm(true); // Show the form component
  };

  const renderDay = (day: number) => {
    const isSelected =
      (selectedRange[0] && selectedRange[0] === day) ||
      (selectedRange[1] && selectedRange[1] === day);
    const isInRange =
      selectedRange[0] &&
      selectedRange[1] &&
      day > selectedRange[0] &&
      day < selectedRange[1];

    return (
      <DayBox
        key={day}
        onClick={() => handleDayClick(day)}
        sx={{
          backgroundColor: isSelected
            ? primaryColor
            : isInRange
              ? `${primaryColor}33` // Lightened version of the primary color for in-range days
              : secondaryColor,
          color: isSelected ? secondaryColor : "#000",
        }}
      >
        {day}
      </DayBox>
    );
  };

  const renderCalendar = () => {
    const days = Array.from({ length: 31 }, (_, index) => renderDay(index + 1));
    const rows: JSX.Element[] = []; // Define the type of the rows array as an array of JSX Elements

    for (let i = 0; i < days.length; i += 7) {
      rows.push(
        <Grid container justifyContent="center" key={i} spacing={2}>
          {days.slice(i, i + 7)}
        </Grid>,
      );
    }

    return rows;
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
            Edit {packageName}
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}{" "}
          {/* Show error without hiding the calendar */}
          <Typography variant="subtitle1" sx={{ color: "#555", mb: 4 }}>
            Click on a day to select
            <br />
            Note:{" "}
            <span style={{ fontStyle: "italic" }}>
              Magey Plan allows you to give different allowances for different
              days.
            </span>
          </Typography>
          <Box
            mt={4}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {renderCalendar()}
          </Box>
          <Box
            mt={4}
            sx={{ display: "flex", justifyContent: "center", gap: 2 }}
          >
            <Button
              onClick={() => setSelectedRange([null, null])}
              variant="outlined"
              color="secondary"
              sx={{
                borderColor: primaryColor,
                color: primaryColor,
                borderRadius: "30px",
                "&:hover": {
                  backgroundColor: `${primaryColor}33`,
                },
              }}
            >
              Reset Selection
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outlined"
              color="secondary"
              sx={{
                borderColor: primaryColor,
                color: primaryColor,
                borderRadius: "30px",
                "&:hover": {
                  backgroundColor: `${primaryColor}33`,
                },
              }}
            >
              Go Back Home
            </Button>
            <ProceedButton onClick={handleProceed}>Proceed</ProceedButton>
          </Box>
          <CustomModal
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={proceedWithModifications}
            title="Confirm Changes"
            description={confirmationMessage}
            confirmLabel="Continue Anyway"
          />
        </>
      )}

      {/* If the form is visible, render it with day 1's data */}
      {showForm && (
        <RecommendationForm
          isEdit={true}
          id={id}
          startDate={selectedRange[0]?.toString()}
          endDate={selectedRange[1]?.toString()}
        />
      )}
    </Container>
  );
}
