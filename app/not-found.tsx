import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LogoMark } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for does not exist or has moved.",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <main className="mx-auto flex min-h-[70vh] max-w-[1280px] flex-col items-start justify-center px-4 py-16 sm:px-5">
        <LogoMark size={56} />
        <p className="rank-num mt-8 text-[7rem] sm:text-[11rem]">404</p>
        <h1 className="mt-4 text-4xl sm:text-6xl">This scene was cut</h1>
        <p className="mt-4 max-w-md text-[15px] leading-7 text-white/60">
          The page you are looking for does not exist or has moved. Head back to the lobby and pick something else.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="gold-btn inline-flex h-12 items-center px-6 text-[15px]">Back to home</Link>
          <Link href="/movies" className="ghost-btn inline-flex h-12 items-center px-6 text-[15px]">Browse movies</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
