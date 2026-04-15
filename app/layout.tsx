import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";
import { ToasterProvider } from "@/components/ui/Toaster";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "ExamOracle — Your AI-Powered Exam Strategist",
    template: "%s | ExamOracle"
  },
  description:
    "Transform messy lecture notes into precise exam predictions, smart flashcards, and practice quizzes in seconds. Built for students, powered by logic.",
  keywords: [
    "exam preparation",
    "AI study tool",
    "flashcard generator",
    "exam prediction",
    "study helper",
    "lecture notes",
    "quiz generator",
    "anonymous student community",
    "whisper network"
  ],
  authors: [{ name: "ExamOracle Team" }],
  creator: "ExamOracle",
  publisher: "ExamOracle",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "ExamOracle — Paste your notes. Own your exam.",
    description: "AI-powered exam prediction from your lecture notes. Free forever.",
    url: "https://examoracle.app",
    siteName: "ExamOracle",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ExamOracle Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ExamOracle — Paste your notes. Own your exam.",
    description: "AI-powered exam prediction from your lecture notes. Free forever.",
    images: ["/og-image.png"],
    creator: "@examoracle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <ToasterProvider>
          <SplashScreen />
          {children}
        </ToasterProvider>
        <Analytics />
      </body>
    </html>
  );
}
