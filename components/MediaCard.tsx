"use client";

import { useState } from "react";
import { Play, Star } from "@/components/ui/icons";
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
        <div className="poster-frame relative aspect-[2/3] overflow-hidden rounded-[4px] border border-white/10 bg-surface">
          <img src={poster(item.poster_path)} alt="" className="h-full w-full object-cover" loading="lazy" />

          <div className="absolute inset-0 flex items-end bg-ink/0 p-3 opacity-0 transition duration-200 group-hover:bg-ink/55 group-hover:opacity-100 group-focus-visible:bg-ink/55 group-focus-visible:opacity-100">
            <span className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-500 text-ink">
                <Play size={15} />
              </span>
              Details
            </span>
          </div>
        </div>

        <h3 className="mt-2.5 line-clamp-1 text-[15px] font-semibold text-white">{titleOf(item)}</h3>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-white/50">
          <span>{type === "tv" ? "Show" : "Movie"}{yearOf(item) ? ` · ${yearOf(item)}` : ""}</span>
          {item.vote_average ? (
            <span className="inline-flex items-center gap-1 text-gold-400">
              <Star size={11} weight="fill" />
              {item.vote_average.toFixed(1)}
            </span>
          ) : null}
        </p>
      </button>
      {open ? <MediaPreviewModal item={item} type={type} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
