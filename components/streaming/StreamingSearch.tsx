"use client";

import Link from "next/link";
import { Search, X, Film, Tv, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "./types";
import { posterUrl } from "./types";

function titleOf(item: MediaItem) { return item.title || item.name || "Untitled"; }
function typeOf(item: MediaItem) { return item.first_air_date && !item.release_date ? "tv" : (item as any).media_type === "tv" ? "tv" : "movie"; }
function yearOf(item: MediaItem) { return (item.release_date || item.first_air_date || "").slice(0, 4); }

export default function StreamingSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 40); }, [open]);
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/streaming?action=search&query=${encodeURIComponent(q)}`);
        const data = await r.json();
        setResults((data.results || []).filter((x: any) => x.poster_path || x.backdrop_path).slice(0, 30));
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 260);
    return () => clearTimeout(timer);
  }, [query, open]);

  if (!open) return null;
  const featured = results[0];
  const rest = results.slice(1);
  const featuredType = featured ? typeOf(featured) : "movie";

  return (
    <div className="stream-search-overlay">
      <div className="stream-search-shell">
        <div className="stream-search-bar">
          <Search size={20} />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search movies, shows and anime..." />
          <button onClick={onClose} aria-label="Close search"><X size={20} /></button>
        </div>
        <div className="stream-search-results">
          {!query.trim() ? <div className="stream-search-empty">Search across movies, TV shows and anime.</div> : loading ? <div className="stream-search-empty">Searching...</div> : !featured ? <div className="stream-search-empty">No results found.</div> : <>
            <Link onClick={onClose} href={featuredType === "tv" ? `/shows/${featured.id}` : `/movies/${featured.id}`} className="stream-search-featured">
              {featured.backdrop_path && <img src={posterUrl(featured.backdrop_path, "w1280")} alt="" />}
              <div className="stream-search-featured-shade" />
              <div className="stream-search-featured-info">
                <div className="stream-search-meta">{featuredType === "tv" ? <Tv size={13} /> : <Film size={13} />} {featuredType === "tv" ? "TV Show" : "Movie"} · {yearOf(featured)} {featured.vote_average ? <>· <Star size={12} fill="currentColor" /> {featured.vote_average.toFixed(1)}</> : null}</div>
                <h2>{titleOf(featured)}</h2>
                <p>{featured.overview || "No description available."}</p>
              </div>
            </Link>
            <div className="stream-search-more">
              {rest.map(item => { const type = typeOf(item); return <Link onClick={onClose} key={`${type}-${item.id}`} href={type === "tv" ? `/shows/${item.id}` : `/movies/${item.id}`}>
                <div className="stream-search-poster">{item.poster_path && <img src={posterUrl(item.poster_path)} alt={titleOf(item)} />}</div>
                <div>{titleOf(item)}</div><span>{yearOf(item)}</span>
              </Link>; })}
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}
