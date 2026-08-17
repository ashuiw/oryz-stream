"use client";

import { useEffect, useMemo, useState } from "react";

type MediaType = "movie" | "tv";
type StreamingServer = "server1" | "server2";

export interface VidKingWatchFrameProps {
  mediaType: MediaType;
  mediaId: string | number;

  title?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string;
  voteAverage?: number;

  season?: number;
  episode?: number;
  episodeName?: string;

  progress?: number;

  onProgress?: (seconds: number) => void;
}

export default function VidKingWatchFrame({
  mediaType,
  mediaId,
  title,
  posterPath,
  backdropPath,
  releaseDate,
  voteAverage,
  season = 1,
  episode = 1,
  episodeName,
  progress = 0,
  onProgress,
}: VidKingWatchFrameProps) {
  const [server, setServer] =
    useState<StreamingServer>("server1");

  const [reloadKey, setReloadKey] = useState(0);

  /*
   * Prevent unused-prop TypeScript/lint issues while
   * keeping compatibility with the existing watch pages.
   */
  void title;
  void posterPath;
  void backdropPath;
  void releaseDate;
  void voteAverage;
  void episodeName;

  /*
   * -----------------------------
   * VIDKING URL
   * -----------------------------
   */

  const vidKingUrl = useMemo(() => {
    const base =
      mediaType === "movie"
        ? `https://www.vidking.net/embed/movie/${mediaId}`
        : `https://www.vidking.net/embed/tv/${mediaId}/${season}/${episode}`;

    const params = new URLSearchParams();

    params.set("color", "e50914");
    params.set("autoPlay", "false");

    if (progress > 0) {
      params.set(
        "progress",
        String(Math.floor(progress))
      );
    }

    return `${base}?${params.toString()}`;
  }, [
    mediaId,
    mediaType,
    season,
    episode,
    progress,
  ]);

  /*
   * -----------------------------
   * SCREENSCAPE URL
   * -----------------------------
   */

  const screenscapeUrl = useMemo(() => {
    const params = new URLSearchParams();

    params.set("tmdb", String(mediaId));
    params.set("type", mediaType);

    if (mediaType === "tv") {
      params.set("s", String(season));
      params.set("e", String(episode));
    }

    return `https://screenscape.me/embed?${params.toString()}`;
  }, [
    mediaId,
    mediaType,
    season,
    episode,
  ]);

  /*
   * -----------------------------
   * SCREENSCAPE PROGRESS
   * -----------------------------
   */

  useEffect(() => {
    const handleMessage = (
      event: MessageEvent
    ) => {
      if (
        event.origin !==
        "https://screenscape.me"
      ) {
        return;
      }

      const data = event.data;

      if (
        !data ||
        data.type !==
          "SCREENSCAPE_WATCH_HISTORY_WITH_PROGRESS_RESPONSE"
      ) {
        return;
      }

      const history = data.watchHistory;

      if (!Array.isArray(history)) {
        return;
      }

      const currentItem = history.find(
        (item: unknown) => {
          if (
            !item ||
            typeof item !== "object"
          ) {
            return false;
          }

          const record =
            item as Record<
              string,
              unknown
            >;

          const itemTmdb =
            record.tmdbId ??
            record.tmdb ??
            record.id;

          return (
            String(itemTmdb) ===
            String(mediaId)
          );
        }
      );

      if (
        !currentItem ||
        typeof currentItem !==
          "object"
      ) {
        return;
      }

      const record =
        currentItem as Record<
          string,
          unknown
        >;

      const possibleProgress =
        record.progress ??
        record.progressSeconds ??
        record.position ??
        record.currentTime;

      if (
        typeof possibleProgress ===
        "number"
      ) {
        onProgress?.(
          possibleProgress
        );
      }
    };

    window.addEventListener(
      "message",
      handleMessage
    );

    return () => {
      window.removeEventListener(
        "message",
        handleMessage
      );
    };
  }, [mediaId, onProgress]);

  /*
   * -----------------------------
   * REQUEST SCREENSCAPE HISTORY
   * -----------------------------
   */

  const requestScreenscapeHistory =
    () => {
      const iframe =
        document.getElementById(
          "screenscape-player"
        ) as HTMLIFrameElement | null;

      if (
        !iframe?.contentWindow
      ) {
        return;
      }

      iframe.contentWindow.postMessage(
        {
          type:
            "SCREENSCAPE_GET_WATCH_HISTORY_WITH_PROGRESS",

          requestId:
            `history-${Date.now()}`,
        },
        "https://screenscape.me"
      );
    };

  /*
   * -----------------------------
   * ACTIVE PLAYER
   * -----------------------------
   */

  const playerUrl =
    server === "server1"
      ? vidKingUrl
      : screenscapeUrl;

  return (
    <div className="w-full">
      {/* 
        Server selector
        Keep this simple here if you already
        have ServerSelector.tsx.
      */}

      <div className="mb-4 flex justify-end">
        <div className="relative z-[100]">
          <button
            type="button"
            onClick={() =>
              setServer((current) =>
                current === "server1"
                  ? "server2"
                  : "server1"
              )
            }
            className="
              flex
              h-11
              min-w-[170px]
              items-center
              justify-between
              rounded-xl
              border
              border-white/10
              bg-[#111]
              px-4
              text-sm
              font-medium
              text-white
              transition
              hover:border-white/20
              hover:bg-[#171717]
              focus:outline-none
              focus:ring-2
              focus:ring-red-500/30
            "
          >
            <span>
              {server === "server1"
                ? "Server 1"
                : "Server 2"}
            </span>

            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              className="text-white/50"
            >
              <path
                d="M6 8l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 
        PLAYER
      */}

      <div
        key={reloadKey}
        className="
          relative
          aspect-video
          w-full
          overflow-hidden
          rounded-2xl
          bg-black
        "
      >
        <iframe
          id={
            server === "server2"
              ? "screenscape-player"
              : "vidking-player"
          }
          key={playerUrl}
          src={playerUrl}
          title="Oryz Video Player"
          className="
            absolute
            inset-0
            h-full
            w-full
            border-0
          "
          allow="
            autoplay;
            fullscreen;
            picture-in-picture;
            encrypted-media;
          "
          allowFullScreen
          referrerPolicy="origin"
          scrolling="no"
          onLoad={() => {
            if (
              server === "server2"
            ) {
              window.setTimeout(
                requestScreenscapeHistory,
                500
              );
            }
          }}
        />
      </div>

      {/* 
        Reload player
      */}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() =>
            setReloadKey(
              (value) => value + 1
            )
          }
          className="
            rounded-lg
            border
            border-white/10
            bg-white/[0.04]
            px-3
            py-2
            text-xs
            font-medium
            text-white/60
            transition
            hover:bg-white/[0.08]
            hover:text-white
          "
        >
          Reload player
        </button>
      </div>
    </div>
  );
}