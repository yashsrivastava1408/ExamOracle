import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "ExamOracle — Paste your notes. Own your exam.",
  description:
    "The only platform that reads your lecture notes and predicts the exact questions most likely to appear in your exam. Auto-generated flashcards, quizzes, and summaries — completely free.",
  keywords: [
    "exam preparation",
    "AI study tool",
    "flashcard generator",
    "exam prediction",
    "study helper",
    "lecture notes",
    "quiz generator",
  ],
  openGraph: {
    title: "ExamOracle — Paste your notes. Own your exam.",
    description: "AI-powered exam prediction from your lecture notes. Free forever.",
    type: "website",
    images: [{ url: "/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ExamOracle — Paste your notes. Own your exam.",
    description: "AI-powered exam prediction from your lecture notes. Free forever.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${sora.variable} antialiased`}>
        <SplashScreen />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
