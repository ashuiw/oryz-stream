"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CalendarDays, Clock3, Play, Star, Tv, Film, X, Users } from "lucide-react";
import { Media, backdrop, mediaType, poster, titleOf, yearOf } from "@/lib/tmdb";
import Link from "next/link";
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

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  const selectedSeason = detail?.seasons?.find((s) => s.season_number === season);
  const firstEpisode = episodes[0];
  const heroImage = detail?.backdrop_path || item?.backdrop_path;
  const cast = useMemo(() => detail?.credits?.cast?.slice(0, 8) || [], [detail]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#101010] shadow-2xl">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/55 text-white/70 backdrop-blur-md hover:bg-white/10 hover:text-white">
          <X size={19} />
        </button>

        <div className="max-h-[94vh] overflow-y-auto">
          <section className="relative min-h-[330px] overflow-hidden sm:min-h-[390px]">
            {heroImage ? <img src={backdrop(heroImage, "w1280")} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-[#181818]" />}
            <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/55 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

            <div className="relative flex min-h-[330px] items-end p-6 sm:min-h-[390px] sm:p-9">
              <div className="max-w-3xl">
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-white/60">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1">{type === "tv" ? <Tv size={12} /> : <Film size={12} />}{type === "tv" ? "TV Show" : "Movie"}</span>
                  {yearOf(detail || item) ? <span>{yearOf(detail || item)}</span> : null}
                  {detail?.vote_average ? <span className="inline-flex items-center gap-1 text-yellow-300"><Star size={12} fill="currentColor" />{detail.vote_average.toFixed(1)}</span> : null}
                  {detail?.status ? <span>{detail.status}</span> : null}
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">{titleOf(detail || item)}</h2>
                {detail?.tagline ? <p className="mt-2 text-sm italic text-white/45">{detail.tagline}</p> : null}
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={watchHref(type, item.id, season, firstEpisode?.episode_number || 1)} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/85">
                    <Play size={15} fill="currentColor" />
                    {type === "tv" ? `Watch S${season} · E${firstEpisode?.episode_number || 1}` : "Watch now"}
                  </Link>
                </div>
                <div className="mt-4"><LibraryActions item={item} type={type} /></div>
              </div>
            </div>
          </section>

          <div className="space-y-7 p-6 sm:p-9">
            {loading ? <div className="h-24 animate-pulse rounded-2xl bg-white/[0.05]" /> : (
              <>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <div>
                    <p className="text-sm leading-7 text-white/60">{detail?.overview || item.overview || "No description available."}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {detail?.genres?.map((g) => <span key={g.id} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/55">{g.name}</span>)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 self-start sm:grid-cols-3 lg:grid-cols-2">
                    <Info icon={<CalendarDays size={14} />} label="Release" value={yearOf(detail || item) || "—"} />
                    <Info icon={<Star size={14} />} label="Rating" value={detail?.vote_average ? detail.vote_average.toFixed(1) : "—"} />
                    {type === "movie" ? <Info icon={<Clock3 size={14} />} label="Runtime" value={detail?.runtime ? `${detail.runtime} min` : "—"} /> : <Info icon={<Tv size={14} />} label="Seasons" value={String(detail?.number_of_seasons || detail?.seasons?.length || "—")} />}
                  </div>
                </div>

                {type === "tv" && detail?.seasons?.length ? (
                  <section>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Episodes</h3>
                        <p className="mt-1 text-xs text-white/35">{selectedSeason?.name || `Season ${season}`} · {episodes.length || selectedSeason?.episode_count || 0} episodes</p>
                      </div>
                      <select value={season} onChange={(e) => setSeason(Number(e.target.value))} className="rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-sm text-white outline-none">
                        {detail.seasons.filter((s) => s.season_number >= 0).map((s) => <option key={s.id} value={s.season_number}>{s.name}</option>)}
                      </select>
                    </div>

                    {episodeLoading ? <div className="space-y-3">{[1,2,3].map((n) => <div key={n} className="h-24 animate-pulse rounded-2xl bg-white/[0.04]" />)}</div> : (
                      <div className="space-y-3">
                        {episodes.map((ep) => (
                          <Link key={ep.id} href={watchHref("tv", item.id, season, ep.episode_number)} className="group grid gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-2.5 transition hover:border-white/15 hover:bg-white/[0.05] sm:grid-cols-[190px_minmax(0,1fr)_auto]">
                            <div className="relative aspect-video overflow-hidden rounded-xl bg-black/30">
                              {ep.still_path ? <img src={backdrop(ep.still_path, "w500")} alt={ep.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /> : <div className="grid h-full place-items-center text-xs text-white/25">No thumbnail</div>}
                              <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">E{ep.episode_number}</span>
                            </div>
                            <div className="min-w-0 px-1 py-1">
                              <div className="flex flex-wrap items-center gap-2"><h4 className="font-semibold text-white">{ep.name}</h4>{ep.runtime ? <span className="text-xs text-white/30">{ep.runtime} min</span> : null}</div>
                              <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/45">{ep.overview || "No episode description available."}</p>
                              {ep.air_date ? <p className="mt-2 text-xs text-white/25">{ep.air_date}</p> : null}
                            </div>
                            <span className="hidden items-center justify-center px-3 text-xs font-semibold text-white/50 group-hover:text-white sm:flex">Watch</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </section>
                ) : null}

                {cast.length ? (
                  <section>
                    <div className="mb-4 flex items-center gap-2"><Users size={16} className="text-white/45" /><h3 className="text-lg font-semibold">Cast</h3></div>
                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
                      {cast.map((person) => <div key={person.id} className="min-w-0"><div className="aspect-[2/3] overflow-hidden rounded-xl bg-white/[0.05]">{person.profile_path ? <img src={poster(person.profile_path, "w185")} alt={person.name} className="h-full w-full object-cover" /> : null}</div><p className="mt-2 line-clamp-1 text-xs font-medium text-white/75">{person.name}</p><p className="line-clamp-1 text-[10px] text-white/30">{person.character || ""}</p></div>)}
                    </div>
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

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"><div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/25">{icon}{label}</div><p className="mt-1 text-sm font-medium text-white/75">{value}</p></div>;
}
