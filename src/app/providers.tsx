"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import React from "react";

// app/providers.tsx
const theme = createTheme({
  palette: {
    primary: {
      main: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#ff0000",
    },
    secondary: {
      main: process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#ffffff",
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
