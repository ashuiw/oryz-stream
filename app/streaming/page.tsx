import type { Metadata } from "next";
import StreamingHome from "@/components/streaming/StreamingHome";


export const metadata: Metadata = {
  title: "Streaming apps",
  description: "See what is on Netflix, Disney+, Prime Video, Max and more, all in one place.",
};

export default function StreamingPage() {
  return <StreamingHome />;
}
