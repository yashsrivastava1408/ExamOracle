import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Whisper Network",
  description: "The clandestine side of ExamOracle. University secrets, intel drops, and the internal heartbeat of campus gossip.",
  openGraph: {
    title: "ExamOracle Whisper Network",
    description: "Access the underground stream of anonymous campus intelligence.",
    images: [{ url: "/og-whisper.png" }],
  },
};

export default function WhisperLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
