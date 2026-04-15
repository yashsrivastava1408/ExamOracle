import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exam Prep Hub",
  description: "Transform your study materials into precise blueprints. Flashcards, quizzes, and AI predictions scaled for your exam success.",
  openGraph: {
    title: "ExamOracle Prep Hub",
    description: "Your personalized AI strategist for acing exams.",
    images: [{ url: "/og-prep.png" }],
  },
};

export default function PrepLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
