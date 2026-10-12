"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import WatchPlayer from "./WatchPlayer";

type MediaType = "movie" | "tv";

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
};

type ResumeRow = {
  position_seconds: number | null;
  progress_percent: number | null;
};

export default function VidKingWatchFrame(
  props: Props,
) {
  const { user } = useAuth();

  const supabase = useMemo(
    () => createClient(),
    [],
  );

  const [resume, setResume] =
    useState<number | null>(null);

  const [resumeLoaded, setResumeLoaded] =
    useState(!user);

  const [showServerNotice, setShowServerNotice] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadResume() {
      if (!user) {
        setResume(null);
        setResumeLoaded(true);
        return;
      }

      setResumeLoaded(false);

      const { data } = await supabase
        .from("watch_progress")
        .select(
          "position_seconds,progress_percent",
        )
        .eq("user_id", user.id)
        .eq(
          "media_type",
          props.mediaType,
        )
        .eq(
          "media_id",
          props.mediaId,
        )
        .eq(
          "season_number",
          props.mediaType === "tv"
            ? props.season ?? 0
            : 0,
        )
        .eq(
          "episode_number",
          props.mediaType === "tv"
            ? props.episode ?? 0
            : 0,
        )
        .maybeSingle();

      if (cancelled) return;

      const row = data as ResumeRow | null;

      const position = Number(
        row?.position_seconds ?? 0,
      );

      const percent = Number(
        row?.progress_percent ?? 0,
      );

      setResume(
        percent < 95 && position > 5
          ? Math.floor(position)
          : null,
      );

      setResumeLoaded(true);
    }

    void loadResume();

    return () => {
      cancelled = true;
    };
  }, [
    props.episode,
    props.mediaId,
    props.mediaType,
    props.season,
    supabase,
    user,
  ]);

  if (!resumeLoaded) {
    return (
      <div className="grid aspect-video w-full place-items-center bg-black">
        <div className="flex flex-col items-center gap-3 text-sm text-white/55">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-red-500" />
          <span>
            Loading your position…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <WatchPlayer
        {...props}
        resume={resume}
      />

      {showServerNotice && (
        <div
          className="
            pointer-events-none
            fixed
            inset-x-0
            bottom-0
            z-[99999]
            flex
            justify-center
            px-3
            pb-[calc(12px+env(safe-area-inset-bottom))]
            sm:inset-x-auto
            sm:bottom-5
            sm:right-5
            sm:block
            sm:px-0
            sm:pb-0
          "
        >
          <div
            className="
              pointer-events-auto
              relative
              w-full
              max-w-[400px]
              rounded-2xl
              border
              border-white/10
              bg-[#111]/95
              p-4
              pr-11
              shadow-2xl
              backdrop-blur-xl
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-red-500/10
                  text-red-500
                "
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M12 10.5V16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                  <circle
                    cx="12"
                    cy="7.5"
                    r="1"
                    fill="currentColor"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  Having trouble watching?
                </p>

                <p className="mt-1 text-xs leading-5 text-white/60">
                  If one server fails to
                  load, try another
                  server from the
                  selector.
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close server notice"
              onClick={() =>
                setShowServerNotice(false)
              }
              className="
                absolute
                right-2
                top-2
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                text-white/45
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}