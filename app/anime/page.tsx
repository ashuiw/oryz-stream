import type { Metadata } from "next";
import MediaListingPage from "@/components/MediaListingPage";


export const metadata: Metadata = {
  title: "Anime",
  description: "Discover popular anime series and movies on Oryz.",
};

export default function AnimePage() {
  return <MediaListingPage kind="anime" />;
}
