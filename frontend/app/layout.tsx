import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import { ToastProvider } from "./contexts/ToastContext";
import { Plus_Jakarta_Sans } from "next/font/google";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "TopSkill LMS - Learn Without Limits",
  description: "Complete Udemy-like Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${font.variable} w-full overflow-x-hidden`}>
      <body className="antialiased w-full overflow-x-hidden font-sans" suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
