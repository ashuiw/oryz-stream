"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { backdrop, poster } from "@/lib/tmdb";
import { useParams } from "next/navigation";
import VidKingWatchFrame from "@/components/library/VidKingWatchFrame";

type Movie = {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  vote_average?: number;
  runtime?: number;
  genres?: { id: number; name: string }[];
};

export default function MovieWatchPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/tmdb?type=movie&mode=details&id=${id}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Unable to load movie");
        return data;
      })
      .then(setMovie)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <WatchError message={error} />;
  if (!movie) return <Loading />;

  return (
    <div className="oryz-watch-page min-h-screen bg-[#070707] text-white">
      <Navbar />
      <main className="mx-auto w-[min(1280px,calc(100%-28px))] pb-16 pt-10 sm:w-[min(1280px,calc(100%-40px))] sm:pt-12">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/55 hover:text-white">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="oryz-player-frame overflow-hidden rounded-[22px] border border-white/[0.08] bg-black shadow-2xl">
          <div className="aspect-video w-full">
            <VidKingWatchFrame
              mediaType="movie"
              mediaId={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              backdropPath={movie.backdrop_path}
              releaseDate={movie.release_date}
              voteAverage={movie.vote_average}
            />
          </div>
        </div>

        <section className="mt-7 grid gap-6 rounded-[22px] border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5 md:grid-cols-[180px_minmax(0,1fr)]">
          <img src={poster(movie.poster_path, "w500")} alt={movie.title} className="w-full rounded-2xl object-cover" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">Oryz · Now playing</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{movie.title}</h1>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-white/45">
              {movie.release_date?.slice(0, 4) ? <span>{movie.release_date.slice(0, 4)}</span> : null}
              {movie.vote_average ? <span>★ {movie.vote_average.toFixed(1)}</span> : null}
              {movie.runtime ? <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span> : null}
            </div>
            {movie.genres?.length ? <div className="mt-4 flex flex-wrap gap-2">{movie.genres.map((g) => <span key={g.id} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/55">{g.name}</span>)}</div> : null}
            <p className="mt-5 max-w-3xl leading-7 text-white/55">{movie.overview || "No description available."}</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Loading() {
  return <div className="grid min-h-screen place-items-center bg-[#070707] text-sm text-white/40">Loading...</div>;
}
function WatchError({ message }: { message: string }) {
  return <div className="grid min-h-screen place-items-center bg-[#070707] px-6 text-center text-white"><div><h1 className="text-2xl font-bold">Unable to load this movie</h1><p className="mt-2 text-white/45">{message}</p><Link href="/" className="mt-5 inline-block rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black">Back home</Link></div></div>;
}
