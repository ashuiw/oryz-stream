"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { backdrop, poster } from "@/lib/tmdb";
import VidKingWatchFrame from "@/components/library/VidKingWatchFrame";

type Show = { id: number; name: string; overview?: string; poster_path?: string | null; backdrop_path?: string | null; first_air_date?: string; vote_average?: number; number_of_seasons?: number; genres?: { id: number; name: string }[]; seasons?: { season_number: number; name: string; episode_count: number }[] };
type Episode = { id: number; episode_number: number; name: string; overview?: string; still_path?: string | null; runtime?: number; air_date?: string };

export default function TVWatchPage() {
  const params = useParams<{ id: string; season: string; episode: string }>();
  const id = params.id;
  const season = Number(params.season || 1);
  const episodeNumber = Number(params.episode || 1);
  const [show, setShow] = useState<Show | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/tmdb?type=tv&mode=details&id=${id}`).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error || "Unable to load show"); return d; }).then(setShow).catch(e => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!id || !season) return;
    fetch(`/api/tmdb?type=tv&mode=season&id=${id}&season=${season}`).then(r => r.json()).then(d => setEpisodes(d.episodes || [])).catch(() => setEpisodes([]));
  }, [id, season]);

  if (error) return <div className="grid min-h-screen place-items-center bg-[#070707] text-white"><div className="text-center"><h1 className="text-2xl font-bold">Unable to load this show</h1><p className="mt-2 text-white/45">{error}</p><Link href="/" className="mt-5 inline-block rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black">Back home</Link></div></div>;
  if (!show) return <div className="grid min-h-screen place-items-center bg-[#070707] text-sm text-white/40">Loading...</div>;

  const current = episodes.find(e => e.episode_number === episodeNumber);

  return (
    <div className="oryz-watch-page min-h-screen bg-[#070707] text-white">
      <Navbar />
      <main className="mx-auto w-[min(1280px,calc(100%-28px))] pb-16 pt-10 sm:w-[min(1280px,calc(100%-40px))] sm:pt-12">
        <Link href={`/shows`} className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/55 hover:text-white"><ArrowLeft size={16} /> Back to shows</Link>
        <div className="oryz-player-frame overflow-hidden rounded-[22px] border border-white/[0.08] bg-black shadow-2xl">
          <div className="aspect-video w-full">
            <VidKingWatchFrame
              mediaType="tv"
              mediaId={show.id}
              title={show.name}
              posterPath={show.poster_path}
              backdropPath={show.backdrop_path}
              releaseDate={show.first_air_date}
              voteAverage={show.vote_average}
              season={season}
              episode={episodeNumber}
              episodeName={current?.name}
            />
          </div>
        </div>

        <section className="mt-7 rounded-[22px] border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">Oryz · TV</p>
          <h1 className="mt-2 text-3xl font-bold">{show.name}</h1>
          <p className="mt-1 text-sm text-white/40">Season {season} · Episode {episodeNumber}{current?.name ? ` · ${current.name}` : ""}</p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55">{current?.overview || show.overview || "No description available."}</p>
        </section>

        {episodes.length ? <section className="mt-7 rounded-[22px] border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">Episodes</h2><span className="text-xs text-white/35">Season {season}</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{episodes.map(ep => <Link key={ep.id} href={`/watch/tv/${show.id}/${season}/${ep.episode_number}`} className={`group overflow-hidden rounded-2xl border bg-white/[0.025] transition hover:bg-white/[0.05] ${ep.episode_number === episodeNumber ? "border-red-500/70" : "border-white/[0.07]"}`}><div className="relative aspect-video bg-white/[0.03]">{ep.still_path ? <img src={backdrop(ep.still_path, "w500")} alt={ep.name} className="h-full w-full object-cover" /> : null}<span className="absolute left-2 top-2 rounded-md bg-black/75 px-2 py-1 text-[11px] font-semibold">E{ep.episode_number}</span></div><div className="p-3"><h3 className="font-medium">{ep.name}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-white/40">{ep.overview || "No episode description."}</p></div></Link>)}</div></section> : null}
      </main>
      <Footer />
    </div>
  );
}
