import { createTheme } from "@mui/material/styles";

// Access environment variables for colors
const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#ff0000"; // Default to red
const secondaryColor = process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#ffffff"; // Default to white

// Create a theme with primary and secondary colors
const theme = createTheme({
  palette: {
    primary: {
      main: primaryColor,
    },
    secondary: {
      main: secondaryColor,
    },
  },
});

export default theme;
