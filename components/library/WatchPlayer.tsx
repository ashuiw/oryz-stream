"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Check,
  ChevronDown,
  Server,
} from "lucide-react";

import WatchProgressTracker from "./WatchProgressTracker";

type MediaType = "movie" | "tv";

export type ServerOption =
  | "server1"
  | "server2"
  | "server3";

type WatchPlayerProps = {
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

const CINEMAOS_ORIGIN = "https://cinemaos.tech";
const VIDKING_ORIGIN = "https://www.vidking.net";
const SCREENSCAPE_ORIGIN = "https://screenscape.me";

const SERVERS: { id: ServerOption; name: string }[] = [
  { id: "server1", name: "Server 1" },
  { id: "server2", name: "Server 2" },
  { id: "server3", name: "Server 3" },
];

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
}: WatchPlayerProps) {
  const [selectedServer, setSelectedServer] =
    useState<ServerOption>("server1");
  const [serverMenuOpen, setServerMenuOpen] = useState(false);
  const serverMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!serverMenuRef.current) return;
      const target = event.target as Node;
      if (!serverMenuRef.current.contains(target)) {
        setServerMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const currentMediaId = Number(mediaId);

  const currentSeason =
    mediaType === "tv" ? Math.max(1, Number(season ?? 1)) : 1;

  const currentEpisode =
    mediaType === "tv" ? Math.max(1, Number(episode ?? 1)) : 1;

  const cinemaUrl = useMemo(() => {
    if (mediaType === "tv") {
      return `${CINEMAOS_ORIGIN}/player/${currentMediaId}/${currentSeason}/${currentEpisode}?theme=ffffff`;
    }
    return `${CINEMAOS_ORIGIN}/player/${currentMediaId}?theme=ffffff`;
  }, [mediaType, currentMediaId, currentSeason, currentEpisode]);

  const vidkingUrl = useMemo(() => {
    let url: string;

    if (mediaType === "movie") {
      url = `${VIDKING_ORIGIN}/embed/movie/${currentMediaId}?autoPlay=true`;
    } else {
      url = `${VIDKING_ORIGIN}/embed/tv/${currentMediaId}/${currentSeason}/${currentEpisode}?autoPlay=true`;
    }

    const params = new URLSearchParams();
    params.set("color", "e50914");
    params.set("autoPlay", "false");

    if (typeof resume === "number" && resume > 0) {
      params.set("progress", String(Math.floor(resume)));
    }

    return `${url}?${params.toString()}`;
  }, [mediaType, currentMediaId, currentSeason, currentEpisode, resume]);

  const screenscapeUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("tmdb", String(currentMediaId));
    params.set("type", mediaType);

    if (mediaType === "tv") {
      params.set("s", String(currentSeason));
      params.set("e", String(currentEpisode));
    }

    return `${SCREENSCAPE_ORIGIN}/embed?${params.toString()}`;
  }, [mediaType, currentMediaId, currentSeason, currentEpisode]);

  const activeUrl =
    selectedServer === "server1"
      ? cinemaUrl
      : selectedServer === "server2"
        ? vidkingUrl
        : screenscapeUrl;

  const activeOrigin =
    selectedServer === "server1"
      ? CINEMAOS_ORIGIN
      : selectedServer === "server2"
        ? VIDKING_ORIGIN
        : SCREENSCAPE_ORIGIN;

  const iframeId =
    selectedServer === "server1"
      ? "cinemaos-player"
      : selectedServer === "server2"
        ? "vidking-player"
        : "screenscape-player";

  const activeServer = SERVERS.find((server) => server.id === selectedServer);
  const activeServerName = activeServer?.name ?? "Server 1";

  return (
    <section style={{ width: "100%" }}>
      {/* ===================================================
          TOP WATCH BAR
          =================================================== */}
      <div
        style={{
          position: "relative",
          zIndex: 100,
          marginBottom: "12px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        {/* LEFT — TITLE */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.4)",
              margin: 0,
            }}
          >
            Watching
          </p>

          <h2
            style={{
              marginTop: "2px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "18px",
              fontWeight: 600,
              lineHeight: 1.2,
              color: "#ffffff",
            }}
          >
            {title}
          </h2>

          {mediaType === "tv" && (
            <p
              style={{
                marginTop: "4px",
                fontSize: "12px",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              Season {currentSeason} • Episode {currentEpisode}
            </p>
          )}
        </div>

        {/* RIGHT — SERVER SELECTOR */}
        <div
          ref={serverMenuRef}
          style={{
            position: "relative",
            zIndex: 200,
            marginLeft: "auto",
            width: "160px",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setServerMenuOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={serverMenuOpen}
            style={{
              display: "flex",
              height: "40px",
              width: "100%",
              alignItems: "center",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "#111111",
              textAlign: "left",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <span
              style={{
                display: "flex",
                height: "100%",
                width: "36px",
                flexShrink: 0,
                alignItems: "center",
                justifyContent: "center",
                borderRight: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Server
                size={15}
                strokeWidth={1.8}
                color="rgba(255,255,255,0.45)"
              />
            </span>

            <span
              style={{
                minWidth: 0,
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                padding: "0 10px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              {activeServerName}
            </span>

            <span
              style={{
                display: "flex",
                width: "32px",
                flexShrink: 0,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronDown
                size={14}
                strokeWidth={2}
                color="rgba(255,255,255,0.4)"
                style={{
                  transition: "transform 0.2s",
                  transform: serverMenuOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              />
            </span>
          </button>

          {serverMenuOpen && (
            <div
              role="listbox"
              aria-label="Streaming servers"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 6px)",
                zIndex: 99999,
                width: "160px",
                overflow: "hidden",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "#111111",
                padding: "4px",
                boxShadow: "0 15px 45px rgba(0,0,0,0.75)",
              }}
            >
              {SERVERS.map((server) => {
                const isSelected = selectedServer === server.id;

                return (
                  <button
                    key={server.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setSelectedServer(server.id);
                      setServerMenuOpen(false);
                    }}
                    style={{
                      display: "flex",
                      height: "36px",
                      width: "100%",
                      alignItems: "center",
                      borderRadius: "6px",
                      border: "none",
                      padding: "0 10px",
                      textAlign: "left",
                      fontSize: "12px",
                      cursor: "pointer",
                      backgroundColor: isSelected
                        ? "rgba(255,255,255,0.1)"
                        : "transparent",
                      color: isSelected
                        ? "#ffffff"
                        : "rgba(255,255,255,0.55)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255,255,255,0.06)";
                        e.currentTarget.style.color = "#ffffff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor =
                          "transparent";
                        e.currentTarget.style.color =
                          "rgba(255,255,255,0.55)";
                      }
                    }}
                  >
                    <span
                      style={{
                        marginRight: "8px",
                        height: "6px",
                        width: "6px",
                        flexShrink: 0,
                        borderRadius: "9999px",
                        backgroundColor: isSelected
                          ? "#34d399"
                          : "rgba(255,255,255,0.2)",
                      }}
                    />

                    <span style={{ flex: 1 }}>{server.name}</span>

                    {isSelected && (
                      <Check size={13} strokeWidth={2} color="#34d399" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ===================================================
          PLAYER
          =================================================== */}
      <div
        style={{
          position: "relative",
          zIndex: 0,
          overflow: "hidden",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.1)",
          backgroundColor: "#000000",
          boxShadow: "0 25px 80px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            position: "relative",
            aspectRatio: "16 / 9",
            width: "100%",
            backgroundColor: "#000000",
          }}
        >
          <iframe
            key={[
              selectedServer,
              mediaType,
              currentMediaId,
              currentSeason,
              currentEpisode,
            ].join("-")}
            id={iframeId}
            src={activeUrl}
            title={`Watch ${title}`}
            style={{
              position: "absolute",
              inset: 0,
              height: "100%",
              width: "100%",
              border: 0,
              backgroundColor: "#000000",
            }}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; web-share"
            allowFullScreen
            referrerPolicy="origin"
            loading="eager"
            scrolling="no"
          />
        </div>
      </div>

      {/* ===================================================
          PLAYER INFORMATION
          =================================================== */}
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.06)",
          backgroundColor: "rgba(255,255,255,0.025)",
          padding: "12px 16px",
        }}
        className="sm:flex-row sm:items-center sm:justify-between"
      >
        <div style={{ display: "flex", minWidth: 0, alignItems: "center", gap: "8px" }}>
          <span
            style={{
              height: "8px",
              width: "8px",
              flexShrink: 0,
              borderRadius: "9999px",
              backgroundColor: "#34d399",
              boxShadow: "0 0 10px rgba(52,211,153,0.5)",
            }}
          />

          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "12px",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Playing on{" "}
            <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>
              {activeServerName}
            </span>
          </span>
        </div>

        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
          Try another server if playback fails
        </span>
      </div>

      {/* ===================================================
          WATCH PROGRESS TRACKER
          =================================================== */}
      <WatchProgressTracker
        mediaType={mediaType}
        mediaId={currentMediaId}
        title={title}
        posterPath={posterPath}
        backdropPath={backdropPath}
        releaseDate={releaseDate}
        voteAverage={voteAverage}
        seasonNumber={mediaType === "tv" ? currentSeason : null}
        episodeNumber={mediaType === "tv" ? currentEpisode : null}
        episodeName={episodeName}
        server={selectedServer}
        iframeOrigin={activeOrigin}
      />
    </section>
  );
}