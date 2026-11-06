"use client";

import { useToast } from "@/components/ui/Toast";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MediaGrid from "./MediaGrid";
import { Media } from "@/lib/tmdb";
import StreamingStyles from "./streaming/StreamingStyles";

const movieGenres = [
  ["All", ""], ["Action & Adventure", "28"], ["Animation", "16"], ["Comedy", "35"],
  ["Crime", "80"], ["Documentary", "99"], ["Drama", "18"], ["Family", "10751"],
  ["Fantasy", "14"], ["Horror", "27"], ["Mystery", "9648"], ["Romance", "10749"],
  ["Sci-Fi", "878"], ["Thriller", "53"],
];

const tvGenres = [
  ["All", ""], ["Action & Adventure", "10759"], ["Animation", "16"], ["Comedy", "35"],
  ["Crime", "80"], ["Documentary", "99"], ["Drama", "18"], ["Family", "10751"],
  ["Kids", "10762"], ["Mystery", "9648"], ["Sci-Fi & Fantasy", "10765"],
  ["War & Politics", "10768"],
];

const animeGenres = [
  ["All Anime", ""], ["Action", "28"], ["Adventure", "12"], ["Comedy", "35"],
  ["Drama", "18"], ["Fantasy", "14"], ["Horror", "27"], ["Romance", "10749"],
  ["Sci-Fi", "878"], ["Mystery", "9648"],
];

export default function MediaListingPage({
  kind,
}: {
  kind: "movie" | "tv" | "anime";
}) {
  const isAnime = kind === "anime";
  const isMovie = kind === "movie";
  const title = isAnime ? "Anime" : isMovie ? "All Movies" : "All Shows";
  const subtitle = isAnime
    ? "Japanese animated movies and series."
    : isMovie
      ? "A broad wall of movies worth browsing."
      : "A broad wall of shows worth browsing.";

  const genres = isAnime ? animeGenres : isMovie ? movieGenres : tvGenres;

  const toast = useToast();
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState<"popular" | "rating" | "newest">("popular");
  const [items, setItems] = useState<Media[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);

      const params = new URLSearchParams({
        type: kind,
        page: String(page),
      });

      if (genre) params.set("genre", genre);
      if (sort !== "popular" && !isAnime) params.set("sort", sort);

      try {
        const res = await fetch(`/api/tmdb?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Request failed");

        setItems(data.results || []);
        setTotalPages(Math.min(data.total_pages || 1, 500));
      } catch (error) {
        if ((error as Error).name !== "AbortError") toast.error("Could not load titles. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [kind, genre, page, sort, isAnime]);

  const visibleGenres = useMemo(() => genres, [genres]);

  // Deep links such as /movies?genre=28 (used by the home page quick genres)
  useEffect(() => {
    const g = new URLSearchParams(window.location.search).get("genre");
    if (g && genres.some(([, value]) => value === g)) setGenre(g);
  }, [genres]);

  function selectGenre(value: string) {
    setGenre(value);
    setPage(1);
  }

  return (
    <div className="oryz-section-page">
      <StreamingStyles />
      <Navbar />


      <main className="oryz-section-shell">
        <section className="oryz-section-hero mb-9">
          <div className="oryz-section-kicker">Discover</div>
          <h1 className="oryz-section-title">{title}</h1>
          <p className="oryz-section-description">{subtitle}</p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="lg:rounded-lg lg:border lg:border-white/10 lg:bg-white/[0.025] lg:p-2">
              <div className="mb-2 hidden px-3 py-2 text-sm font-semibold text-gold-200 lg:block">
                Genres
              </div>

              <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5 lg:mx-0 lg:grid lg:max-h-[65vh] lg:gap-1 lg:overflow-y-auto lg:px-0 lg:pb-0 lg:pr-1">
                {visibleGenres.map(([label, value]) => (
                  <button
                    key={`${label}-${value}`}
                    onClick={() => selectGenre(value)}
                    aria-pressed={genre === value}
                    className={`shrink-0 whitespace-nowrap rounded-md border px-3.5 py-2 text-left text-sm transition lg:border-transparent lg:py-2.5 ${
                      genre === value
                        ? "border-gold-500 bg-gold-500/15 font-semibold text-gold-100"
                        : "border-white/15 text-white/60 hover:text-white lg:hover:bg-white/[0.05]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              {!isAnime ? (
                <div role="tablist" aria-label="Sort titles" className="flex gap-5 border-b border-white/10">
                  {([["popular", "Popular"], ["rating", "Top rated"], ["newest", "Newest"]] as const).map(([value, label]) => (
                    <button
                      key={value}
                      role="tab"
                      aria-selected={sort === value}
                      onClick={() => { setSort(value); setPage(1); }}
                      className={`relative -mb-px border-b-[3px] py-2.5 text-sm font-semibold transition-colors ${
                        sort === value ? "border-gold-500 text-white" : "border-transparent text-white/50 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/45">{loading ? "Loading…" : `${items.length} titles`}</p>
              )}

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-white/[0.03] text-white/60 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft size={17} />
                </button>
                <span className="min-w-16 text-center text-xs text-white/40">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                  className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-white/[0.03] text-white/60 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[2/3] skeleton rounded-lg"
                  />
                ))}
              </div>
            ) : items.length ? (
              <MediaGrid items={items} />
            ) : (
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-12 text-center text-sm text-white/40">
                Nothing found for this filter.
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
