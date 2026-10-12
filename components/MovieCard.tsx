"use client";

import { useRouter } from "next/navigation";

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
};

export default function MovieCard({ movie }: { movie: Movie }) {
  const router = useRouter();

  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/no-poster.png";

  const year = movie.release_date
    ? movie.release_date.substring(0, 4)
    : "N/A";

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-800">
        <img
          src={poster}
          alt={movie.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

        <button
          onClick={() => router.push(`/watch/${movie.id}`)}
          className="absolute bottom-4 left-4 right-4 rounded-xl bg-white px-4 py-2.5 font-semibold text-black opacity-0 transition duration-300 group-hover:opacity-100 hover:bg-zinc-200"
        >
          Watch
        </button>

        <div className="absolute right-3 top-3 rounded-lg bg-black/75 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
          ⭐ {movie.vote_average.toFixed(1)}
        </div>
      </div>

      <div className="p-4">
        <h2 className="truncate font-semibold text-white">
          {movie.title}
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          {year}
        </p>
      </div>
    </article>
  );
}