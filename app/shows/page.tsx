import type { Metadata } from "next";
import MediaListingPage from "@/components/MediaListingPage";


export const metadata: Metadata = {
  title: "TV shows",
  description: "Browse popular, top rated and new TV shows by genre on Oryz.",
};

export default function ShowsPage() {
  return <MediaListingPage kind="tv" />;
}
