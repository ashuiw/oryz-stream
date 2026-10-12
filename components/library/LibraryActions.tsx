"use client";

import { useEffect, useState } from "react";
import { Bookmark, Heart, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Media } from "@/lib/tmdb";
import { mediaType, poster, titleOf, yearOf } from "@/lib/tmdb";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

type Row = { liked: boolean; watch_later: boolean };

export default function LibraryActions({ item, type: forcedType }: { item: Media; type?: "movie" | "tv" }) {
  const { user } = useAuth();
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
    if (error) setNotice(error.message);
    else if (savedRow) {
      setRow({ liked: !!savedRow.liked, watch_later: !!savedRow.watch_later });
    }
    setBusy(false);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button disabled={busy} onClick={() => toggle("liked")} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${row.liked ? "border-red-500/40 bg-red-500/15 text-red-200" : "border-white/10 bg-white/[0.04] text-white/65 hover:text-white"}`}>
          <Heart size={15} fill={row.liked ? "currentColor" : "none"} /> {row.liked ? "Liked" : "Like"}
        </button>
        <button disabled={busy} onClick={() => toggle("watch_later")} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${row.watch_later ? "border-red-500/40 bg-red-500/15 text-red-200" : "border-white/10 bg-white/[0.04] text-white/65 hover:text-white"}`}>
          <Bookmark size={15} fill={row.watch_later ? "currentColor" : "none"} /> {row.watch_later ? "Saved" : "Watch later"}
        </button>
      </div>
      {notice ? <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/55"><div className="mb-2 flex items-center gap-2"><LogIn size={13} />{notice}</div><GoogleSignInButton className="px-3 py-2 text-xs" /></div> : null}
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
