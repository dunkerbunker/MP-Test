"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Grid,
  Box,
  Drawer,
  Slider,
  Checkbox,
  FormControlLabel,
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
import Link from "next/link";

// Complete Recommendation interface
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

// Define FilterState interface
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

  const minBundlePrice = parseInt(process.env.NEXT_PUBLIC_MIN_BUNDLE_PRICE || "0", 10);
  const maxBundlePrice = parseInt(process.env.NEXT_PUBLIC_MAX_BUNDLE_PRICE || "1000", 10);
  const bundlePriceStep = parseInt(process.env.NEXT_PUBLIC_BUNDLE_PRICE_STEP || "5", 10);
  const minDataVolume = parseInt(process.env.NEXT_PUBLIC_MIN_DATA_VOLUME_GB || "0", 10);
  const maxDataVolume = parseInt(process.env.NEXT_PUBLIC_MAX_DATA_VOLUME_GB || "100", 10);
  const maxDataVolumeMb = parseInt(process.env.NEXT_PUBLIC_MAX_DATA_VOLUME_MB || "100", 10);
  const dataVolumeStep = parseInt(process.env.NEXT_PUBLIC_DATA_VOLUME_STEP_GB || "1", 10);
  const dataVolumeStepMb = parseInt(process.env.NEXT_PUBLIC_DATA_VOLUME_STEP_MB || "1", 10);
  const minOnnetMin = parseInt(process.env.NEXT_PUBLIC_MIN_ONNET_MIN || "0", 10);
  const maxOnnetMin = parseInt(process.env.NEXT_PUBLIC_MAX_ONNET_MIN || "1000", 10);
  const onnetMinStep = parseInt(process.env.NEXT_PUBLIC_ONNET_MIN_STEP || "100", 10);
  const minLocalMin = parseInt(process.env.NEXT_PUBLIC_MIN_LOCAL_MIN || "0", 10);
  const maxLocalMin = parseInt(process.env.NEXT_PUBLIC_MAX_LOCAL_MIN || "1000", 10);
  const localMinStep = parseInt(process.env.NEXT_PUBLIC_LOCAL_MIN_STEP || "100", 10);

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    axios.get("/api/recommendations").then((response) => {
      const uniqueRecommendations = response.data.reduce(
        (acc: Recommendation[], current: Recommendation) => {
          const x = acc.find(
            (item) => item.mageypackid === current.mageypackid
          );
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        },
        []
      );
      setRecommendations(uniqueRecommendations);
      setFilteredRecommendations(uniqueRecommendations);
      setLoading(false);
    });
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    applyFilters(value, filters);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const applyFilters = (searchTerm: string, filterState: FilterState) => {
    let filteredData = recommendations;

    // Apply search filter
    if (searchTerm) {
      filteredData = filteredData.filter(
        (rec) =>
          rec.package_name.toLowerCase().includes(searchTerm) ||
          rec.Short_Desc.toLowerCase().includes(searchTerm) ||
          rec.bundle_price.toString().includes(searchTerm)
      );
    }

    // Apply range filters
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
        rec.local_min <= filterState.localMin[1]
    );

    // Apply on-net minutes filter
    if (filterState.hasOnnetMinutes) {
      filteredData = filteredData.filter((rec) => rec.onnet_min > 0);
    }

    // Apply local minutes filter
    if (filterState.hasLocalMinutes) {
      filteredData = filteredData.filter((rec) => rec.local_min > 0);
    }

    // Apply ribbon text filter
    if (filterState.ribbonText) {
      filteredData = filteredData.filter(
        (rec) => rec.Ribbon_text?.toLowerCase().includes("limited offer")
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

    // Apply filters when "Set Filters" button is pressed
    applyFilters(searchTerm, filters);

    setDrawerOpen(false); // Close drawer after applying filters
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
      setRecommendations((prev) =>
        prev.filter((rec) => rec.recno !== recno)
      );
      setFilteredRecommendations((prev) =>
        prev.filter((rec) => rec.recno !== recno)
      );
    } catch (error) {
      console.error("Error deleting recommendation:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Recommendations
      </Typography>

      <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
        <TextField
          label="Search by Package Name, Price, or Description"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
        />
        <IconButton onClick={() => setDrawerOpen(true)} sx={{ marginLeft: 1 }}>
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
        <Paper
        sx={{ overflowX: "auto", 
          mb: 8,
        }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Package Name</TableCell>
                <TableCell>Bundle Price (MVR)</TableCell>
                <TableCell>Short Description</TableCell>
                <TableCell>On-net Minutes</TableCell>
                <TableCell>Data Volume ({filters.dataUnit})</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecommendations.map((rec) => (
                <TableRow key={rec.recno}>
                  <TableCell>{rec.package_name}</TableCell>
                  <TableCell>{rec.bundle_price}</TableCell>
                  <TableCell>{rec.Short_Desc}</TableCell>
                  <TableCell>{rec.onnet_min}</TableCell>
                  <TableCell>
                    {(filters.dataUnit === "GB"
                      ? rec.data_volume / 1024
                      : rec.data_volume
                    ).toFixed(2)}{" "}
                    {filters.dataUnit}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      component={Link}
                      href={`/edit/${rec.recno}`}
                      sx={{ marginRight: 1 }}
                    >
                      Edit
                    </Button>



                    {/* ENABLE IF DELETE REQUIRED */}
                    {/* <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleDelete(rec.recno)}
                    >
                      Delete
                    </Button> */}



                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "40%",
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "24px", // Add padding for a more modern look
            borderRadius: "10px", // Rounded corners
            overflowY: "auto", // Allow scrolling
            display: "flex", // Ensure the content flows vertically
            flexDirection: "column", // Stack elements vertically
            justifyContent: "space-between", // Ensure bottom buttons are pushed to the bottom
          },
        }}
      >
        <Box sx={{ padding: 2 }}>
          <Typography variant="h4">Filters</Typography>

          <Typography>Bundle Price (MVR)</Typography>
          <Grid container spacing={2}>
            <Grid item xs={8}>
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
              />
            </Grid>
            <Grid item xs={4}>
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
                sx={{ mb: 2 }}
              />
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
              />
            </Grid>
          </Grid>

          <Divider sx={{ marginY: 4 }} />

          <Typography>Data Volume</Typography>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Slider
                value={filters.dataVolume}
                min={minDataVolume}
                max={filters.dataUnit === "GB" ? maxDataVolume : maxDataVolumeMb}
                step={filters.dataUnit === "GB" ? dataVolumeStep : dataVolumeStepMb}
                onChange={(e, newValue) =>
                  handleFilterChange({
                    ...filters,
                    dataVolume: newValue as [number, number],
                  })
                }
                valueLabelDisplay="auto"
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
                    dataVolume: [
                      Number(e.target.value),
                      filters.dataVolume[1],
                    ],
                  })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="Max Volume"
                value={filters.dataVolume[1]}
                type="number"
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    dataVolume: [
                      filters.dataVolume[0],
                      Number(e.target.value),
                    ],
                  })
                }
              />
            </Grid>
          </Grid>

          <FormControl fullWidth sx={{ marginTop: 2 }}>
            <Select
              value={filters.dataUnit}
              onChange={(e) =>
                handleFilterChange({ ...filters, dataUnit: e.target.value })
              }
            >
              <MenuItem value="GB">GB</MenuItem>
              <MenuItem value="MB">MB</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ marginY: 4 }} />

          {/* Range Filter for On-net Minutes */}
          <Typography>On-net Minutes</Typography>
          <Grid container spacing={2}>
            <Grid item xs={8}>
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
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Min On-net"
                value={filters.onnetMin[0]}
                type="number"
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    onnetMin: [
                      Number(e.target.value),
                      filters.onnetMin[1],
                    ],
                  })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="Max On-net"
                value={filters.onnetMin[1]}
                type="number"
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    onnetMin: [
                      filters.onnetMin[0],
                      Number(e.target.value),
                    ],
                  })
                }
              />
            </Grid>
          </Grid>

          {/* Range Filter for Local Minutes */}
          <Typography>Local Minutes</Typography>
          <Grid container spacing={2}>
            <Grid item xs={8}>
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
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Min Local"
                value={filters.localMin[0]}
                type="number"
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    localMin: [
                      Number(e.target.value),
                      filters.localMin[1],
                    ],
                  })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                label="Max Local"
                value={filters.localMin[1]}
                type="number"
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    localMin: [
                      filters.localMin[0],
                      Number(e.target.value),
                    ],
                  })
                }
              />
            </Grid>
          </Grid>

          <Divider sx={{ marginY: 2 }} />

          {/* Checkbox Filters */}
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.hasOnnetMinutes}
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    hasOnnetMinutes: e.target.checked,
                  })
                }
              />
            }
            label="Has On-net Minutes"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.hasLocalMinutes}
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    hasLocalMinutes: e.target.checked,
                  })
                }
              />
            }
            label="Has Local Minutes"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.ribbonText}
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    ribbonText: e.target.checked,
                  })
                }
              />
            }
            label="Limited Offer"
          />

          <Box display="flex" mt={2} mb={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={updateActiveFilters}
            >
              Set Filters
            </Button>
            <Button variant="text" 
            color="primary" 
            onClick={resetFilters} 
            sx={{ marginLeft: 2 }}>
              Reset Filters
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Container>
  );
}
