"use client";

import { useState } from "react";
import { Play, Star } from "lucide-react";
import { Media, mediaType, poster, titleOf, yearOf } from "@/lib/tmdb";
import MediaPreviewModal from "./MediaPreviewModal";

export default function MediaCard({ item }: { item: Media }) {
  const [open, setOpen] = useState(false);
  const type = mediaType(item);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="poster-card group block w-full min-w-0 text-left"
        aria-label={`${titleOf(item)}, ${type === "tv" ? "show" : "movie"}${yearOf(item) ? `, ${yearOf(item)}` : ""}`}
      >
        <div className="poster-frame relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/[0.08] bg-surface">
          <img
            src={poster(item.poster_path)}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />

          {item.vote_average ? (
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-lg bg-ink/80 px-2 py-1 text-[11px] font-semibold text-gold-200 backdrop-blur">
              <Star size={10} fill="currentColor" />
              {item.vote_average.toFixed(1)}
            </span>
          ) : null}

          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            <span className="gold-btn grid h-12 w-12 place-items-center rounded-full">
              <Play size={18} fill="currentColor" className="ml-0.5" />
            </span>
          </div>
        </div>

        <h3 className="mt-2.5 line-clamp-1 text-sm font-semibold text-white/90">{titleOf(item)}</h3>
        <p className="mt-0.5 text-xs text-white/40">
          {type === "tv" ? "Show" : "Movie"}
          {yearOf(item) ? ` · ${yearOf(item)}` : ""}
        </p>
      </button>
      {open ? <MediaPreviewModal item={item} type={type} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
