"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type MediaType = "movie" | "tv";
type StreamingServer = "server1" | "server2" | "server3";

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

type CinemaPlayerEvent = {
  event?: string;
  currentTime?: number;
  duration?: number;
  tmdbId?: string | number;
  mediaType?: MediaType;
  season?: number;
  episode?: number;
  playing?: boolean;
  muted?: boolean;
  volume?: number;
};

type CinemaMediaRecord = {
  id?: number;
  type?: MediaType;
  title?: string;
  poster_path?: string;
  progress?: { watched?: number; duration?: number };
  last_updated?: number;
};

type CinemaMediaData = Record<string, CinemaMediaRecord>;

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/";

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
  const [server, setServer] = useState<StreamingServer>("server1");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cinemaProgress, setCinemaProgress] = useState(progress);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  void releaseDate;
  void voteAverage;
  void episodeName;

  const startTime = Math.max(
    0,
    Math.floor(cinemaProgress || progress || 0),
  );

  /*
   * CinemaOS accepts a TMDB id in /player/:id.
   * The poster/backdrop is shown by Oryz before the iframe
   * finishes loading so there is no blank/incorrect loading screen.
   */
  const cinemaUrl = useMemo(() => {
    const params = new URLSearchParams({
      theme: "e50914",
      autoPlay: "true",
      title: "false",
      poster: "true",
      nextButton: "false",
      autoNext: mediaType === "tv" ? "true" : "false",
    });

    if (startTime > 0) {
      params.set("startTime", String(startTime));
    }

    return `https://cinemaos.tech/player/${encodeURIComponent(
      String(mediaId),
    )}?${params.toString()}`;
  }, [mediaId, mediaType, startTime]);

  const vidKingUrl = useMemo(() => {
    const base =
      mediaType === "movie"
        ? `https://www.vidking.net/embed/movie/${encodeURIComponent(String(mediaId))}`
        : `https://www.vidking.net/embed/tv/${encodeURIComponent(
            String(mediaId),
          )}/${season}/${episode}`;

    const params = new URLSearchParams({
      color: "e50914",
      autoPlay: "false",
    });

    if (progress > 0) {
      params.set("progress", String(Math.floor(progress)));
    }

    return `${base}?${params.toString()}`;
  }, [mediaId, mediaType, season, episode, progress]);

  const screenscapeUrl = useMemo(() => {
    const params = new URLSearchParams({
      tmdb: String(mediaId),
      type: mediaType,
    });

    if (mediaType === "tv") {
      params.set("s", String(season));
      params.set("e", String(episode));
    }

    return `https://screenscape.me/embed?${params.toString()}`;
  }, [mediaId, mediaType, season, episode]);

  const playerUrl =
    server === "server1"
      ? cinemaUrl
      : server === "server2"
        ? vidKingUrl
        : screenscapeUrl;

  const posterUrl = posterPath
    ? `${TMDB_IMAGE_BASE}w780${posterPath}`
    : null;

  const backdropUrl = backdropPath
    ? `${TMDB_IMAGE_BASE}w1280${backdropPath}`
    : posterUrl;

  const onCinemaMessage = useCallback(
    (event: MessageEvent) => {
      if (event.origin !== "https://cinemaos.tech") return;

      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "PLAYER_EVENT") {
        const playerData =
          data.data as CinemaPlayerEvent | undefined;

        if (
          typeof playerData?.currentTime === "number"
        ) {
          setCinemaProgress(playerData.currentTime);
          onProgress?.(playerData.currentTime);
        }
      }

      if (data.type === "MEDIA_DATA") {
        const media =
          data.data as CinemaMediaData | undefined;

        if (!media || typeof media !== "object") return;

        const item = media[`m${String(mediaId)}`];
        const watched = item?.progress?.watched;

        if (typeof watched === "number") {
          setCinemaProgress(watched);
          onProgress?.(watched);
        }

        try {
          window.localStorage.setItem(
            "cinemaosProgress",
            JSON.stringify(media),
          );
        } catch {
          // Ignore storage restrictions.
        }
      }
    },
    [mediaId, onProgress],
  );

  useEffect(() => {
    window.addEventListener(
      "message",
      onCinemaMessage,
    );

    return () => {
      window.removeEventListener(
        "message",
        onCinemaMessage,
      );
    };
  }, [onCinemaMessage]);

  useEffect(() => {
    setIframeLoaded(false);
    setShowIntro(true);

    /*
     * Keep the Oryz artwork visible briefly after iframe load.
     * This avoids flashing CinemaOS's own loading screen.
     */
    const timeout = window.setTimeout(() => {
      setShowIntro(false);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [playerUrl]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node,
        )
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    );
    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      );
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, []);

  const requestCinemaStatus = useCallback(() => {
    const iframe = document.getElementById(
      "cinemaos-player",
    ) as HTMLIFrameElement | null;

    iframe?.contentWindow?.postMessage(
      { type: "getStatus" },
      "https://cinemaos.tech",
    );
  }, []);

  const cinemaCommand = useCallback(
    (
      type:
        | "play"
        | "pause"
        | "seek"
        | "volume"
        | "mute"
        | "getStatus",
      value?: number | boolean,
    ) => {
      const iframe = document.getElementById(
        "cinemaos-player",
      ) as HTMLIFrameElement | null;

      if (!iframe?.contentWindow) return;

      const message: Record<string, unknown> = {
        type,
      };

      if (
        type === "seek" &&
        typeof value === "number"
      ) {
        message.time = value;
      }

      if (
        type === "volume" &&
        typeof value === "number"
      ) {
        message.level = Math.max(
          0,
          Math.min(1, value),
        );
      }

      if (
        type === "mute" &&
        typeof value === "boolean"
      ) {
        message.muted = value;
      }

      iframe.contentWindow.postMessage(
        message,
        "https://cinemaos.tech",
      );
    },
    [],
  );

  const serverLabel =
    server === "server1"
      ? "Server 1"
      : server === "server2"
        ? "Server 2"
        : "Server 3";

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-end">
        <div
          ref={menuRef}
          className="relative"
        >
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen((value) => !value)
            }
            className="
              flex h-11 min-w-[180px] items-center
              justify-between gap-4 rounded-xl
              border border-white/10 bg-[#111]
              px-4 text-sm font-medium text-white
              transition hover:border-white/20
              hover:bg-[#171717]
              focus:outline-none
              focus:ring-2 focus:ring-red-500/30
            "
          >
            <span>{serverLabel}</span>

            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              className={`text-white/50 transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
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

          {menuOpen && (
            <div
              role="listbox"
              aria-label="Streaming server"
              className="
                absolute right-0 top-[calc(100%+8px)]
                z-[100] w-[180px] overflow-hidden
                rounded-xl border border-white/10
                bg-[#111] p-1.5 shadow-2xl
              "
            >
              {(
                ["server1", "server2", "server3"] as const
              ).map((value) => {
                const selected =
                  server === value;

                return (
                  <button
                    key={value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setServer(value);
                      setMenuOpen(false);
                    }}
                    className={`
                      flex w-full items-center
                      justify-between rounded-lg
                      px-3 py-2.5 text-sm transition
                      ${
                        selected
                          ? "bg-red-500/10 text-white"
                          : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                      }
                    `}
                  >
                    <span>
                      {value === "server1"
                        ? "Server 1"
                        : value === "server2"
                          ? "Server 2"
                          : "Server 3"}
                    </span>

                    {selected && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="text-red-500"
                      >
                        <path
                          d="m5 10 3 3 7-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="
        relative aspect-video w-full
        overflow-hidden rounded-2xl bg-black
      ">
        <iframe
          id={
            server === "server1"
              ? "cinemaos-player"
              : server === "server2"
                ? "vidking-player"
                : "screenscape-player"
          }
          key={playerUrl}
          src={playerUrl}
          title={title || "Oryz Video Player"}
          className="absolute inset-0 h-full w-full border-0"
          allow="
            autoplay;
            fullscreen;
            picture-in-picture;
            encrypted-media
          "
          allowFullScreen
          referrerPolicy="origin"
          scrolling="no"
          onLoad={() => {
            setIframeLoaded(true);

            if (server === "server1") {
              window.setTimeout(
                requestCinemaStatus,
                700,
              );
            }
          }}
        />

        {/*
          Oryz loading artwork.
          This is intentionally outside the iframe because
          CinemaOS's internal loading screen cannot be controlled
          from the parent page.
        */}
        <div
          aria-hidden={!showIntro}
          className={`
            pointer-events-none absolute inset-0
            z-20 overflow-hidden bg-black
            transition-opacity duration-500
            ${
              showIntro
                ? "opacity-100"
                : "opacity-0"
            }
          `}
        >
          {backdropUrl && (
            <img
              src={backdropUrl}
              alt=""
              className="
                absolute inset-0 h-full w-full
                object-cover opacity-35
              "
            />
          )}

          <div className="
            absolute inset-0
            bg-gradient-to-t
            from-black via-black/55 to-black/25
          " />

          <div className="
            absolute inset-0 flex flex-col
            items-center justify-center
            px-6 text-center
          ">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt=""
                className="
                  mb-5 h-28 w-20 rounded-lg
                  object-cover shadow-2xl
                  ring-1 ring-white/10
                  sm:h-36 sm:w-24
                "
              />
            ) : (
              <div className="
                mb-5 h-28 w-20 rounded-lg
                bg-white/10 sm:h-36 sm:w-24
              " />
            )}

            <p className="
              max-w-[80%] truncate
              text-sm font-semibold text-white
              sm:text-base
            ">
              {title || "Loading"}
            </p>

            <div className="
              mt-4 h-1.5 w-32 overflow-hidden
              rounded-full bg-white/10
            ">
              <div className="
                h-full w-1/2 animate-pulse
                rounded-full bg-red-500
              " />
            </div>
          </div>
        </div>

        {!iframeLoaded && (
          <div className="
            pointer-events-none absolute
            bottom-4 left-4 z-30
            rounded-full border border-white/10
            bg-black/50 px-3 py-1.5
            text-[11px] text-white/60
            backdrop-blur-md
          ">
            Loading player
          </div>
        )}
      </div>

      {server === "server1" && (
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() =>
              cinemaCommand("play")
            }
            className="
              rounded-lg border border-white/10
              bg-white/[0.04] px-3 py-2
              text-xs text-white/70
              hover:bg-white/[0.08]
            "
          >
            Play
          </button>

          <button
            type="button"
            onClick={() =>
              cinemaCommand("pause")
            }
            className="
              rounded-lg border border-white/10
              bg-white/[0.04] px-3 py-2
              text-xs text-white/70
              hover:bg-white/[0.08]
            "
          >
            Pause
          </button>

          <button
            type="button"
            onClick={() =>
              cinemaCommand(
                "seek",
                Math.max(
                  0,
                  cinemaProgress - 10,
                ),
              )
            }
            className="
              rounded-lg border border-white/10
              bg-white/[0.04] px-3 py-2
              text-xs text-white/70
              hover:bg-white/[0.08]
            "
          >
            -10s
          </button>

          <button
            type="button"
            onClick={() =>
              cinemaCommand(
                "seek",
                cinemaProgress + 10,
              )
            }
            className="
              rounded-lg border border-white/10
              bg-white/[0.04] px-3 py-2
              text-xs text-white/70
              hover:bg-white/[0.08]
            "
          >
            +10s
          </button>

          <button
            type="button"
            onClick={() =>
              cinemaCommand("getStatus")
            }
            className="
              rounded-lg border border-white/10
              bg-white/[0.04] px-3 py-2
              text-xs text-white/70
              hover:bg-white/[0.08]
            "
          >
            Refresh status
          </button>
        </div>
      )}
    </div>
  );
}
