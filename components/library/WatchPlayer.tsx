"use client";

import { useMemo, useState } from "react";
import ServerSelector from "./ServerSelector";
import WatchProgressTracker from "./WatchProgressTracker";

type MediaType = "movie" | "tv";
type ServerOption = "server1" | "server2";

const VIDKING_ORIGIN = "https://www.vidking.net";
const SCREENSCAPE_ORIGIN = "https://screenscape.me";

type Props = {
  mediaType: MediaType;
  mediaId: number;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  voteAverage?: number | null;
  season?: number;
  episode?: number;
  episodeName?: string | null;
  resume?: number | null;
};

export default function WatchPlayer({
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
  resume,
}: Props) {
  const [server, setServer] = useState<ServerOption>("server1");

  const src = useMemo(() => {
    if (server === "server2") {
      const params = new URLSearchParams({
        tmdb: String(mediaId),
        type: mediaType,
      });

      if (mediaType === "tv") {
        params.set("s", String(season ?? 1));
        params.set("e", String(episode ?? 1));
      }

      return `${SCREENSCAPE_ORIGIN}/embed?${params.toString()}`;
    }

    const base =
      mediaType === "movie"
        ? `${VIDKING_ORIGIN}/embed/movie/${mediaId}`
        : `${VIDKING_ORIGIN}/embed/tv/${mediaId}/${season ?? 1}/${episode ?? 1}`;

    const params = new URLSearchParams({
      color: "e50914",
      autoPlay: "false",
    });

    if (resume !== null && resume !== undefined && resume > 0) {
      params.set("progress", String(Math.floor(resume)));
    }

    if (mediaType === "tv") {
      params.set("nextEpisode", "true");
      params.set("episodeSelector", "true");
    }

    return `${base}?${params.toString()}`;
  }, [episode, mediaId, mediaType, resume, season, server]);

  const origin = server === "server1" ? VIDKING_ORIGIN : SCREENSCAPE_ORIGIN;

  return (
    <>
      <div className="relative z-40 mb-3 flex justify-end">
        <ServerSelector value={server} onChange={setServer} />
      </div>

      <div className="relative w-full overflow-hidden bg-black aspect-video">
        <iframe
          key={`${server}-${mediaType}-${mediaId}-${season ?? ""}-${episode ?? ""}`}
          id={server === "server2" ? "screenscape-player" : "vidking-player"}
          src={src}
          title={`Watch ${title}`}
          className="absolute inset-0 h-full w-full border-0 bg-black"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media; web-share"
          allowFullScreen
          referrerPolicy="origin"
          loading="eager"
          scrolling="no"
        />
      </div>

      <WatchProgressTracker
        mediaType={mediaType}
        mediaId={mediaId}
        title={title}
        posterPath={posterPath}
        backdropPath={backdropPath}
        releaseDate={releaseDate}
        voteAverage={voteAverage}
        seasonNumber={mediaType === "tv" ? season : null}
        episodeNumber={mediaType === "tv" ? episode : null}
        episodeName={episodeName}
        server={server}
        iframeOrigin={origin}
      />
    </>
  );
}
