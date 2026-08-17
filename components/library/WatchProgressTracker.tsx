"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

function parseMessage(raw: unknown) {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw as any;
    if (parsed?.type === "PLAYER_EVENT" && parsed.data) return parsed.data;
    if (parsed?.event && (parsed.currentTime !== undefined || parsed.timestamp !== undefined)) return parsed;
  } catch {}
  return null;
}

export default function WatchProgressTracker({
  mediaType,
  mediaId,
  title,
  posterPath,
  backdropPath,
  releaseDate,
  voteAverage,
  seasonNumber,
  episodeNumber,
  episodeName,
}: {
  mediaType: "movie" | "tv";
  mediaId: number;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  voteAverage?: number | null;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  episodeName?: string | null;
}) {
  const { user } = useAuth();
  const supabase = createClient();
  const lastSave = useRef(0);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    async function save(eventData: any, force = false) {
      const current = Number(eventData?.currentTime ?? eventData?.timestamp ?? 0);
      const duration = Number(eventData?.duration ?? 0) || null;
      if (!Number.isFinite(current) || current < 0) return;
      const percent = duration ? Math.min(100, (current / duration) * 100) : Number(eventData?.progress || 0);
      if (!force && Date.now() - lastSave.current < 10000) return;
      lastSave.current = Date.now();

      await supabase.from("watch_progress").upsert({
        user_id: userId,
        media_type: mediaType,
        media_id: mediaId,
        title,
        poster_path: posterPath ?? null,
        backdrop_path: backdropPath ?? null,
        release_date: releaseDate ?? null,
        vote_average: voteAverage ?? null,
        season_number: seasonNumber ?? 0,
        episode_number: episodeNumber ?? 0,
        episode_name: episodeName ?? null,
        position_seconds: current,
        duration_seconds: duration,
        progress_percent: percent,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,media_type,media_id,season_number,episode_number" });

      await supabase.from("watch_history").upsert({
        user_id: userId,
        media_type: mediaType,
        media_id: mediaId,
        title,
        poster_path: posterPath ?? null,
        backdrop_path: backdropPath ?? null,
        release_date: releaseDate ?? null,
        vote_average: voteAverage ?? null,
        season_number: seasonNumber ?? 0,
        episode_number: episodeNumber ?? 0,
        episode_name: episodeName ?? null,
        position_seconds: current,
        duration_seconds: duration,
        progress_percent: percent,
        watched_at: new Date().toISOString(),
      }, { onConflict: "user_id,media_type,media_id,season_number,episode_number" });
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== "https://www.vidking.net") return;
      const data = parseMessage(event.data);
      if (!data) return;
      if (data.id && Number(data.id) !== mediaId) return;
      if (data.mediaType && data.mediaType !== mediaType) return;
      if (mediaType === "tv" && data.season != null && Number(data.season) !== seasonNumber) return;
      if (mediaType === "tv" && data.episode != null && Number(data.episode) !== episodeNumber) return;
      save(data, data.event === "ended" || data.event === "pause" || data.event === "seeked");
    }

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [user, mediaType, mediaId, title, posterPath, backdropPath, releaseDate, voteAverage, seasonNumber, episodeNumber, episodeName]);

  return null;
}
