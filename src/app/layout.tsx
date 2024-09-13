import React from "react";
import { Providers } from "./providers";

export const metadata = {
  title: "Recommendation App",
  description: "CRUD application for recommendations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
