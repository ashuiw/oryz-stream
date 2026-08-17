"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import OttSection from "./OttSection";
import MediaGrid from "./MediaGrid";
import SearchOverlay from "./SearchOverlay";
import { Media, backdrop, titleOf } from "@/lib/tmdb";

export default function HomeClient() {
  const searchParams = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(searchParams.get("search") === "open");
  const [trending, setTrending] = useState<Media[]>([]);
  const [discover, setDiscover] = useState<Media[]>([]);
  const [shows, setShows] = useState<Media[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    setSearchOpen(searchParams.get("search") === "open");
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      const [heroRes, discoverRes, showsRes] = await Promise.all([
        fetch("/api/tmdb?type=movie&mode=trending&page=1"),
        fetch("/api/tmdb?type=movie&mode=discover&page=1"),
        fetch("/api/tmdb?type=tv&mode=trending&page=1"),
      ]);

      const [heroData, discoverData, showsData] = await Promise.all([
        heroRes.json(),
        discoverRes.json(),
        showsRes.json(),
      ]);

      setTrending((heroData.results || []).filter((x: Media) => x.backdrop_path).slice(0, 8));
      setDiscover((discoverData.results || []).slice(0, 50));
      setShows((showsData.results || []).slice(0, 12));
    }

    load().catch(console.error);
  }, []);

  useEffect(() => {
    if (trending.length < 2) return;
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % trending.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [trending.length]);

  const hero = trending[heroIndex];

  const closeSearch = () => {
    setSearchOpen(false);
    window.history.replaceState(null, "", "/");
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <Navbar />
      <SearchOverlay open={searchOpen} onClose={closeSearch} />

      <main>
        <section className="relative -mt-[68px] min-h-[650px] overflow-hidden pt-[68px]">
          {hero?.backdrop_path ? (
            <img
              src={backdrop(hero.backdrop_path, "original")}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-black/25" />

          <div className="relative mx-auto flex min-h-[650px] max-w-[1280px] items-end px-5 pb-28">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
                Trending now
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                {hero ? titleOf(hero) : "Discover something worth watching"}
              </h1>
              <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                {hero?.overview || "Browse popular movies, shows and anime in one place."}
              </p>

              <div className="mt-6 flex items-center gap-3">
                <Link
                  href={hero ? `/watch/movie/${hero.id}` : "/movies"}
                  className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/85"
                >
                  <Play size={15} fill="currentColor" />
                  Watch now
                </Link>
                <Link
                  href="/movies"
                  className="rounded-xl border border-white/15 bg-black/30 px-5 py-3 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/10"
                >
                  Browse movies
                </Link>
              </div>
            </div>
          </div>

          {trending.length > 1 ? (
            <div className="absolute bottom-10 right-5 flex items-center gap-2 sm:right-10">
              <button
                onClick={() => setHeroIndex((i) => (i - 1 + trending.length) % trending.length)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/40 text-white/70 backdrop-blur-md hover:text-white"
              >
                <ChevronLeft size={17} />
              </button>
              <div className="flex gap-1.5">
                {trending.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === heroIndex ? "w-6 bg-white" : "w-1.5 bg-white/35"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setHeroIndex((i) => (i + 1) % trending.length)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/40 text-white/70 backdrop-blur-md hover:text-white"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          ) : null}
        </section>

        <OttSection />

        <section className="mx-auto max-w-[1280px] px-5 py-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">
                Discover
              </p>
              <h2 className="mt-1 text-2xl font-semibold">Find your next watch</h2>
            </div>

            <Link
              href="/movies"
              className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
            >
              What to see more?
              <ArrowRight size={15} />
            </Link>
          </div>

          <MediaGrid items={discover} limit={50} />
        </section>

        <section className="mx-auto max-w-[1280px] px-5 py-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Trending shows</h2>
            <Link href="/shows" className="text-sm text-white/45 hover:text-white">
              See all
            </Link>
          </div>
          <MediaGrid items={shows} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
