"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Info, Play, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import OttSection from "./OttSection";
import MediaGrid from "./MediaGrid";
import MediaCard from "./MediaCard";
import ScrollRow from "./ScrollRow";
import SearchOverlay from "./SearchOverlay";
import MediaPreviewModal from "./MediaPreviewModal";
import { useAuth } from "./auth/AuthProvider";
import { Media, backdrop, mediaType, poster, titleOf, yearOf } from "@/lib/tmdb";

const moods = [
  { label: "Action", href: "/movies?genre=28" },
  { label: "Comedy", href: "/movies?genre=35" },
  { label: "Sci-Fi", href: "/movies?genre=878" },
  { label: "Thriller", href: "/movies?genre=53" },
  { label: "Romance", href: "/movies?genre=10749" },
  { label: "Horror", href: "/movies?genre=27" },
  { label: "Anime", href: "/anime" },
  { label: "Crime shows", href: "/shows?genre=80" },
];

export default function HomeClient() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(searchParams.get("search") === "open");
  const [trending, setTrending] = useState<Media[]>([]);
  const [discover, setDiscover] = useState<Media[]>([]);
  const [shows, setShows] = useState<Media[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [preview, setPreview] = useState<Media | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setSearchOpen(searchParams.get("search") === "open");
  }, [searchParams]);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

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
      setShows((showsData.results || []).slice(0, 16));
    }

    load().catch(console.error).finally(() => setLoaded(true));
  }, []);

  const hero = trending[heroIndex];
  const next = () => setHeroIndex((i) => (i + 1) % Math.max(trending.length, 1));
  const prev = () => setHeroIndex((i) => (i - 1 + trending.length) % Math.max(trending.length, 1));
  const upNext = trending.length > 1 ? [1, 2, 3].map((n) => trending[(heroIndex + n) % trending.length]) : [];

  const closeSearch = () => {
    setSearchOpen(false);
    window.history.replaceState(null, "", "/");
  };

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <SearchOverlay open={searchOpen} onClose={closeSearch} />

      <main>
        {/* Hero */}
        <section
          className={`relative -mt-[76px] overflow-hidden ${paused ? "hero-paused" : ""}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          aria-roledescription="carousel"
          aria-label="Trending movies"
        >
          <div className="relative min-h-[620px] pt-[76px] sm:min-h-[700px]">
            {trending.map((m, i) => (
              <img
                key={m.id}
                src={backdrop(m.backdrop_path, "original")}
                alt=""
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === heroIndex ? "opacity-100" : "opacity-0"}`}
                loading={i === 0 ? "eager" : "lazy"}
              />
            ))}

            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-ink/50" />
            {!reduceMotion ? (
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                {[
                  ["72%", "8%", "0s"],
                  ["84%", "22%", "3.5s"],
                  ["60%", "4%", "6s"],
                  ["92%", "10%", "8.5s"],
                ].map(([l, t, d], i) => (
                  <span key={i} className="leaf" style={{ left: l, top: t, animationDelay: d }} />
                ))}
              </div>
            ) : null}

            <div className="relative mx-auto flex min-h-[620px] max-w-[1280px] items-end px-4 pb-28 sm:min-h-[700px] sm:px-5 sm:pb-24">
              <div className="grid w-full items-end gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div key={hero?.id ?? "empty"} className={`max-w-2xl ${hero ? "fade-in" : ""}`}>
                  {hero ? (
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-white/80">
                      <span className="rounded-full border border-gold-400/40 bg-gold-400/10 px-3 py-1 text-gold-200">Trending this week</span>
                      {hero.vote_average ? (
                        <span className="inline-flex items-center gap-1 text-gold-200">
                          <Star size={12} fill="currentColor" /> {hero.vote_average.toFixed(1)}
                        </span>
                      ) : null}
                      {yearOf(hero) ? <span className="text-white/60">{yearOf(hero)}</span> : null}
                    </div>
                  ) : null}

                  {hero ? (
                    <h1 className="text-balance text-4xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">{titleOf(hero)}</h1>
                  ) : (
                    <div className="skeleton h-16 w-3/4 rounded-2xl" />
                  )}

                  <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
                    {hero?.overview || (loaded ? "Browse popular movies, shows and anime in one place." : "")}
                  </p>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Link
                      href={hero ? `/watch/movie/${hero.id}` : "/movies"}
                      className="gold-btn inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm"
                    >
                      <Play size={16} fill="currentColor" />
                      Watch now
                    </Link>
                    {hero ? (
                      <button
                        onClick={() => setPreview(hero)}
                        className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-ink/40 px-5 text-sm font-medium text-white backdrop-blur-md transition hover:border-gold-400/60 hover:bg-ink/60"
                      >
                        <Info size={16} />
                        More info
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Up next */}
                {upNext.length ? (
                  <div className="hidden lg:block">
                    <p className="mb-3 text-sm font-medium text-white/60">Up next</p>
                    <div className="space-y-2.5">
                      {upNext.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setHeroIndex(trending.findIndex((t) => t.id === m.id))}
                          className="glass group flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:border-gold-400/50"
                        >
                          <img src={poster(m.poster_path, "w185")} alt="" className="h-[72px] w-12 shrink-0 rounded-lg object-cover" />
                          <span className="min-w-0">
                            <span className="line-clamp-1 text-sm font-semibold text-white/90">{titleOf(m)}</span>
                            <span className="mt-0.5 block text-xs text-white/45">{yearOf(m)}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Slide markers with progress — each fills, then advances */}
            {trending.length > 1 ? (
              <div className="absolute inset-x-0 bottom-6 sm:bottom-8">
                <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 sm:px-5">
                  <div className="flex flex-1 items-center gap-1.5">
                    {trending.map((m, i) => (
                      <button
                        key={m.id}
                        onClick={() => setHeroIndex(i)}
                        aria-label={`Show ${titleOf(m)}`}
                        aria-current={i === heroIndex}
                        className="group h-6 flex-1 max-w-16 py-2.5"
                      >
                        <span className="hero-progress block h-[3px] overflow-hidden rounded-full bg-white/20 transition group-hover:bg-white/35">
                          {i === heroIndex ? (
                            <span key={`${heroIndex}-p`} onAnimationEnd={reduceMotion ? undefined : next} />
                          ) : i < heroIndex ? (
                            <span style={{ width: "100%", animation: "none" }} />
                          ) : null}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={prev} aria-label="Previous" className="glass grid h-9 w-9 place-items-center rounded-full text-white/75 transition hover:text-gold-200">
                      <ChevronLeft size={17} />
                    </button>
                    <button onClick={next} aria-label="Next" className="glass grid h-9 w-9 place-items-center rounded-full text-white/75 transition hover:text-gold-200">
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Quick genres */}
        <section className="mx-auto max-w-[1280px] px-4 pt-6 sm:px-5">
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {moods.map((m) => (
              <Link
                key={m.label}
                href={m.href}
                className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 transition hover:border-gold-400/60 hover:bg-gold-400/10 hover:text-gold-100"
              >
                {m.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Trending shows shelf */}
        {shows.length ? (
          <ScrollRow title="Trending shows" subtitle="What everyone is binging right now" href="/shows">
            {shows.map((item) => (
              <div key={item.id} className="w-[132px] shrink-0 snap-start sm:w-[168px]">
                <MediaCard item={{ ...item, media_type: "tv" }} />
              </div>
            ))}
          </ScrollRow>
        ) : !loaded ? (
          <div className="mx-auto flex max-w-[1280px] gap-3 overflow-hidden px-4 py-7 sm:px-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[2/3] w-[132px] shrink-0 rounded-2xl sm:w-[168px]" />
            ))}
          </div>
        ) : null}

        <OttSection />

        {/* Banner band — brand moment + account prompt */}
        <section className="mx-auto max-w-[1280px] px-4 py-6 sm:px-5">
          <div
            className="relative overflow-hidden rounded-3xl border border-gold-400/20"
            style={{ backgroundImage: "url(/brand/banner.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/55 to-transparent" />
            <div className="relative flex flex-col items-start gap-5 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <div className="max-w-lg">
                <h2 className="text-2xl font-semibold sm:text-3xl">Pick up where you left off</h2>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Save favorites, build a watch-later list and resume any movie or episode on any device.
                </p>
              </div>
              <Link href={user ? "/library" : "/login"} className="gold-btn inline-flex h-12 shrink-0 items-center gap-2 rounded-xl px-6 text-sm">
                {user ? "Open your library" : "Sign in to start"}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Discover grid */}
        <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-5">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="section-title">Find your next watch</h2>
              <p className="mt-1 text-sm text-white/45">Popular movies picked from across genres</p>
            </div>
            <Link href="/movies" className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/75 transition hover:border-gold-400/50 hover:text-gold-100">
              Browse all movies
              <ArrowRight size={15} />
            </Link>
          </div>

          {discover.length ? (
            <MediaGrid items={discover} limit={50} />
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton aspect-[2/3] rounded-2xl" />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
      {preview ? <MediaPreviewModal item={preview} type={mediaType(preview)} onClose={() => setPreview(null)} /> : null}
    </div>
  );
}
