import type { Metadata } from "next";
import MediaListingPage from "@/components/MediaListingPage";


export const metadata: Metadata = {
  title: "Movies",
  description: "Browse popular, top rated and new movies by genre on Oryz.",
};

export default function MoviesPage() {
  return <MediaListingPage kind="movie" />;
}
