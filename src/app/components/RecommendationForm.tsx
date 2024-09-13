"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Container, TextField, Button, Typography, Grid } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const schema = yup.object().shape({
  day: yup.number().required("Day is required").integer("Must be an integer"),
  recno: yup
    .number()
    .required("Rec No is required")
    .min(0, "Rec No must be 0 or greater")
    .integer(),
  bundle_price: yup
    .number()
    .required("Bundle price is required")
    .min(0, "Bundle price must be 0 or greater"),
  data_volume: yup
    .number()
    .required("Data volume is required")
    .min(0, "Data volume must be 0 or greater")
    .integer("Must be an integer"),
  data_validity: yup
    .number()
    .required("Data validity is required")
    .min(0, "Data validity must be 0 or greater")
    .integer("Must be an integer"),
  data_price: yup
    .number()
    .required("Data price is required")
    .min(0, "Data price must be 0 or greater"),
  onnet_min: yup
    .number()
    .required("On-net minutes are required")
    .min(0, "On-net minutes must be 0 or greater")
    .integer("Must be an integer"),
  onnet_validity: yup
    .number()
    .required("On-net validity is required")
    .min(0, "On-net validity must be 0 or greater")
    .integer("Must be an integer"),
  onnet_price: yup
    .number()
    .required("On-net price is required")
    .min(0, "On-net price must be 0 or greater"),
  local_min: yup
    .number()
    .required("Local minutes are required")
    .min(0, "Local minutes must be 0 or greater")
    .integer("Must be an integer"),
  local_validity: yup
    .number()
    .required("Local validity is required")
    .min(0, "Local validity must be 0 or greater")
    .integer("Must be an integer"),
  local_price: yup
    .number()
    .required("Local price is required")
    .min(0, "Local price must be 0 or greater"),
  sms: yup
    .number()
    .required("SMS count is required")
    .min(0, "SMS count must be 0 or greater")
    .integer("Must be an integer"),
  sms_validity: yup
    .number()
    .required("SMS validity is required")
    .min(0, "SMS validity must be 0 or greater")
    .integer("Must be an integer"),
  sms_price: yup
    .number()
    .required("SMS price is required")
    .min(0, "SMS price must be 0 or greater"),
  package_name: yup.string().required("Package name is required"),
  package_Verbage: yup.string(), // Not required anymore
  Short_Desc: yup.string().required("Short description is required"),
  Ribbon_text: yup.string(), // Not required anymore
  Giftpack: yup.string().required("Giftpack is required"),
  mageypackid: yup.string().required("Mageypack ID is required"),
});

interface Recommendation {
  day: number;
  recno: number;
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
  package_Verbage: string;
  Short_Desc: string;
  Ribbon_text: string;
  Giftpack: string;
  mageypackid: string;
}

export default function RecommendationForm({
  isEdit = false,
  id = null,
}: {
  isEdit?: boolean;
  id?: string | null;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Recommendation>({
    resolver: yupResolver(schema),
  });

  const router = useRouter();

  useEffect(() => {
    if (isEdit && id) {
      axios.get(`/api/recommendations/${id}`).then((response) => {
        const data = response.data as Recommendation;
        (Object.keys(data) as Array<keyof Recommendation>).forEach((key) => {
          setValue(key, data[key]);
        });
      });
    }
  }, [isEdit, id, setValue]);

  const onSubmit = (data: Recommendation) => {
    if (isEdit) {
      axios.put(`/api/recommendations/${id}`, data).then(() => {
        router.push("/");
      });
    } else {
      axios.post("/api/recommendations", data).then(() => {
        router.push("/");
      });
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEdit ? "Edit" : "Create"} Recommendation
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {/* Rec No */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Rec No"
              {...register("recno")}
              error={!!errors.recno}
              helperText={errors.recno?.message}
              fullWidth
              margin="normal"
              disabled={isEdit}
              type="number"
            />
          </Grid>
          {/* Day */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Day"
              {...register("day")}
              error={!!errors.day}
              helperText={errors.day?.message}
              fullWidth
              margin="normal"
              type="number"
            />
          </Grid>
          {/* Bundle Price */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Bundle Price"
              {...register("bundle_price")}
              error={!!errors.bundle_price}
              helperText={errors.bundle_price?.message}
              fullWidth
              margin="normal"
              type="number"
            />
          </Grid>
          {/* Data Volume */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Data Volume"
              {...register("data_volume")}
              error={!!errors.data_volume}
              helperText={errors.data_volume?.message}
              fullWidth
              margin="normal"
              type="number"
            />
          </Grid>
          {/* Data Validity */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Data Validity"
              {...register("data_validity")}
              error={!!errors.data_validity}
              helperText={errors.data_validity?.message}
              fullWidth
              margin="normal"
              type="number"
            />
          </Grid>
          {/* Data Price */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Data Price"
              {...register("data_price")}
              error={!!errors.data_price}
              helperText={errors.data_price?.message}
              fullWidth
              margin="normal"
              type="number"
            />
          </Grid>
          {/* On-net Minutes */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="On-net Minutes"
              {...register("onnet_min")}
              error={!!errors.onnet_min}
              helperText={errors.onnet_min?.message}
              fullWidth
              margin="normal"
              type="number"
            />
          </Grid>
          {/* On-net Validity */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="On-net Validity"
              {...register("onnet_validity")}
              error={!!errors.onnet_validity}
              helperText={errors.onnet_validity?.message}
              fullWidth
              margin="normal"
              type="number"
            />
          </Grid>
          {/* On-net Price */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="On-net Price"
              {...register("onnet_price")}
              error={!!errors.onnet_price}
              helperText={errors.onnet_price?.message}
              fullWidth
              margin="normal"
              type="number"
            />
          </Grid>
          {/* Local Minutes */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Local Minutes"
              {...register("local_min")}
              error={!!errors.local_min}
              helperText={errors.local_min?.message}
              fullWidth
              margin="normal"
              type="number"
            />
          </Grid>
          {/* Local Validity */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Local Validity"
              {...register("local_validity")}
              error={!!errors.local_validity}
              helperText={errors.local_validity?.message}
              fullWidth
              margin="normal"
              type="number"
            />
          </Grid>
          {/* Local Price */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Local Price"
              {...register("local_price")}
              error={!!errors.local_price}
              helperText={errors.local_price?.message}
              fullWidth
              margin="normal"
              type="number"
            />
          </Grid>
          {/* SMS */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="SMS"
              {...register("sms")}
              error={!!errors.sms}
              helperText={errors.sms?.message}
              fullWidth
              margin="normal"
              type="number"
            />
          </Grid>
          {/* SMS Validity */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="SMS Validity"
              {...register("sms_validity")}
              error={!!errors.sms_validity}
              helperText={errors.sms_validity?.message}
              fullWidth
              margin="normal"
              type="number"
            />
          </Grid>
          {/* SMS Price */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="SMS Price"
              {...register("sms_price")}
              error={!!errors.sms_price}
              helperText={errors.sms_price?.message}
              fullWidth
              margin="normal"
              type="number"
            />
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
            />
          </Grid>
          {/* Package Verbage */}
          <Grid item xs={12}>
            <TextField
              label="Package Verbage"
              {...register("package_Verbage")}
              error={!!errors.package_Verbage}
              helperText={errors.package_Verbage?.message}
              fullWidth
              margin="normal"
              multiline
              rows={3}
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
            />
          </Grid>
          {/* Ribbon Text */}
          <Grid item xs={12}>
            <TextField
              label="Ribbon Text"
              {...register("Ribbon_text")}
              error={!!errors.Ribbon_text}
              helperText={errors.Ribbon_text?.message}
              fullWidth
              margin="normal"
            />
          </Grid>
          {/* Giftpack */}
          <Grid item xs={12}>
            <TextField
              label="Giftpack"
              {...register("Giftpack")}
              error={!!errors.Giftpack}
              helperText={errors.Giftpack?.message}
              fullWidth
              margin="normal"
            />
          </Grid>
          {/* Mageypack ID */}
          <Grid item xs={12}>
            <TextField
              label="Mageypack ID"
              {...register("mageypackid")}
              error={!!errors.mageypackid}
              helperText={errors.mageypackid?.message}
              fullWidth
              margin="normal"
            />
          </Grid>
          {/* Submit Button */}
          <Grid item xs={12}>
            <Button variant="contained" color="primary" type="submit">
              {isEdit ? "Update" : "Create"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}
