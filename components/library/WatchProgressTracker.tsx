"use client";

import { useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

type ServerOption = "server1" | "server2";

type PlayerEvent = {
  event?: string;
  currentTime?: number;
  timestamp?: number;
  duration?: number;
  progress?: number;
  id?: string | number;
  mediaType?: "movie" | "tv";
  season?: number;
  episode?: number;
};

function parseMessage(raw: unknown): PlayerEvent | null {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!parsed || typeof parsed !== "object") return null;

    const message = parsed as {
      type?: string;
      data?: unknown;
      event?: string;
      currentTime?: number;
      timestamp?: number;
    };

    if (message.type === "PLAYER_EVENT" && message.data) {
      return message.data as PlayerEvent;
    }

    if (message.event && (message.currentTime !== undefined || message.timestamp !== undefined)) {
      return parsed as PlayerEvent;
    }
  } catch {
    // Ignore unrelated messages.
  }

  return null;
}

function findProgressValue(value: unknown, depth = 0): { current: number; duration: number | null; percent: number | null } | null {
  if (depth > 5 || value == null) return null;

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const currentKeys = ["currentTime", "current_time", "position", "position_seconds", "watchedSeconds", "watched_seconds", "progress_seconds"];
    const durationKeys = ["duration", "durationSeconds", "duration_seconds", "totalDuration", "total_duration"];
    const percentKeys = ["progress", "progress_percent", "percent", "percentage"];

    const current = currentKeys.map((key) => Number(obj[key])).find(Number.isFinite);
    const duration = durationKeys.map((key) => Number(obj[key])).find((n) => Number.isFinite(n) && n > 0);
    const rawPercent = percentKeys.map((key) => Number(obj[key])).find(Number.isFinite);

    if (current !== undefined) {
      return {
        current: Math.max(0, current),
        duration: duration ?? null,
        percent: rawPercent !== undefined ? Math.min(100, Math.max(0, rawPercent <= 1 ? rawPercent * 100 : rawPercent)) : null,
      };
    }

    for (const child of Object.values(obj)) {
      const result = findProgressValue(child, depth + 1);
      if (result) return result;
    }
  }

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
  server,
  iframeOrigin,
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
  server: ServerOption;
  iframeOrigin: string;
}) {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const lastSave = useRef(0);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;

    async function save(current: number, duration: number | null, explicitPercent?: number | null, force = false) {
      if (!Number.isFinite(current) || current < 0) return;
      if (!force && Date.now() - lastSave.current < 10000) return;
      lastSave.current = Date.now();

      const percent = duration
        ? Math.min(100, Math.max(0, (current / duration) * 100))
        : explicitPercent ?? 0;

      const row = {
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
      };

      await supabase.from("watch_progress").upsert(
        { ...row, updated_at: new Date().toISOString() },
        { onConflict: "user_id,media_type,media_id,season_number,episode_number" },
      );

      await supabase.from("watch_history").upsert(
        { ...row, watched_at: new Date().toISOString() },
        { onConflict: "user_id,media_type,media_id,season_number,episode_number" },
      );
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== iframeOrigin) return;

      if (server === "server1") {
        const data = parseMessage(event.data);
        if (!data) return;

        if (data.id != null && Number(data.id) !== mediaId) return;
        if (data.mediaType && data.mediaType !== mediaType) return;
        if (mediaType === "tv" && data.season != null && Number(data.season) !== seasonNumber) return;
        if (mediaType === "tv" && data.episode != null && Number(data.episode) !== episodeNumber) return;

        const current = Number(data.currentTime ?? data.timestamp ?? 0);
        const duration = Number(data.duration ?? 0) || null;
        void save(current, duration, Number(data.progress ?? 0), data.event === "ended" || data.event === "pause" || data.event === "seeked");
        return;
      }

      const message = event.data as { type?: string; watchHistory?: unknown } | null;
      if (message?.type !== "SCREENSCAPE_WATCH_HISTORY_WITH_PROGRESS_RESPONSE") return;

      const progress = findProgressValue(message.watchHistory);
      if (!progress) return;

      void save(progress.current, progress.duration, progress.percent, true);
    }

    window.addEventListener("message", onMessage);

    const iframe = document.getElementById("screenscape-player") as HTMLIFrameElement | null;
    if (server === "server2" && iframe) {
      const requestHistory = () => {
        iframe.contentWindow?.postMessage(
          {
            type: "SCREENSCAPE_GET_WATCH_HISTORY_WITH_PROGRESS",
            requestId: `history-${mediaType}-${mediaId}-${seasonNumber ?? 0}-${episodeNumber ?? 0}`,
          },
          "https://screenscape.me",
        );
      };

      iframe.addEventListener("load", requestHistory);
      requestHistory();

      return () => {
        iframe.removeEventListener("load", requestHistory);
        window.removeEventListener("message", onMessage);
      };
    }

    return () => window.removeEventListener("message", onMessage);
  }, [user, supabase, mediaType, mediaId, title, posterPath, backdropPath, releaseDate, voteAverage, seasonNumber, episodeNumber, episodeName, server, iframeOrigin]);

  return null;
}
