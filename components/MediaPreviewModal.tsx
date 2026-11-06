"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Share, Star, X } from "@/components/ui/icons";
import { Media, backdrop, mediaType, poster, titleOf, yearOf } from "@/lib/tmdb";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import LibraryActions from "@/components/library/LibraryActions";

type CastMember = { id: number; name: string; character?: string; profile_path?: string | null };
type Episode = {
  id: number;
  episode_number: number;
  name: string;
  overview?: string;
  still_path?: string | null;
  air_date?: string;
  runtime?: number | null;
};
type Season = { id: number; season_number: number; name: string; episode_count: number; poster_path?: string | null };

type Detail = Media & {
  runtime?: number;
  episode_run_time?: number[];
  genres?: { id: number; name: string }[];
  status?: string;
  tagline?: string;
  credits?: { cast?: CastMember[] };
  seasons?: Season[];
  number_of_seasons?: number;
  number_of_episodes?: number;
};

function watchHref(type: "movie" | "tv", id: number, season = 1, episode = 1) {
  return type === "movie" ? `/watch/movie/${id}` : `/watch/tv/${id}/${season}/${episode}`;
}

export default function MediaPreviewModal({
  item,
  type: forcedType,
  onClose,
}: {
  item: Media | null;
  type?: "movie" | "tv";
  onClose: () => void;
}) {
  const type = forcedType || (item ? mediaType(item) : "movie");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(false);
  const [season, setSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodeLoading, setEpisodeLoading] = useState(false);

  useEffect(() => {
    if (!item) return;
    setDetail(null);
    setEpisodes([]);
    setSeason(1);
    setLoading(true);

    const controller = new AbortController();
    fetch(`/api/tmdb?type=${type}&mode=details&id=${item.id}`, { signal: controller.signal })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Unable to load details");
        setDetail(data);
        const firstSeason = (data.seasons || []).find((s: Season) => s.season_number > 0) || data.seasons?.[0];
        if (firstSeason) setSeason(firstSeason.season_number);
      })
      .catch((e) => e.name !== "AbortError" && console.error(e))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [item, type]);

  useEffect(() => {
    if (!item || type !== "tv" || !detail) return;
    const controller = new AbortController();
    setEpisodeLoading(true);
    fetch(`/api/tmdb?type=tv&mode=season&id=${item.id}&season=${season}`, { signal: controller.signal })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Unable to load episodes");
        setEpisodes(data.episodes || []);
      })
      .catch((e) => e.name !== "AbortError" && console.error(e))
      .finally(() => setEpisodeLoading(false));
    return () => controller.abort();
  }, [item, type, detail, season]);

  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    // Lock page scroll without the layout jump caused by the scrollbar disappearing.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, [item, onClose]);

  const selectedSeason = detail?.seasons?.find((s) => s.season_number === season);
  const firstEpisode = episodes[0];
  const heroImage = detail?.backdrop_path || item?.backdrop_path;
  const cast = useMemo(() => detail?.credits?.cast?.slice(0, 12) || [], [detail]);
  const toast = useToast();

  async function share() {
    if (!item) return;
    const url = `${window.location.origin}${watchHref(type, item.id, season, 1)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: titleOf(detail || item), url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to your clipboard.");
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") toast.error("Could not share this title. Copy the link from the watch page instead.");
    }
  }

  if (!item) return null;

  const shown = detail || item;
  const runtime = type === "movie" ? detail?.runtime : detail?.episode_run_time?.[0];
  const runtimeLabel = runtime ? (runtime >= 60 ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` : `${runtime}m`) : null;
  const seasonsCount = detail?.number_of_seasons || detail?.seasons?.filter((x) => x.season_number > 0).length;

  const meta = [
    type === "tv" ? "TV show" : "Movie",
    yearOf(shown) || null,
    runtimeLabel,
    type === "tv" && seasonsCount ? `${seasonsCount} season${seasonsCount === 1 ? "" : "s"}` : null,
  ].filter(Boolean) as string[];

  const facts: [string, string][] = [
    ["Status", detail?.status || ""],
    ["Release", (shown.release_date || shown.first_air_date || "").slice(0, 10)],
    type === "tv" ? ["Episodes", detail?.number_of_episodes ? String(detail.number_of_episodes) : ""] : ["Runtime", runtimeLabel || ""],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div
      className="fixed inset-0 z-[160] flex items-end justify-center bg-ink/80 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${titleOf(shown)} details`}
        className="pop-in relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-ink-2 shadow-2xl sm:max-w-3xl sm:rounded-2xl"
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-ink/70 text-white/80 backdrop-blur transition hover:bg-ink hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {/* Header image */}
          <div className="relative aspect-video w-full bg-surface sm:aspect-[2/1]">
            {heroImage ? <img src={backdrop(heroImage, "w1280")} alt="" className="h-full w-full object-cover" /> : null}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/30 to-transparent" />
          </div>

          <div className="relative -mt-14 px-5 pb-8 sm:-mt-20 sm:px-8">
            <p className="flex flex-wrap items-center gap-x-2 text-sm text-white/65">
              {meta.map((m, i) => (
                <span key={m} className="flex items-center gap-2">{i > 0 ? <span className="text-white/25">·</span> : null}{m}</span>
              ))}
              {detail?.vote_average ? (
                <span className="flex items-center gap-1.5 text-gold-400"><span className="text-white/25">·</span><Star size={13} weight="fill" />{detail.vote_average.toFixed(1)}</span>
              ) : null}
            </p>
            <h2 className="mt-2 text-3xl sm:text-5xl">{titleOf(shown)}</h2>
            {detail?.tagline ? <p className="mt-2 text-sm text-white/50">{detail.tagline}</p> : null}

            {/* Actions */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Link
                href={watchHref(type, item.id, season, firstEpisode?.episode_number || 1)}
                className="gold-btn inline-flex h-12 flex-1 items-center justify-center gap-2 px-6 text-[15px] sm:flex-none"
              >
                <Play size={17} />
                {type === "tv" ? `Watch S${season} E${firstEpisode?.episode_number || 1}` : "Watch now"}
              </Link>
              <LibraryActions item={item} type={type} compact />
              <button
                onClick={share}
                aria-label="Share"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/15 px-3.5 text-sm font-medium text-white/75 transition hover:border-white/40 hover:text-white sm:px-4"
              >
                <Share size={18} />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            {loading ? (
              <div className="mt-8 space-y-3">
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-11/12 rounded" />
                <div className="skeleton h-4 w-2/3 rounded" />
              </div>
            ) : (
              <>
                <p className="mt-7 text-[15px] leading-7 text-white/75">
                  {detail?.overview || item.overview || "No synopsis has been added for this title yet."}
                </p>

                {detail?.genres?.length ? (
                  <p className="mt-4 text-sm text-white/50">{detail.genres.map((g) => g.name).join("  ·  ")}</p>
                ) : null}

                {facts.length ? (
                  <dl className="mt-7 grid grid-cols-2 gap-x-6 border-t border-white/10 sm:grid-cols-3">
                    {facts.map(([k, v]) => (
                      <div key={k} className="border-b border-white/10 py-3">
                        <dt className="text-xs text-white/40">{k}</dt>
                        <dd className="mt-0.5 text-sm font-medium text-white/85">{v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {type === "tv" && detail?.seasons?.length ? (
                  <section className="mt-9">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-xl">Episodes</h3>
                      <select
                        value={season}
                        onChange={(e) => setSeason(Number(e.target.value))}
                        aria-label="Season"
                        className="rounded-lg border border-white/15 bg-surface px-3 py-2 text-sm text-white outline-none focus:border-gold-500"
                      >
                        {detail.seasons.filter((x) => x.season_number >= 0).map((x) => (
                          <option key={x.id} value={x.season_number}>{x.name}</option>
                        ))}
                      </select>
                    </div>
                    <p className="-mt-2 mb-3 text-xs text-white/40">
                      {selectedSeason?.name || `Season ${season}`} · {episodes.length || selectedSeason?.episode_count || 0} episodes
                    </p>

                    {episodeLoading ? (
                      <div className="space-y-3">{[1, 2, 3].map((n) => <div key={n} className="skeleton h-20 rounded-lg" />)}</div>
                    ) : (
                      <ul className="divide-y divide-white/10 border-y border-white/10">
                        {episodes.map((ep) => (
                          <li key={ep.id}>
                            <Link href={watchHref("tv", item.id, season, ep.episode_number)} className="group flex gap-4 py-3.5">
                              <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-surface sm:w-40">
                                {ep.still_path ? <img src={backdrop(ep.still_path, "w500")} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="flex items-baseline gap-2">
                                  <span className="text-sm text-white/40">{ep.episode_number}</span>
                                  <span className="line-clamp-1 text-[15px] font-medium text-white transition-colors group-hover:text-gold-400">{ep.name}</span>
                                  {ep.runtime ? <span className="ml-auto shrink-0 text-xs text-white/40">{ep.runtime}m</span> : null}
                                </p>
                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-white/50">{ep.overview || "No synopsis for this episode yet."}</p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ) : null}

                {cast.length ? (
                  <section className="mt-9">
                    <h3 className="mb-4 text-xl">Cast</h3>
                    <ul className="scrollbar-none -mx-5 flex gap-4 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8">
                      {cast.map((person) => (
                        <li key={person.id} className="w-20 shrink-0 text-center">
                          <div className="mx-auto h-20 w-20 overflow-hidden rounded-full bg-surface">
                            {person.profile_path ? <img src={poster(person.profile_path, "w185")} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}
                          </div>
                          <p className="mt-2 line-clamp-2 text-xs font-medium text-white/85">{person.name}</p>
                          {person.character ? <p className="mt-0.5 line-clamp-1 text-[11px] text-white/40">{person.character}</p> : null}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
