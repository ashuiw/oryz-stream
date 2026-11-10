"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Star, Film, Tv } from "lucide-react";
import { Media, backdrop, mediaType, poster, titleOf, yearOf } from "@/lib/tmdb";
import MediaPreviewModal from "./MediaPreviewModal";

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Media | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/tmdb?type=multi&query=${encodeURIComponent(q)}`);
        const data = await res.json();

        const filtered = (data.results || []).filter(
          (item: Media & { media_type?: string }) =>
            (item.media_type === "movie" || item.media_type === "tv") &&
            item.poster_path
        );

        setResults(filtered);
      } catch (error) {
        console.error(error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, open]);

  const featured = results[0];
  const rest = useMemo(() => results.slice(1, 13), [results]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 px-4 pt-4 backdrop-blur-xl">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#151515] p-3 shadow-2xl">
          <Search className="ml-2 text-white/45" size={20} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies and shows..."
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-base text-white outline-none placeholder:text-white/30"
          />
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl text-white/55 hover:bg-white/10 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mt-5 max-h-[calc(100vh-120px)] overflow-y-auto pb-10">
          {!query.trim() ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-10 text-center text-sm text-white/40">
              Start typing to search instantly.
            </div>
          ) : loading ? (
            <div className="py-16 text-center text-sm text-white/45">Searching...</div>
          ) : !featured ? (
            <div className="py-16 text-center text-sm text-white/45">No results found.</div>
          ) : (
            <>
              <button
                onClick={() => setSelected(featured)}
                className="group relative block min-h-[260px] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#121212] text-left"
              >
                {featured.backdrop_path ? (
                  <img
                    src={backdrop(featured.backdrop_path, "w1280")}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-500 group-hover:scale-[1.02]"
                  />
                ) : null}

                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />

                <div className="relative flex min-h-[260px] max-w-2xl flex-col justify-end p-6 sm:p-8">
                  <div className="mb-2 flex items-center gap-2 text-xs text-white/55">
                    {mediaType(featured) === "tv" ? <Tv size={13} /> : <Film size={13} />}
                    <span>{mediaType(featured) === "tv" ? "TV Show" : "Movie"}</span>
                    <span>•</span>
                    <span>{yearOf(featured) || "—"}</span>
                    {featured.vote_average ? (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-yellow-300">
                          <Star size={12} fill="currentColor" />
                          {featured.vote_average.toFixed(1)}
                        </span>
                      </>
                    ) : null}
                  </div>

                  <h2 className="text-2xl font-bold text-white sm:text-4xl">
                    {titleOf(featured)}
                  </h2>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/60">
                    {featured.overview || "No description available."}
                  </p>
                </div>
              </button>

              {rest.length ? (
                <div className="mt-8">
                  <h3 className="mb-4 text-sm font-semibold text-white">More results</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                    {rest.map((item) => (
                      <button
                        key={`${item.media_type}-${item.id}`}
                        onClick={() => setSelected(item)}
                        className="group w-full text-left"
                      >
                        <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                          <img
                            src={poster(item.poster_path)}
                            alt={titleOf(item)}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                          />
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs font-medium text-white/75">
                          {titleOf(item)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
      {selected ? (
        <MediaPreviewModal
          item={selected}
          type={mediaType(selected)}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
