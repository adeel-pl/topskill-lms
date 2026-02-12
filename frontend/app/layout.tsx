import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import { ToastProvider } from "./contexts/ToastContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
// Font loading - using system fonts as fallback if Google Fonts fails
// The site uses CameraPlainVariable from globals.css as primary font
let font = { variable: "" };
try {
  const { Plus_Jakarta_Sans } = require("next/font/google");
  font = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
    variable: "--font-jakarta",
    display: "swap",
    fallback: ["system-ui", "arial"],
  });
} catch (error) {
  // Fallback if font loading fails
  console.warn("Google Fonts not available, using system fonts");
}

export const metadata: Metadata = {
  title: "TopSkill LMS - Learn Without Limits",
  description: "Complete Udemy-like Learning Management System",
};

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${font.variable} w-full overflow-x-hidden`}>
      <body className="antialiased w-full overflow-x-hidden font-sans" suppressHydrationWarning>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
