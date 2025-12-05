import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/layout/Navbar";
import { Toaster } from "../components/ui-kit/sonner";
import { WorkflowNavProvider } from "../contexts/WorkflowNavContext";
import { QueryProvider } from "../providers/QueryProvider";
import { ThemeProvider } from "../components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Convo Flow - Chatbot Workflow Builder",
  description: "Create custom chatbot workflows with Convo Flow",
  icons: {
    icon: "/brand/favicon.ico",
    shortcut: "/brand/favicon.ico",
    apple: "/brand/favicon.ico",
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--primary)] focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <QueryProvider>
            <WorkflowNavProvider>
              <Navbar />
              <main id="main-content" tabIndex={-1}>
                {children}
              </main>
              <Toaster position="top-right" />
            </WorkflowNavProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
