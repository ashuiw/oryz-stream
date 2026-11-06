"use client";

import { useEffect, useState } from "react";
import { Bookmark, Heart, LogIn } from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Media } from "@/lib/tmdb";
import { mediaType, poster, titleOf, yearOf } from "@/lib/tmdb";
import { useToast } from "@/components/ui/Toast";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

type Row = { liked: boolean; watch_later: boolean };

export default function LibraryActions({ item, type: forcedType, compact = false }: { item: Media; type?: "movie" | "tv"; compact?: boolean }) {
  const { user } = useAuth();
  const toast = useToast();
  const supabase = createClient();
  const type = forcedType || mediaType(item);
  const [row, setRow] = useState<Row>({ liked: false, watch_later: false });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!user) { setRow({ liked: false, watch_later: false }); return; }
    supabase.from("media_library").select("liked,watch_later").eq("user_id", user.id).eq("media_type", type).eq("media_id", item.id).maybeSingle().then(({ data }: { data: Row | null }) => {
      if (data) setRow({ liked: !!data.liked, watch_later: !!data.watch_later });
    });
  }, [user, item.id, type]);

  async function toggle(field: "liked" | "watch_later") {
    if (!user) { setNotice("Sign in to save this title."); return; }
    setBusy(true);
    const next = !row[field];
    const payload = {
      user_id: user.id,
      media_type: type,
      media_id: item.id,
      title: titleOf(item),
      poster_path: item.poster_path ?? null,
      backdrop_path: item.backdrop_path ?? null,
      release_date: item.release_date || item.first_air_date || null,
      vote_average: item.vote_average ?? null,
      [field]: next,
    };
    const { data: savedRow, error } = await supabase
      .from("media_library")
      .upsert(payload, { onConflict: "user_id,media_type,media_id" })
      .select("liked,watch_later")
      .single();
    if (error) {
      toast.error(field === "liked" ? "Could not update your likes. Please try again." : "Could not update your watch-later list. Please try again.");
    } else if (savedRow) {
      setRow({ liked: !!savedRow.liked, watch_later: !!savedRow.watch_later });
      const title = titleOf(item);
      toast.success(
        field === "liked"
          ? next ? `Added ${title} to your likes.` : `Removed ${title} from your likes.`
          : next ? `Saved ${title} to watch later.` : `Removed ${title} from watch later.`,
      );
    }
    setBusy(false);
  }

  const base = compact
    ? "inline-flex h-12 items-center justify-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition sm:px-4"
    : "inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition";
  const on = "border-gold-500/60 bg-gold-500/10 text-gold-300";
  const off = "border-white/15 text-white/75 hover:border-white/40 hover:text-white";

  return (
    <div className={compact ? "contents" : ""}>
      <div className={compact ? "contents" : "flex flex-wrap gap-2"}>
        <button disabled={busy} onClick={() => toggle("liked")} aria-pressed={row.liked} aria-label={row.liked ? "Remove from likes" : "Like"} className={`${base} ${row.liked ? on : off}`}>
          <Heart size={18} weight={row.liked ? "fill" : "regular"} />
          <span className={compact ? "hidden sm:inline" : ""}>{row.liked ? "Liked" : "Like"}</span>
        </button>
        <button disabled={busy} onClick={() => toggle("watch_later")} aria-pressed={row.watch_later} aria-label={row.watch_later ? "Remove from watch later" : "Watch later"} className={`${base} ${row.watch_later ? on : off}`}>
          <Bookmark size={18} weight={row.watch_later ? "fill" : "regular"} />
          <span className={compact ? "hidden sm:inline" : ""}>{row.watch_later ? "Saved" : "Watch later"}</span>
        </button>
      </div>
      {notice ? (
        <div className="basis-full rounded-lg border border-white/10 p-3 text-sm text-white/65">
          <div className="mb-3 flex items-center gap-2"><LogIn size={16} />{notice}</div>
          <GoogleSignInButton />
        </div>
      ) : null}
    </div>
  );
}

export function libraryMediaFromRow(row: any): Media {
  return {
    id: row.media_id,
    media_type: row.media_type,
    title: row.media_type === "movie" ? row.title : undefined,
    name: row.media_type === "tv" ? row.title : undefined,
    poster_path: row.poster_path,
    backdrop_path: row.backdrop_path,
    release_date: row.media_type === "movie" ? row.release_date : undefined,
    first_air_date: row.media_type === "tv" ? row.release_date : undefined,
    vote_average: row.vote_average,
  };
}
