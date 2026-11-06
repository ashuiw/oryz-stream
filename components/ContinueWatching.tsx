"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play } from "@/components/ui/icons";
import ScrollRow from "./ScrollRow";
import { useAuth } from "./auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { backdrop } from "@/lib/tmdb";

type Row = {
  media_type: "movie" | "tv";
  media_id: number;
  season_number: number | null;
  episode_number: number | null;
  episode_name: string | null;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  progress_percent: number | null;
};

/** Resume shelf for signed-in viewers. Renders nothing when there is nothing to resume. */
export default function ContinueWatching() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!user) {
      setRows([]);
      return;
    }
    let cancelled = false;
    const userId = user.id;

    async function load() {
      const { data, error } = await createClient()
        .from("watch_progress")
        .select("media_type,media_id,season_number,episode_number,episode_name,title,poster_path,backdrop_path,progress_percent")
        .eq("user_id", userId)
        .lt("progress_percent", 95)
        .gt("position_seconds", 5)
        .order("updated_at", { ascending: false })
        .limit(12);
      if (!cancelled && !error) setRows((data || []) as Row[]);
    }

    load().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!rows.length) return null;

  return (
    <ScrollRow title="Continue watching" subtitle="Pick up right where you stopped" href="/library" hrefLabel="Library">
      {rows.map((r) => {
        const href =
          r.media_type === "tv"
            ? `/watch/tv/${r.media_id}/${r.season_number || 1}/${r.episode_number || 1}`
            : `/watch/movie/${r.media_id}`;
        const pct = Math.min(100, Math.round(r.progress_percent || 0));
        return (
          <Link key={`${r.media_type}-${r.media_id}-${r.season_number}-${r.episode_number}`} href={href} className="poster-card group w-[260px] shrink-0 snap-start sm:w-[300px]">
            <div className="poster-frame relative aspect-video overflow-hidden rounded-[4px] border border-white/10 bg-surface">
              <img src={backdrop(r.backdrop_path || r.poster_path, "w780")} alt="" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-full bg-gold-500 text-ink"><Play size={15} /></span>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20"><div className="h-full bg-gold-500" style={{ width: `${pct}%` }} /></div>
            </div>
            <h3 className="mt-2.5 line-clamp-1 text-[15px] font-semibold">{r.title}</h3>
            <p className="mt-0.5 text-xs text-white/50">
              {r.media_type === "tv" ? `Season ${r.season_number || 1}, episode ${r.episode_number || 1}` : "Movie"} · {pct}% watched
            </p>
          </Link>
        );
      })}
    </ScrollRow>
  );
}
