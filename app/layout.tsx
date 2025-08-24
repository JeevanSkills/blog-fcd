"use client";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import NavigationBar from "@/app/navbar";

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
          <AuthProvider>
            <NavigationBar />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
