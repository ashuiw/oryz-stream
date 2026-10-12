"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import MediaCard from "./MediaCard";
import type { MediaItem } from "./types";

export default function HorizontalMediaRow({
  items,
  type,
}: {
  items: MediaItem[];
  type: "movie" | "tv";
}) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    ref.current?.scrollBy({
      left: direction === "right" ? 760 : -760,
      behavior: "smooth",
    });
  }

  return (
    <div className="media-carousel">
      <button
        type="button"
        className="media-carousel-arrow media-carousel-arrow-left"
        onClick={() => scroll("left")}
        aria-label="Previous titles"
      >
        <ChevronLeft size={19} strokeWidth={2} />
      </button>

      <div ref={ref} className="media-row media-row-no-wheel">
        {items.map((item) => (
          <MediaCard key={`${type}-${item.id}`} item={item} type={type} />
        ))}
      </div>

      <button
        type="button"
        className="media-carousel-arrow media-carousel-arrow-right"
        onClick={() => scroll("right")}
        aria-label="Next titles"
      >
        <ChevronRight size={19} strokeWidth={2} />
      </button>
    </div>
  );
}
