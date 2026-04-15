import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Radar",
  description: "Join the anonymous student hub. Share resources, ask doubts, and stay updated with live campus signals.",
  openGraph: {
    title: "ExamOracle Community Radar",
    description: "The heartbeat of anonymous campus life. Real-time signals and student intel.",
    images: [{ url: "/og-community.png" }],
  },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
