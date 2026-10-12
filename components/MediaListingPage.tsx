"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  const [genre, setGenre] = useState("");
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

      try {
        const res = await fetch(`/api/tmdb?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();

        setItems(data.results || []);
        setTotalPages(Math.min(data.total_pages || 1, 500));
      } catch (error) {
        if ((error as Error).name !== "AbortError") console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [kind, genre, page]);

  const visibleGenres = useMemo(() => genres, [genres]);

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
          <div className="oryz-section-kicker">Oryz / Discover</div>
          <h1 className="oryz-section-title">{title}</h1>
          <p className="oryz-section-description">{subtitle}</p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-2">
              <div className="mb-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                Genres
              </div>

              <div className="grid max-h-[65vh] gap-1 overflow-y-auto pr-1">
                {visibleGenres.map(([label, value]) => (
                  <button
                    key={`${label}-${value}`}
                    onClick={() => selectGenre(value)}
                    className={`rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      genre === value
                        ? "bg-white/15 font-medium text-white"
                        : "text-white/50 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm text-white/35">
                {loading ? "Loading..." : `${items.length} titles`}
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft size={17} />
                </button>
                <span className="min-w-16 text-center text-xs text-white/40">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60 disabled:cursor-not-allowed disabled:opacity-30"
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
                    className="aspect-[2/3] animate-pulse rounded-2xl bg-white/[0.05]"
                  />
                ))}
              </div>
            ) : items.length ? (
              <MediaGrid items={items} />
            ) : (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-12 text-center text-sm text-white/40">
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
