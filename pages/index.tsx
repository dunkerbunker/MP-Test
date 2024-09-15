"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Box,
  Drawer,
  Slider,
  Checkbox,
  IconButton,
  Chip,
  Divider,
  Backdrop,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { FilterList } from "@mui/icons-material";
import { useRouter } from "next/router"; // For redirecting unauthenticated users
import MageyPackCard from "./components/MageyPackCard";

interface Recommendation {
  day: number;
  recno: number;
  package_name: string;
  bundle_price: number;
  data_volume: number;
  data_validity: number;
  onnet_min: number;
  onnet_price: number;
  onnet_validity: number;
  local_min: number;
  local_price: number;
  local_validity: number;
  sms: number;
  sms_price: number;
  sms_validity: number;
  Short_Desc: string;
  Ribbon_text?: string;
  Giftpack: string;
  mageypackid: string;
}

interface FilterState {
  bundlePrice: [number, number];
  dataVolume: [number, number];
  dataUnit: string;
  onnetMin: [number, number];
  localMin: [number, number];
  hasOnnetMinutes: boolean;
  hasLocalMinutes: boolean;
  ribbonText: boolean;
}

export default function Home() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<
    Recommendation[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const router = useRouter(); // For redirecting if session invalid

  const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#ff0000";
  const secondaryColor = process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#ffffff";

  // Filter settings
  const minBundlePrice = parseInt(
    process.env.NEXT_PUBLIC_MIN_BUNDLE_PRICE || "0",
    10,
  );
  const maxBundlePrice = parseInt(
    process.env.NEXT_PUBLIC_MAX_BUNDLE_PRICE || "1000",
    10,
  );
  const bundlePriceStep = parseInt(
    process.env.NEXT_PUBLIC_BUNDLE_PRICE_STEP || "5",
    10,
  );
  const minDataVolume = parseInt(
    process.env.NEXT_PUBLIC_MIN_DATA_VOLUME_GB || "0",
    10,
  );
  const maxDataVolume = parseInt(
    process.env.NEXT_PUBLIC_MAX_DATA_VOLUME_GB || "100",
    10,
  );
  const maxDataVolumeMb = parseInt(
    process.env.NEXT_PUBLIC_MAX_DATA_VOLUME_MB || "100",
    10,
  );
  const dataVolumeStep = parseFloat(
    process.env.NEXT_PUBLIC_DATA_VOLUME_STEP_GB || "0.1",
  );
  const dataVolumeStepMb = parseInt(
    process.env.NEXT_PUBLIC_DATA_VOLUME_STEP_MB || "100",
    10,
  );
  const minOnnetMin = parseInt(
    process.env.NEXT_PUBLIC_MIN_ONNET_MIN || "0",
    10,
  );
  const maxOnnetMin = parseInt(
    process.env.NEXT_PUBLIC_MAX_ONNET_MIN || "1000",
    10,
  );
  const onnetMinStep = parseInt(
    process.env.NEXT_PUBLIC_ONNET_MIN_STEP || "100",
    10,
  );
  const minLocalMin = parseInt(
    process.env.NEXT_PUBLIC_MIN_LOCAL_MIN || "0",
    10,
  );
  const maxLocalMin = parseInt(
    process.env.NEXT_PUBLIC_MAX_LOCAL_MIN || "1000",
    10,
  );
  const localMinStep = parseInt(
    process.env.NEXT_PUBLIC_LOCAL_MIN_STEP || "100",
    10,
  );

  const [filters, setFilters] = useState<FilterState>({
    bundlePrice: [minBundlePrice, maxBundlePrice],
    dataVolume: [minDataVolume, maxDataVolume],
    dataUnit: "GB",
    onnetMin: [minOnnetMin, maxOnnetMin],
    localMin: [minLocalMin, maxLocalMin],
    hasOnnetMinutes: false,
    hasLocalMinutes: false,
    ribbonText: false,
  });

  // Session validation (on page load)
  useEffect(() => {
    axios
      .get("/api/recommendations", {
        withCredentials: true, // This ensures cookies are sent with the request
      })
      .then((response) => {
        const uniqueRecommendations = response.data.reduce(
          (acc: Recommendation[], current: Recommendation) => {
            const x = acc.find(
              (item) => item.mageypackid === current.mageypackid,
            );
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          },
          [],
        );
        setRecommendations(uniqueRecommendations);
        setFilteredRecommendations(uniqueRecommendations);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching recommendations:", error);
        // If an error occurs (e.g., 401 Unauthorized), redirect to login
        if (error.response && error.response.status === 401) {
          router.push("/login");
        }
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      // Remove the session_token cookie by setting its expiry date to the past
      document.cookie =
        "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Now make the logout API call
      await axios.post("/api/auth/logout");

      // Redirect to login page after successful logout
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    applyFilters(value, filters);
  };

  // Modify the handleFilterChange function to properly handle the unit switch
  const handleFilterChange = (newFilters: FilterState) => {
    let updatedDataVolume = newFilters.dataVolume;

    // Convert data volume between GB and MB as needed
    if (newFilters.dataUnit === "GB" && filters.dataUnit === "MB") {
      updatedDataVolume = [
        Math.max(newFilters.dataVolume[0] / 1024, minDataVolume), // Convert MB to GB
        Math.min(newFilters.dataVolume[1] / 1024, maxDataVolume),
      ];
    } else if (newFilters.dataUnit === "MB" && filters.dataUnit === "GB") {
      updatedDataVolume = [
        Math.max(newFilters.dataVolume[0] * 1024, minDataVolume * 1024), // Convert GB to MB
        Math.min(newFilters.dataVolume[1] * 1024, maxDataVolumeMb),
      ];
    }

    // Ensure the data volume is within the current unit's range
    if (newFilters.dataUnit === "GB") {
      updatedDataVolume = [
        Math.max(updatedDataVolume[0], minDataVolume),
        Math.min(updatedDataVolume[1], maxDataVolume),
      ];
    } else {
      updatedDataVolume = [
        Math.max(updatedDataVolume[0], minDataVolume * 1024),
        Math.min(updatedDataVolume[1], maxDataVolumeMb),
      ];
    }

    setFilters({
      ...newFilters,
      dataVolume: updatedDataVolume as [number, number],
    });
  };

  const applyFilters = (searchTerm: string, filterState: FilterState) => {
    let filteredData = recommendations;

    if (searchTerm) {
      filteredData = filteredData.filter(
        (rec) =>
          rec.package_name.toLowerCase().includes(searchTerm) ||
          rec.Short_Desc.toLowerCase().includes(searchTerm) ||
          rec.bundle_price.toString().includes(searchTerm),
      );
    }

    filteredData = filteredData.filter(
      (rec) =>
        rec.bundle_price >= filterState.bundlePrice[0] &&
        rec.bundle_price <= filterState.bundlePrice[1] &&
        (filterState.dataUnit === "GB"
          ? rec.data_volume >= filterState.dataVolume[0] * 1024 &&
            rec.data_volume <= filterState.dataVolume[1] * 1024
          : rec.data_volume >= filterState.dataVolume[0] &&
            rec.data_volume <= filterState.dataVolume[1]) &&
        rec.onnet_min >= filterState.onnetMin[0] &&
        rec.onnet_min <= filterState.onnetMin[1] &&
        rec.local_min >= filterState.localMin[0] &&
        rec.local_min <= filterState.localMin[1],
    );

    if (filterState.hasOnnetMinutes) {
      filteredData = filteredData.filter((rec) => rec.onnet_min !== 0);
    }

    if (filterState.hasLocalMinutes) {
      filteredData = filteredData.filter((rec) => rec.local_min !== 0);
    }

    if (filterState.ribbonText) {
      filteredData = filteredData.filter((rec) =>
        rec.Ribbon_text?.toLowerCase().includes("limited offer"),
      );
    }

    setFilteredRecommendations(filteredData);
  };

  const updateActiveFilters = () => {
    const newActiveFilters: string[] = [];
    if (filters.hasOnnetMinutes) newActiveFilters.push("With On-net Minutes");
    if (filters.hasLocalMinutes) newActiveFilters.push("With Local Minutes");
    if (filters.ribbonText) newActiveFilters.push("Limited Offer");

    setActiveFilters(newActiveFilters);

    applyFilters(searchTerm, filters);

    setDrawerOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      bundlePrice: [minBundlePrice, maxBundlePrice],
      dataVolume: [minDataVolume, maxDataVolume],
      dataUnit: "GB",
      onnetMin: [minOnnetMin, maxOnnetMin],
      localMin: [minLocalMin, maxLocalMin],
      hasOnnetMinutes: false,
      hasLocalMinutes: false,
      ribbonText: false,
    });
    setActiveFilters([]);
    applyFilters(searchTerm, {
      bundlePrice: [minBundlePrice, maxBundlePrice],
      dataVolume: [minDataVolume, maxDataVolume],
      dataUnit: "GB",
      onnetMin: [minOnnetMin, maxOnnetMin],
      localMin: [minLocalMin, maxLocalMin],
      hasOnnetMinutes: false,
      hasLocalMinutes: false,
      ribbonText: false,
    });
  };

  const handleDelete = async (recno: number) => {
    try {
      await axios.delete(`/api/recommendations/${recno}`);
      setRecommendations((prev) => prev.filter((rec) => rec.recno !== recno));
      setFilteredRecommendations((prev) =>
        prev.filter((rec) => rec.recno !== recno),
      );
    } catch (error) {
      console.error("Error deleting recommendation:", error);
    }
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            color: primaryColor, // Use the primary color
            fontWeight: "bold",
            fontSize: "2rem", // Make sure the size fits the rest of the design
            textTransform: "uppercase",
            marginBottom: "1rem", // Add some margin at the bottom
            marginTop: "3rem", // Add some margin at the top
          }}
        >
          Live Magey Packs
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            sx={{
              backgroundColor: primaryColor,
              color: secondaryColor,
              padding: "8px 18px",
              borderRadius: "30px",
              fontSize: "14px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              transition: "background-color 0.3s ease",
              "&:hover": {
                backgroundColor: `${primaryColor}CC`,
              },
            }}
            onClick={() => router.push("/create")}
          >
            Create Magey Plan
          </Button>
          <Button
            sx={{
              backgroundColor: secondaryColor,
              color: primaryColor,
              padding: "8px 18px",
              borderRadius: "30px",
              fontSize: "14px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              transition: "background-color 0.3s ease",
              "&:hover": {
                backgroundColor: `${primaryColor}33`,
              },
            }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
        <TextField
          label="Search by Package Name, Price, or Description"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "30px", // Rounded edges like the buttons
            },
          }}
        />
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{
            backgroundColor: primaryColor,
            color: secondaryColor,
            borderRadius: "50%",
            padding: "15px",
            marginLeft: 1,
            "&:hover": {
              backgroundColor: `${primaryColor}CC`,
            },
          }}
        >
          <FilterList />
        </IconButton>
      </Box>

      <Box display="flex" gap={1} flexWrap="wrap" sx={{ marginBottom: 2 }}>
        {activeFilters.map((filter, index) => (
          <Chip key={index} label={filter} />
        ))}
      </Box>

      {loading ? (
        <Backdrop open={loading} sx={{ zIndex: 10 }}>
          <CircularProgress />
        </Backdrop>
      ) : (
        <Grid container spacing={3}>
          {filteredRecommendations.map((rec) => (
            <Grid item xs={12} sm={6} md={4} key={rec.recno}>
              <MageyPackCard
                package_name={rec.package_name}
                bundle_price={rec.bundle_price}
                data_volume={rec.data_volume / 1024} // Convert MB to GB if required
                data_unit={filters.dataUnit}
                onnet_min={rec.onnet_min}
                short_desc={rec.Short_Desc}
                recno={rec.recno}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "50%",
            backdropFilter: "blur(8px)",
            backgroundColor: secondaryColor,
            padding: "24px",
            borderRadius: "10px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          },
        }}
      >
        <Box sx={{ padding: 2 }}>
          <Typography variant="h4" sx={{ color: primaryColor }}>
            Filters
          </Typography>

          {/* Bundle Price Filter */}
          <Typography sx={{ marginTop: 3 }}>Bundle Price (MVR)</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Slider
                value={filters.bundlePrice}
                min={minBundlePrice}
                max={maxBundlePrice}
                step={bundlePriceStep}
                onChange={(e, newValue) =>
                  handleFilterChange({
                    ...filters,
                    bundlePrice: newValue as [number, number],
                  })
                }
                valueLabelDisplay="auto"
                sx={{
                  color: primaryColor,
                  "& .MuiSlider-thumb": {
                    backgroundColor: primaryColor,
                  },
                  "& .MuiSlider-track": {
                    backgroundColor: primaryColor,
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Min Price"
                value={filters.bundlePrice[0]}
                type="number"
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    bundlePrice: [
                      Number(e.target.value),
                      filters.bundlePrice[1],
                    ],
                  })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "30px",
                    padding: "1px 15px", // Updated padding
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Max Price"
                value={filters.bundlePrice[1]}
                type="number"
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    bundlePrice: [
                      filters.bundlePrice[0],
                      Number(e.target.value),
                    ],
                  })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "30px",
                    padding: "1px 15px", // Updated padding
                  },
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ marginY: 4 }} />

          {/* Data Volume Filter */}
          <Typography>Data Volume</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Slider
                value={
                  filters.dataUnit === "GB"
                    ? [
                        filters.dataVolume[0] ?? minDataVolume, // Ensure a valid fallback value
                        filters.dataVolume[1] ?? maxDataVolume,
                      ]
                    : [
                        (filters.dataVolume[0] ?? minDataVolume) * 1024,
                        (filters.dataVolume[1] ?? maxDataVolume) * 1024,
                      ]
                }
                min={
                  filters.dataUnit === "GB"
                    ? minDataVolume
                    : minDataVolume * 1024
                }
                max={
                  filters.dataUnit === "GB" ? maxDataVolume : maxDataVolumeMb
                }
                step={
                  filters.dataUnit === "GB" ? dataVolumeStep : dataVolumeStepMb
                }
                onChange={(e, newValue) =>
                  handleFilterChange({
                    ...filters,
                    dataVolume: newValue as [number, number],
                  })
                }
                valueLabelDisplay="auto"
                sx={{
                  color: primaryColor,
                  "& .MuiSlider-thumb": {
                    backgroundColor: primaryColor,
                  },
                  "& .MuiSlider-track": {
                    backgroundColor: primaryColor,
                  },
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Min Volume"
                value={filters.dataVolume[0]}
                type="number"
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    dataVolume: [Number(e.target.value), filters.dataVolume[1]],
                  })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "30px",
                    padding: "1px 15px", // Updated padding
                  },
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Max Volume"
                value={filters.dataVolume[1]}
                type="number"
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    dataVolume: [filters.dataVolume[0], Number(e.target.value)],
                  })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "30px",
                    padding: "1px 15px", // Updated padding
                  },
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <Select
                  value={filters.dataUnit}
                  onChange={(e) =>
                    handleFilterChange({ ...filters, dataUnit: e.target.value })
                  }
                  sx={{
                    borderRadius: "50px", // Ensure dropdown is curved
                    "& .MuiSelect-select": {
                      padding: "17px 15px", // Adjust padding inside the dropdown
                    },
                  }}
                >
                  <MenuItem value="GB">GB</MenuItem>
                  <MenuItem value="MB">MB</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ marginY: 4 }} />

          {/* On-net Minutes Filter */}
          <Typography>On-net Minutes</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Slider
                value={filters.onnetMin}
                min={minOnnetMin}
                max={maxOnnetMin}
                step={onnetMinStep}
                onChange={(e, newValue) =>
                  handleFilterChange({
                    ...filters,
                    onnetMin: newValue as [number, number],
                  })
                }
                valueLabelDisplay="auto"
                sx={{
                  color: primaryColor,
                  "& .MuiSlider-thumb": {
                    backgroundColor: primaryColor,
                  },
                  "& .MuiSlider-track": {
                    backgroundColor: primaryColor,
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Min On-net"
                value={filters.onnetMin[0]}
                type="number"
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    onnetMin: [Number(e.target.value), filters.onnetMin[1]],
                  })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "30px",
                    padding: "1px 15px", // Updated padding
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Max On-net"
                value={filters.onnetMin[1]}
                type="number"
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    onnetMin: [filters.onnetMin[0], Number(e.target.value)],
                  })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "30px",
                    padding: "1px 15px", // Updated padding
                  },
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ marginY: 4 }} />

          {/* Local Minutes Filter */}
          <Typography>Local Minutes</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Slider
                value={filters.localMin}
                min={minLocalMin}
                max={maxLocalMin}
                step={localMinStep}
                onChange={(e, newValue) =>
                  handleFilterChange({
                    ...filters,
                    localMin: newValue as [number, number],
                  })
                }
                valueLabelDisplay="auto"
                sx={{
                  color: primaryColor,
                  "& .MuiSlider-thumb": {
                    backgroundColor: primaryColor,
                  },
                  "& .MuiSlider-track": {
                    backgroundColor: primaryColor,
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Min Local"
                value={filters.localMin[0]}
                type="number"
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    localMin: [Number(e.target.value), filters.localMin[1]],
                  })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "30px",
                    padding: "1px 15px", // Updated padding
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Max Local"
                value={filters.localMin[1]}
                type="number"
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    localMin: [filters.localMin[0], Number(e.target.value)],
                  })
                }
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "30px",
                    padding: "1px 15px", // Updated padding
                  },
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ marginY: 4 }} />

          {/* Custom Checkbox Filters */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center">
              <Checkbox
                checked={filters.hasOnnetMinutes}
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    hasOnnetMinutes: e.target.checked,
                  })
                }
                sx={{
                  color: primaryColor,
                  borderRadius: "50%", // Circular checkbox
                  "& .MuiSvgIcon-root": {
                    borderRadius: "50%",
                  },
                  "&.Mui-checked": {
                    color: primaryColor,
                  },
                }}
              />
              <Typography sx={{ color: primaryColor }}>
                Has On-net Minutes
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Checkbox
                checked={filters.hasLocalMinutes}
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    hasLocalMinutes: e.target.checked,
                  })
                }
                sx={{
                  color: primaryColor,
                  borderRadius: "50%", // Circular checkbox
                  "& .MuiSvgIcon-root": {
                    borderRadius: "50%",
                  },
                  "&.Mui-checked": {
                    color: primaryColor,
                  },
                }}
              />
              <Typography sx={{ color: primaryColor }}>
                Has Local Minutes
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Checkbox
                checked={filters.ribbonText}
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    ribbonText: e.target.checked,
                  })
                }
                sx={{
                  color: primaryColor,
                  borderRadius: "50%", // Circular checkbox
                  "& .MuiSvgIcon-root": {
                    borderRadius: "50%",
                  },
                  "&.Mui-checked": {
                    color: primaryColor,
                  },
                }}
              />
              <Typography sx={{ color: primaryColor }}>
                Limited Offer
              </Typography>
            </Box>
          </Box>

          <Box display="flex" mt={4} mb={2}>
            <Button
              sx={{
                backgroundColor: primaryColor,
                color: secondaryColor,
                padding: "8px 18px", // Slightly smaller buttons
                borderRadius: "30px",
                fontSize: "14px", // Slightly smaller font size
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "1px",
                transition: "background-color 0.3s ease",
                "&:hover": {
                  backgroundColor: `${primaryColor}CC`,
                },
              }}
              onClick={updateActiveFilters}
            >
              Set Filters
            </Button>
            <Button
              sx={{
                backgroundColor: secondaryColor,
                color: primaryColor,
                padding: "8px 18px", // Slightly smaller buttons
                borderRadius: "30px",
                fontSize: "14px", // Slightly smaller font size
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginLeft: 2,
              }}
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Container>
  );
}
