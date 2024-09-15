"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Slider,
  MenuItem,
  Select,
  FormControl,
  Autocomplete,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import { useRouter } from "next/navigation";

// Define the validation schema using Yup
const schema = yup.object().shape({
  bundle_price: yup
    .number()
    .required("Bundle price is required")
    .min(0, "Bundle price must be at least 0"),
  data_volume: yup
    .number()
    .required("Data volume is required")
    .min(0, "Data volume must be at least 0")
    .integer("Data volume must be a whole number"),
  data_validity: yup
    .number()
    .required("Data validity is required")
    .min(0, "Data validity must be at least 0")
    .integer("Data validity must be a whole number"),
  onnet_min: yup
    .number()
    .required("On-net minutes are required")
    .min(0, "On-net minutes must be at least 0")
    .integer("On-net minutes must be a whole number"),
  onnet_validity: yup
    .number()
    .required("On-net validity is required")
    .min(0, "On-net validity must be at least 0")
    .integer("On-net validity must be a whole number"),
  local_min: yup
    .number()
    .required("Local minutes are required")
    .min(0, "Local minutes must be at least 0")
    .integer("Local minutes must be a whole number"),
  local_validity: yup
    .number()
    .required("Local validity is required")
    .min(0, "Local validity must be at least 0")
    .integer("Local validity must be a whole number"),
  sms: yup
    .number()
    .required("SMS count is required")
    .min(0, "SMS count must be at least 0")
    .integer("SMS count must be a whole number"),
  sms_validity: yup
    .number()
    .required("SMS validity is required")
    .min(0, "SMS validity must be at least 0")
    .integer("SMS validity must be a whole number"),
  package_name: yup.string().required("Package name is required"),
  Short_Desc: yup.string().required("Short description is required"),
  Ribbon_text: yup.string().nullable(),
});

// Define the interface for Recommendation data
interface Recommendation {
  bundle_price: number;
  data_volume: number;
  data_validity: number;
  data_price: number;
  onnet_min: number;
  onnet_validity: number;
  onnet_price: number;
  local_min: number;
  local_validity: number;
  local_price: number;
  sms: number;
  sms_validity: number;
  sms_price: number;
  package_name: string;
  Short_Desc: string;
  Ribbon_text: string | null;
  giftpack: string;
  package_Verbiage: string | null;
  mageypackid: string;
}

export default function RecommendationForm({
  isEdit = false,
  id = null,
  startDate,
  endDate,
}: {
  isEdit?: boolean;
  id?: string | null;
  startDate?: string;
  endDate?: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Recommendation>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
  });

  // Get values from environment variables
  const minBundlePrice = parseInt(
    process.env.NEXT_PUBLIC_MIN_BUNDLE_PRICE || "0",
    10,
  );
  const maxBundlePrice = parseInt(
    process.env.NEXT_PUBLIC_MAX_BUNDLE_PRICE || "10000",
    10,
  );
  const bundlePriceStep = parseInt(
    process.env.NEXT_PUBLIC_BUNDLE_PRICE_STEP || "50",
    10,
  );

  const minDataVolumeMb = parseInt(
    process.env.NEXT_PUBLIC_MIN_DATA_VOLUME_MB || "0",
    10,
  );
  const maxDataVolumeMb = parseInt(
    process.env.NEXT_PUBLIC_MAX_DATA_VOLUME_MB || "50000",
    10,
  );
  const dataVolumeStepMb = parseInt(
    process.env.NEXT_PUBLIC_DATA_VOLUME_STEP_MB || "500",
    10,
  );

  const minDataVolumeGb = parseInt(
    process.env.NEXT_PUBLIC_MIN_DATA_VOLUME_GB || "0",
    10,
  );
  const maxDataVolumeGb = parseInt(
    process.env.NEXT_PUBLIC_MAX_DATA_VOLUME_GB || "50",
    10,
  );
  const dataVolumeStepGb = parseFloat(
    process.env.NEXT_PUBLIC_DATA_VOLUME_STEP_GB || "0.1",
  );

  const minOnnetMin = parseInt(
    process.env.NEXT_PUBLIC_MIN_ONNET_MIN || "0",
    10,
  );
  const maxOnnetMin = parseInt(
    process.env.NEXT_PUBLIC_MAX_ONNET_MIN || "10000",
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
    process.env.NEXT_PUBLIC_MAX_LOCAL_MIN || "10000",
    10,
  );
  const localMinStep = parseInt(
    process.env.NEXT_PUBLIC_LOCAL_MIN_STEP || "100",
    10,
  );

  const minSms = parseInt(process.env.NEXT_PUBLIC_MIN_SMS || "0", 10);
  const maxSms = parseInt(process.env.NEXT_PUBLIC_MAX_SMS || "10000", 10);
  const smsStep = parseInt(process.env.NEXT_PUBLIC_SMS_STEP || "100", 10);

  const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#ff0000";
  const secondaryColor = process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#ffffff";

  const minValidity = parseInt(
    process.env.NEXT_PUBLIC_MIN_VALIDITY_DAYS || "1",
    10,
  );
  const maxValidity = parseInt(
    process.env.NEXT_PUBLIC_MAX_VALIDITY_DAYS || "365",
    10,
  );

  const router = useRouter();

  const [bundlePrice, setBundlePrice] = useState<number>(minBundlePrice);
  const [dataVolume, setDataVolume] = useState<number>(minDataVolumeMb);
  const [onnetMin, setOnnetMin] = useState<number>(minOnnetMin);
  const [localMin, setLocalMin] = useState<number>(minLocalMin);
  const [dataValidity, setDataValidity] = useState<number>(minValidity);
  const [onnetValidity, setOnnetValidity] = useState<number>(minValidity);
  const [localValidity, setLocalValidity] = useState<number>(minValidity);
  const [smsValidity, setSmsValidity] = useState<number>(minValidity);
  const [sms, setSms] = useState<number>(minSms);
  const [validityOptions, setValidityOptions] = useState<number[]>([]);
  const [dataUnit, setDataUnit] = useState<"MB" | "GB">("MB");
  const [ribbonText, setRibbonText] = useState<string | null>(null);
  const [packageName, setPackageName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [previousData, setPreviousData] = useState<Recommendation | null>(null);

  useEffect(() => {
    if (showSuccessMessage) {
      const intervalId = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      if (countdown === 0) {
        router.push("/");
      }

      return () => clearInterval(intervalId);
    }
  }, [showSuccessMessage, countdown, router]);

  useEffect(() => {
    const validityDays = Array.from(
      { length: maxValidity - minValidity + 1 },
      (_, i) => i + minValidity,
    );
    setValidityOptions(validityDays);

    if (isEdit && id) {
      axios
        .get(`/api/recommendations/${id}?getVariants=true`)
        .then((response) => {
          const data = response.data[0];
          setPreviousData(data);
          setValue("bundle_price", data.bundle_price);
          setValue("data_volume", data.data_volume);
          setValue("data_validity", data.data_validity);
          setValue("onnet_min", data.onnet_min);
          setValue("onnet_validity", data.onnet_validity);
          setValue("local_min", data.local_min);
          setValue("local_validity", data.local_validity);
          setValue("sms", data.sms);
          setValue("sms_validity", data.sms_validity);
          setValue("package_name", data.package_name);
          setValue("Short_Desc", data.Short_Desc);
          setValue("Ribbon_text", data.Ribbon_text);
          setBundlePrice(data.bundle_price);
          setDataVolume(data.data_volume);
          setOnnetMin(data.onnet_min);
          setLocalMin(data.local_min);
          setSms(data.sms);
          setRibbonText(data.Ribbon_text || "null");
          setDataValidity(data.data_validity);
          setOnnetValidity(data.onnet_validity);
          setLocalValidity(data.local_validity);
          setSmsValidity(data.sms_validity);
          setPackageName(data.package_name);
          setIsLoading(false);
        });
    } else {
      setValue("giftpack", "NO");
      setValue("package_Verbiage", null);
      setIsLoading(false);
    }
  }, [isEdit, id, setValue, minValidity, maxValidity]);

  const handleDataUnitChange = (e: SelectChangeEvent) => {
    const selectedUnit = e.target.value as "MB" | "GB";

    if (selectedUnit === "GB") {
      setDataVolume((prevVolume) =>
        Math.min(prevVolume / 1024, maxDataVolumeGb),
      );
    } else {
      setDataVolume((prevVolume) =>
        Math.min(prevVolume * 1024, maxDataVolumeMb),
      );
    }

    setDataUnit(selectedUnit);
  };

  const onSubmit = async (data: Recommendation) => {
    try {
      let dataPrice = 0;
      let onnetPrice = 0;
      let localPrice = 0;
      let smsPrice = 0;
      
      let totalBundlePrice = data.bundle_price;
      
      // Check which allowances are present
      const hasData = data.data_volume > 0;
      const hasOnnet = data.onnet_min > 0;
      const hasLocal = data.local_min > 0;
      const hasSms = data.sms > 0;
      
      // Set a minimal price for each allowance if it exists
      const minimalPrice = 1;
      
      // Deduct minimal prices for onnet, local, and sms if present
      if (hasSms) {
        smsPrice = minimalPrice;
        totalBundlePrice -= minimalPrice;
      }
      
      if (hasLocal) {
        localPrice = minimalPrice;
        totalBundlePrice -= minimalPrice;
      }
      
      if (hasOnnet) {
        onnetPrice = minimalPrice;
        totalBundlePrice -= minimalPrice;
      }
      
      // Now, assign the remaining price based on the hierarchy
      if (hasData) {
        dataPrice = totalBundlePrice;
      } else if (hasOnnet) {
        onnetPrice += totalBundlePrice;
      } else if (hasLocal) {
        localPrice += totalBundlePrice;
      } else if (hasSms) {
        smsPrice += totalBundlePrice;
      }

      console.log(data);

      if (!isEdit) {
        let uniqueRecno = await generateUniqueRecno();
        const tempRecno = uniqueRecno;
        const upperCasePackageName = data.package_name
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_]/g, "")
          .toUpperCase();

        let currentDay = 1;
        const tempDataVolume = dataUnit === "GB" ? data.data_volume * 1024 : data.data_volume;

        while (currentDay <= 31) {
          const formData = {
            recno: uniqueRecno,
            day: currentDay,
            bundle_price: data.bundle_price,
            data_volume: tempDataVolume,
            data_validity: data.data_validity,
            data_price: dataPrice,
            onnet_min: data.onnet_min,
            onnet_validity: data.onnet_validity,
            onnet_price: onnetPrice,
            local_min: data.local_min,
            local_validity: data.local_validity,
            local_price: localPrice,
            sms: data.sms,
            sms_validity: data.sms_validity,
            sms_price: smsPrice,
            package_name: data.package_name,
            package_Verbage: data.package_Verbiage,
            Short_Desc: data.Short_Desc,
            Ribbon_text: data.Ribbon_text ?? null,
            Giftpack: "NO",
            mageypackid: `${tempRecno}_${upperCasePackageName}`,
          };

          await axios.post("/api/recommendations", formData);
          uniqueRecno += 1;
          currentDay += 1;
        }
        setShowSuccessMessage(true);
      } else if (isEdit && previousData) {
        const tempDataVolume = dataUnit === "GB" ? data.data_volume * 1024 : data.data_volume;

        const formData = {
          recno: id,
          day: startDate,
          bundle_price: data.bundle_price,
          data_volume: tempDataVolume,
          data_validity: data.data_validity,
          data_price: dataPrice,
          onnet_min: data.onnet_min,
          onnet_validity: data.onnet_validity,
          onnet_price: onnetPrice,
          local_min: data.local_min,
          local_validity: data.local_validity,
          local_price: localPrice,
          sms: data.sms,
          sms_validity: data.sms_validity,
          sms_price: smsPrice,
          package_name: data.package_name,
          package_Verbage: data.package_Verbiage,
          Short_Desc: data.Short_Desc,
          Ribbon_text: data.Ribbon_text ?? null,
          Giftpack: "NO",
          mageypackid: previousData.mageypackid,
        };

        sessionStorage.setItem('previousData', JSON.stringify(previousData));
        sessionStorage.setItem('modifiedData', JSON.stringify(formData));
        sessionStorage.setItem('startDate', startDate || '');
        sessionStorage.setItem('endDate', endDate || '');

        router.push(`/edit/${id}/confirm`);
      }
    } catch (error) {
      console.error("Submission process encountered an error:", error);
    }
  };

  const generateUniqueRecno = async () => {
    try {
      const response = await axios.get("/api/recno");
      return response.data.recno;
    } catch (error) {
      console.error("Error fetching recno:", error);
      throw new Error("Could not generate unique recno");
    }
  };

  return (
    <Container>
      {isLoading ? (
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          style={{ height: "100vh" }}
        >
          <CircularProgress />
        </Grid>
      ) : (
        <>
          {showSuccessMessage && (
            <Alert severity="success" sx={{ mb: 4 }}>
              Form submitted successfully! Redirecting to homepage in {countdown} seconds...
            </Alert>
          )}
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
            {isEdit ? `Currently Editing ${packageName}` : "Create Recommendation"}
          </Typography>

          {startDate && endDate && (
            <Typography sx={{ mb: 5 }}>
              Modifying the dates from {startDate} to {endDate}
            </Typography>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              {/* Bundle Price with Slider */}
              <Grid item xs={12}>
                <Typography align="left">Bundle Price (MVR)</Typography>
                <Slider
                  value={bundlePrice}
                  min={minBundlePrice}
                  max={maxBundlePrice}
                  step={bundlePriceStep}
                  onChange={(e, newValue) => {
                    setBundlePrice(newValue as number);
                    setValue('bundle_price', newValue as number); // Sync form state
                  }}
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
                <TextField
                  {...register("bundle_price")}
                  value={bundlePrice}
                  onChange={(e) => {
                    setBundlePrice(Number(e.target.value));
                    setValue('bundle_price', Number(e.target.value)); // Sync form state
                  }}
                  label="Bundle Price"
                  error={!!errors.bundle_price}
                  helperText={errors.bundle_price?.message}
                  fullWidth
                  margin="normal"
                  type="number"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "30px",
                      padding: "1px 15px",
                    },
                  }}
                />
              </Grid>

              {/* Data Volume with Slider */}
              <Grid item xs={12}>
                <Typography align="left">Data Volume</Typography>
                <Slider
                  value={dataVolume}
                  min={dataUnit === "MB" ? minDataVolumeMb : minDataVolumeGb}
                  max={dataUnit === "MB" ? maxDataVolumeMb : maxDataVolumeGb}
                  step={dataUnit === "MB" ? dataVolumeStepMb : dataVolumeStepGb}
                  onChange={(e, newValue) => {
                    setDataVolume(newValue as number);
                    setValue('data_volume', newValue as number); // Sync form state
                  }}
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
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6}>
                    <TextField
                      {...register("data_volume")}
                      value={dataVolume}
                      onChange={(e) => {
                        setDataVolume(Number(e.target.value));
                        setValue('data_volume', Number(e.target.value)); // Sync form state
                      }}
                      label="Data Volume"
                      error={!!errors.data_volume}
                      helperText={errors.data_volume?.message}
                      fullWidth
                      margin="normal"
                      type="number"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "30px",
                          padding: "1px 15px",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth margin="normal">
                      <Select
                        value={dataUnit}
                        onChange={handleDataUnitChange}
                        sx={{
                          borderRadius: "50px",
                          "& .MuiSelect-select": {
                            padding: "17px 15px",
                          },
                        }}
                      >
                        <MenuItem value="MB">MB</MenuItem>
                        <MenuItem value="GB">GB</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                    <Autocomplete
                      options={validityOptions}
                      getOptionLabel={(option) => option.toString()}
                      defaultValue={dataValidity || minValidity}
                      onChange={(event, newValue) => {
                        setDataValidity(newValue ?? minValidity);
                        setValue('data_validity', newValue ?? minValidity); // Sync form state
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          {...register("data_validity")}
                          label="Validity"
                          error={!!errors.data_validity}
                          helperText={errors.data_validity?.message}
                          fullWidth
                          margin="normal"
                          InputProps={{
                            ...params.InputProps,
                            sx: {
                              borderRadius: "30px",
                            },
                          }}
                        />
                      )}
                      ListboxProps={{
                        style: { maxHeight: "150px" },
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* On-net Minutes with Slider */}
              <Grid item xs={12}>
                <Typography align="left">On-net Minutes</Typography>
                <Slider
                  value={onnetMin}
                  min={minOnnetMin}
                  max={maxOnnetMin}
                  step={onnetMinStep}
                  onChange={(e, newValue) => {
                    setOnnetMin(newValue as number);
                    setValue('onnet_min', newValue as number); // Sync form state
                  }}
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
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={9}>
                    <TextField
                      {...register("onnet_min")}
                      value={onnetMin}
                      onChange={(e) => {
                        setOnnetMin(Number(e.target.value));
                        setValue('onnet_min', Number(e.target.value)); // Sync form state
                      }}
                      label="On-net Minutes"
                      error={!!errors.onnet_min}
                      helperText={errors.onnet_min?.message}
                      fullWidth
                      margin="normal"
                      type="number"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "30px",
                          padding: "1px 15px",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Autocomplete
                      options={validityOptions}
                      getOptionLabel={(option) => option.toString()}
                      defaultValue={onnetValidity || minValidity}
                      onChange={(event, newValue) => {
                        setOnnetValidity(newValue ?? minValidity);
                        setValue('onnet_validity', newValue ?? minValidity); // Sync form state
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          {...register("onnet_validity")}
                          label="Validity"
                          error={!!errors.onnet_validity}
                          helperText={errors.onnet_validity?.message}
                          fullWidth
                          margin="normal"
                          InputProps={{
                            ...params.InputProps,
                            sx: {
                              borderRadius: "30px",
                            },
                          }}
                        />
                      )}
                      ListboxProps={{
                        style: { maxHeight: "150px" },
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Local Minutes with Slider */}
              <Grid item xs={12}>
                <Typography align="left">Local Minutes</Typography>
                <Slider
                  value={localMin}
                  min={minLocalMin}
                  max={maxLocalMin}
                  step={localMinStep}
                  onChange={(e, newValue) => {
                    setLocalMin(newValue as number);
                    setValue('local_min', newValue as number); // Sync form state
                  }}
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
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={9}>
                    <TextField
                      {...register("local_min")}
                      value={localMin}
                      onChange={(e) => {
                        setLocalMin(Number(e.target.value));
                        setValue('local_min', Number(e.target.value)); // Sync form state
                      }}
                      label="Local Minutes"
                      error={!!errors.local_min}
                      helperText={errors.local_min?.message}
                      fullWidth
                      margin="normal"
                      type="number"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "30px",
                          padding: "1px 15px",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Autocomplete
                      options={validityOptions}
                      getOptionLabel={(option) => option.toString()}
                      defaultValue={localValidity || minValidity}
                      onChange={(event, newValue) => {
                        setLocalValidity(newValue ?? minValidity);
                        setValue('local_validity', newValue ?? minValidity); // Sync form state
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          {...register("local_validity")}
                          label="Validity"
                          error={!!errors.local_validity}
                          helperText={errors.local_validity?.message}
                          fullWidth
                          margin="normal"
                          InputProps={{
                            ...params.InputProps,
                            sx: {
                              borderRadius: "30px",
                            },
                          }}
                        />
                      )}
                      ListboxProps={{
                        style: { maxHeight: "150px" },
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* SMS Count with Slider */}
              <Grid item xs={12}>
                <Typography align="left">SMS Count</Typography>
                <Slider
                  value={sms}
                  min={minSms}
                  max={maxSms}
                  step={smsStep}
                  onChange={(e, newValue) => {
                    setSms(newValue as number);
                    setValue('sms', newValue as number); // Sync form state
                  }}
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
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={9}>
                    <TextField
                      {...register("sms")}
                      value={sms}
                      onChange={(e) => {
                        setSms(Number(e.target.value));
                        setValue('sms', Number(e.target.value)); // Sync form state
                      }}
                      label="SMS Count"
                      error={!!errors.sms}
                      helperText={errors.sms?.message}
                      fullWidth
                      margin="normal"
                      type="number"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "30px",
                          padding: "1px 15px",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Autocomplete
                      options={validityOptions}
                      getOptionLabel={(option) => option.toString()}
                      value={smsValidity ?? minValidity}
                      onChange={(event, newValue) => {
                        setSmsValidity(newValue ?? minValidity);
                        setValue('sms_validity', newValue ?? minValidity); // Sync form state
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          {...register("sms_validity")}
                          label="Validity"
                          error={!!errors.sms_validity}
                          helperText={errors.sms_validity?.message}
                          fullWidth
                          margin="normal"
                          InputProps={{
                            ...params.InputProps,
                            sx: {
                              borderRadius: "30px",
                            },
                          }}
                        />
                      )}
                      ListboxProps={{
                        style: { maxHeight: "150px" },
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Package Name */}
              <Grid item xs={12}>
                <TextField
                  label="Package Name"
                  {...register("package_name")}
                  error={!!errors.package_name}
                  helperText={errors.package_name?.message}
                  fullWidth
                  margin="normal"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "30px",
                      padding: "1px 15px",
                    },
                  }}
                />
              </Grid>

              {/* Short Description */}
              <Grid item xs={12}>
                <TextField
                  label="Short Description"
                  {...register("Short_Desc")}
                  error={!!errors.Short_Desc}
                  helperText={errors.Short_Desc?.message}
                  fullWidth
                  margin="normal"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "30px",
                      padding: "1px 15px",
                    },
                  }}
                />
              </Grid>

              {/* Ribbon Text */}
              <Grid item xs={12}>
                <Typography align="left" sx={{ mb: 1 }}>
                  Tag
                </Typography>
                <FormControl fullWidth>
                  <Select
                    {...register("Ribbon_text")}
                    value={ribbonText}
                    onChange={(e) => {
                      setRibbonText(e.target.value);
                      setValue('Ribbon_text', e.target.value); // Sync form state
                    }}
                    sx={{
                      borderRadius: "50px",
                      "& .MuiSelect-select": {
                        padding: "17px 15px",
                      },
                    }}
                  >
                    <MenuItem value="null">None</MenuItem>
                    <MenuItem value="Limited Offer">Limited Offer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
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
                    mb: 5,
                    "&:hover": {
                      backgroundColor: `${primaryColor}CC`,
                    },
                  }}
                  type="submit"
                >
                  {isEdit ? "Review Changes" : "Create"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </>
      )}
    </Container>
  );
}
