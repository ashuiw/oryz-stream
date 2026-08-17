import { Media } from "@/lib/tmdb";
import MediaCard from "./MediaCard";

export default function MediaGrid({
  items,
  limit,
}: {
  items: Media[];
  limit?: number;
}) {
  const visible = limit ? items.slice(0, limit) : items;

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {visible.map((item) => (
        <MediaCard key={`${item.media_type || "media"}-${item.id}`} item={item} />
      ))}
    </div>
  );
}
