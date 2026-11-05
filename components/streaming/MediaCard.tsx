"use client";

import { useState } from "react";
import type { MediaItem } from "./types";
import { posterUrl } from "./types";
import MediaPreviewModal from "../MediaPreviewModal";
import type { Media } from "@/lib/tmdb";

export default function MediaCard({ item, type }: { item: MediaItem; type: "movie" | "tv" }) {
  const [open, setOpen] = useState(false);
  const title = item.title ?? item.name ?? "Untitled";
  const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
  const media: Media = { ...item, media_type: type };

  return (
    <>
      <button onClick={() => setOpen(true)} className="stream-card w-full text-left">
        <div className="stream-card-poster">
          {item.poster_path ? <img src={posterUrl(item.poster_path)} alt={title} loading="lazy" /> : <div className="stream-card-empty">No image</div>}
          <div className="stream-card-gradient" />
          <div className="stream-card-meta"><strong>{title}</strong><span>{year || "—"}{item.vote_average ? ` · ★ ${item.vote_average.toFixed(1)}` : ""}</span></div>
        </div>
      </button>
      {open ? <MediaPreviewModal item={media} type={type} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
