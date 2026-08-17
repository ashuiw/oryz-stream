"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import WatchProgressTracker from "./WatchProgressTracker";

export default function VidKingWatchFrame({
  mediaType,
  mediaId,
  title,
  posterPath,
  backdropPath,
  releaseDate,
  voteAverage,
  season,
  episode,
  episodeName,
}: {
  mediaType: "movie" | "tv";
  mediaId: number;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  voteAverage?: number | null;
  season?: number;
  episode?: number;
  episodeName?: string | null;
}) {
  const { user } = useAuth();
  const supabase = createClient();
  const [resume, setResume] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { setResume(null); return; }
    supabase.from("watch_progress").select("position_seconds,progress_percent").eq("user_id", user.id).eq("media_type", mediaType).eq("media_id", mediaId).eq("season_number", mediaType === "tv" ? season ?? 0 : 0).eq("episode_number", mediaType === "tv" ? episode ?? 0 : 0).maybeSingle().then(({ data }: { data: { position_seconds: number | null; progress_percent: number | null } | null }) => {
      if (data && Number(data.progress_percent || 0) < 95 && Number(data.position_seconds || 0) > 5) setResume(Math.floor(Number(data.position_seconds)));
    });
  }, [user, mediaType, mediaId, season, episode]);

  const base = mediaType === "movie"
    ? `https://www.vidking.net/embed/movie/${mediaId}`
    : `https://www.vidking.net/embed/tv/${mediaId}/${season || 1}/${episode || 1}`;
  const params = new URLSearchParams({ color: "ff0000", autoPlay: "true" });
  if (resume) params.set("progress", String(resume));
  if (mediaType === "tv") {
    params.set("nextEpisode", "true");
    params.set("episodeSelector", "true");
  }

  return <>
    <iframe src={`${base}?${params.toString()}`} className="h-full w-full border-0" allowFullScreen allow="autoplay; fullscreen; picture-in-picture" title={`Watch ${title}`} />
    <WatchProgressTracker mediaType={mediaType} mediaId={mediaId} title={title} posterPath={posterPath} backdropPath={backdropPath} releaseDate={releaseDate} voteAverage={voteAverage} seasonNumber={mediaType === "tv" ? season : null} episodeNumber={mediaType === "tv" ? episode : null} episodeName={episodeName} />
  </>;
}
