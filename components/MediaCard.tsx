"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Media, mediaType, poster, titleOf, yearOf } from "@/lib/tmdb";
import MediaPreviewModal from "./MediaPreviewModal";

export default function MediaCard({ item }: { item: Media }) {
  const [open, setOpen] = useState(false);
  const type = mediaType(item);

  return (
    <>
      <button onClick={() => setOpen(true)} className="group block min-w-0 w-full text-left">
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
          <img src={poster(item.poster_path)} alt={titleOf(item)} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]" loading="lazy" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black via-black/65 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-white">{titleOf(item)}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/55">
              <span>{yearOf(item) || "—"}</span>
              {item.vote_average ? <span className="flex items-center gap-1 text-yellow-300"><Star size={11} fill="currentColor" />{item.vote_average.toFixed(1)}</span> : null}
            </div>
          </div>
        </div>
      </button>
      {open ? <MediaPreviewModal item={item} type={type} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
