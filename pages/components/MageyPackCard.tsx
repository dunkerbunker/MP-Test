import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
} from "@mui/material";
import Link from "next/link";
import { Edit } from "@mui/icons-material";

// Theme colors from env
const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#ff0000";
const secondaryColor = process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#ffffff";

interface MageyPackCardProps {
  package_name: string;
  bundle_price: number;
  data_volume: number;
  data_unit: string; // Either "GB" or "MB"
  onnet_min: number;
  short_desc: string;
  recno: number;
}

const MageyPackCard: React.FC<MageyPackCardProps> = ({
  package_name,
  bundle_price,
  data_volume,
  data_unit,
  onnet_min,
  short_desc,
  recno,
}) => {
  return (
    <Card
      sx={{
        maxWidth: 345,
        minHeight: 280, // Set a minimum height to keep the card size consistent
        m: 2,
        borderRadius: "20px",
        boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.15)",
        backgroundColor: secondaryColor,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.25)",
        },
      }}
    >
      <CardContent
        sx={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: "bold",
            color: primaryColor,
            fontSize: "1.25rem",
            marginBottom: "8px",
          }}
        >
          {package_name}
        </Typography>

        {/* Truncate the short description to 2 lines */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            marginBottom: "16px",
            fontSize: "0.95rem",
            display: "-webkit-box",
            WebkitLineClamp: 2, // Limit to 2 lines
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minHeight: "44px", // Ensure consistent height for the description area
          }}
        >
          {short_desc}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography
            variant="subtitle1"
            color="text.primary"
            sx={{ fontWeight: 500, fontSize: "1rem" }}
          >
            Data: {data_volume} {data_unit}
          </Typography>

          <Typography
            variant="subtitle1"
            color="text.primary"
            sx={{ fontWeight: 500, fontSize: "1rem" }}
          >
            On-net: {onnet_min} min
          </Typography>
        </Box>

        <Typography
          variant="h6"
          sx={{
            color: primaryColor,
            fontWeight: "bold",
            fontSize: "1.4rem",
          }}
        >
          MVR {bundle_price}
        </Typography>
      </CardContent>

      <CardActions
        sx={{
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="outlined"
          color="secondary"
          component={Link}
          href={`/edit/${recno}`}
          sx={{
            borderColor: primaryColor,
            color: primaryColor,
            borderRadius: "30px",
            "&:hover": {
              backgroundColor: `${primaryColor}33`,
            },
          }}
          startIcon={<Edit />}
        >
          Edit
        </Button>
      </CardActions>
    </Card>
  );
};

export default MageyPackCard;
