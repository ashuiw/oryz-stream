"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Dice, Info, Play, Star } from "@/components/ui/icons";
import { useSearchParams } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import OttSection from "./OttSection";
import MediaGrid from "./MediaGrid";
import MediaCard from "./MediaCard";
import ScrollRow from "./ScrollRow";
import ContinueWatching from "./ContinueWatching";
import SearchOverlay from "./SearchOverlay";
import MediaPreviewModal from "./MediaPreviewModal";
import { useAuth } from "./auth/AuthProvider";
import { Media, backdrop, mediaType, poster, titleOf, yearOf } from "@/lib/tmdb";

const pad = (n: number) => String(n).padStart(2, "0");

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
  const [top10, setTop10] = useState<Media[]>([]);
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
      setTop10((heroData.results || []).filter((x: Media) => x.poster_path).slice(0, 10).map((x: Media) => ({ ...x, media_type: "movie" as const })));
      setDiscover((discoverData.results || []).slice(0, 50));
      setShows((showsData.results || []).slice(0, 16));
    }

    load().catch(console.error).finally(() => setLoaded(true));
  }, []);

  const hero = trending[heroIndex];
  const next = () => setHeroIndex((i) => (i + 1) % Math.max(trending.length, 1));
  const prev = () => setHeroIndex((i) => (i - 1 + trending.length) % Math.max(trending.length, 1));
  const upNext = trending.length > 1 ? [1, 2, 3].map((n) => trending[(heroIndex + n) % trending.length]) : [];

  // Pick something at random from everything already loaded on the page.
  function surprise() {
    const pool = [...top10, ...discover, ...shows.map((x) => ({ ...x, media_type: "tv" as const }))];
    if (pool.length) setPreview(pool[Math.floor(Math.random() * pool.length)]);
  }

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
          className={`relative -mt-16 overflow-hidden ${paused ? "hero-paused" : ""}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          aria-roledescription="carousel"
          aria-label="Trending movies"
        >
          <div className="relative min-h-[600px] pt-16 sm:min-h-[680px]">
            {trending.map((m, i) => (
              <img
                key={m.id}
                src={backdrop(m.backdrop_path, "original")}
                alt=""
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === heroIndex ? "opacity-100" : "opacity-0"}`}
                loading={i === 0 ? "eager" : "lazy"}
              />
            ))}

            <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/55 to-ink/0" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/0 to-ink/0" />

            <div className="relative mx-auto flex min-h-[600px] max-w-[1280px] items-end px-4 pb-24 sm:min-h-[680px] sm:px-5 sm:pb-20">
              <div className="grid w-full items-end gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div key={hero?.id ?? "empty"} className={`max-w-3xl ${hero ? "fade-in" : ""}`}>
                  {hero ? (
                    <p className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-white/80">
                      <span className="text-gold-400">#{heroIndex + 1} trending</span>
                      <span className="text-white/30">|</span>
                      <span>Movie</span>
                      {yearOf(hero) ? <><span className="text-white/30">|</span><span>{yearOf(hero)}</span></> : null}
                      {hero.vote_average ? (
                        <>
                          <span className="text-white/30">|</span>
                          <span className="inline-flex items-center gap-1"><Star size={13} weight="fill" className="text-gold-400" />{hero.vote_average.toFixed(1)}</span>
                        </>
                      ) : null}
                    </p>
                  ) : null}

                  {hero ? (
                    <h1 className="text-balance text-[clamp(3.2rem,11vw,8.5rem)]">{titleOf(hero)}</h1>
                  ) : (
                    <div className="skeleton h-24 w-3/4 rounded-md" />
                  )}

                  <p className="mt-5 line-clamp-3 max-w-xl text-[15px] leading-7 text-white/75">
                    {hero?.overview || (loaded ? "Browse popular movies, shows and anime in one place." : "")}
                  </p>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Link href={hero ? `/watch/movie/${hero.id}` : "/movies"} className="gold-btn inline-flex h-12 items-center gap-2.5 px-6 text-[15px]">
                      <Play size={18} />
                      Watch now
                    </Link>
                    {hero ? (
                      <button onClick={() => setPreview(hero)} className="ghost-btn inline-flex h-12 items-center gap-2.5 px-5 text-[15px]">
                        <Info size={19} weight="duotone" />
                        Details
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Up next */}
                {upNext.length ? (
                  <div className="hidden lg:block">
                    <p className="mb-2 text-sm font-semibold text-white/60">Up next</p>
                    <ul className="border-t border-white/15">
                      {upNext.map((m) => (
                        <li key={m.id} className="border-b border-white/15">
                          <button
                            onClick={() => setHeroIndex(trending.findIndex((t) => t.id === m.id))}
                            className="group flex w-full items-center gap-3 py-3 text-left"
                          >
                            <img src={poster(m.poster_path, "w185")} alt="" className="h-[66px] w-11 shrink-0 rounded-[3px] object-cover" />
                            <span className="min-w-0 flex-1">
                              <span className="line-clamp-1 text-sm font-semibold text-white transition-colors group-hover:text-gold-400">{titleOf(m)}</span>
                              <span className="mt-0.5 block text-xs text-white/50">{yearOf(m)}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Slide markers: numbered because the slides are a sequence */}
            {trending.length > 1 ? (
              <div className="absolute inset-x-0 bottom-5 sm:bottom-7">
                <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 sm:px-5">
                  <span className="w-14 shrink-0 text-sm font-bold tabular-nums text-white">
                    {pad(heroIndex + 1)}<span className="text-white/40"> / {pad(trending.length)}</span>
                  </span>
                  <div className="flex flex-1 items-center gap-1.5">
                    {trending.map((m, i) => (
                      <button
                        key={m.id}
                        onClick={() => setHeroIndex(i)}
                        aria-label={`Show ${titleOf(m)}`}
                        aria-current={i === heroIndex}
                        className="group h-6 max-w-20 flex-1 py-2.5"
                      >
                        <span className="hero-progress block h-[3px] overflow-hidden bg-white/25 transition group-hover:bg-white/45">
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
                    <button onClick={prev} aria-label="Previous" className="grid h-9 w-9 place-items-center rounded-md border border-white/25 text-white/80 transition hover:border-gold-500 hover:text-gold-300">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={next} aria-label="Next" className="grid h-9 w-9 place-items-center rounded-md border border-white/25 text-white/80 transition hover:border-gold-500 hover:text-gold-300">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Genre strip + Surprise me */}
        <section className="mx-auto max-w-[1280px] px-4 pt-5 sm:px-5">
          <div className="flex items-center gap-4 border-b border-white/10 pb-3">
            <div className="scrollbar-none -mx-4 flex flex-1 gap-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              {moods.map((m) => (
                <Link key={m.label} href={m.href} className="shrink-0 py-1 text-sm font-semibold text-white/60 transition hover:text-gold-400">
                  {m.label}
                </Link>
              ))}
            </div>
            <button onClick={surprise} className="ghost-btn hidden h-10 shrink-0 items-center gap-2 px-4 text-sm sm:inline-flex">
              <Dice size={19} weight="duotone" />
              Surprise me
            </button>
          </div>
          <button onClick={surprise} className="ghost-btn mt-3 inline-flex h-10 items-center gap-2 px-4 text-sm sm:hidden">
            <Dice size={19} weight="duotone" />
            Surprise me
          </button>
        </section>

        <ContinueWatching />

        {/* Top 10 */}
        {top10.length ? (
          <ScrollRow title="Top 10 movies this week" subtitle="Ranked by what people are watching" href="/movies">
            {top10.map((item, i) => (
              <div key={item.id} className="flex shrink-0 snap-start items-end">
                <span className="rank-num -mr-3 text-[7.5rem] sm:text-[9rem]">{i + 1}</span>
                <div className="w-[130px] sm:w-[160px]">
                  <MediaCard item={item} />
                </div>
              </div>
            ))}
          </ScrollRow>
        ) : null}

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
              <div key={i} className="skeleton aspect-[2/3] w-[132px] shrink-0 rounded-[4px] sm:w-[168px]" />
            ))}
          </div>
        ) : null}

        <OttSection />

        {/* Banner band */}
        <section className="mx-auto max-w-[1280px] px-4 py-6 sm:px-5">
          <div
            className="relative overflow-hidden rounded-md border border-white/10"
            style={{ backgroundImage: "url(/brand/banner.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/60 to-transparent" />
            <div className="relative flex flex-col items-start gap-5 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <div className="max-w-lg">
                <h2 className="text-4xl sm:text-5xl">Pick up where you left off</h2>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Save favorites, build a watch-later list and resume any movie or episode on any device.
                </p>
              </div>
              <Link href={user ? "/library" : "/login"} className="gold-btn inline-flex h-12 shrink-0 items-center gap-2.5 px-6 text-[15px]">
                {user ? "Open your library" : "Sign in to start"}
                <ArrowRight size={17} weight="bold" />
              </Link>
            </div>
          </div>
        </section>

        {/* Discover grid */}
        <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-5">
          <div className="section-head mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="section-title">Find your next watch</h2>
              <p className="mt-1.5 text-sm text-white/50">Popular movies picked from across genres</p>
            </div>
            <Link href="/movies" className="inline-flex shrink-0 items-center gap-1.5 py-1.5 text-sm font-semibold text-gold-400 transition hover:text-gold-200">
              Browse all
              <ArrowRight size={15} weight="bold" />
            </Link>
          </div>

          {discover.length ? (
            <MediaGrid items={discover} limit={50} />
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton aspect-[2/3] rounded-[4px]" />
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
