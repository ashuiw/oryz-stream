import type { Metadata } from "next";
import LibraryClient from "@/components/library/LibraryClient";


export const metadata: Metadata = {
  title: "Your library",
  description: "Your liked titles, watch-later list and continue-watching history on Oryz.",
  robots: { index: false },
};

export default function LibraryPage() {
  return <LibraryClient />;
}
