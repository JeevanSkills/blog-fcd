"use client";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

const theme = createTheme();
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
