import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.07] bg-black/30">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-600 font-black text-white">
              O
            </span>
            <span className="text-lg font-semibold text-white">Oryz</span>
          </div>
          <p className="max-w-md text-sm leading-6 text-white/45">
            Discover movies, shows and anime through a clean, responsive
            interface powered by TMDB metadata.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">Browse</h3>
          <div className="space-y-2 text-sm text-white/45">
            <Link className="block hover:text-white" href="/movies">Movies</Link>
            <Link className="block hover:text-white" href="/shows">Shows</Link>
            <Link className="block hover:text-white" href="/anime">Anime</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">Credits</h3>
          <p className="text-sm leading-6 text-white/45">
            This product uses the TMDB API but is not endorsed or certified by
            TMDB.
          </p>
        </div>
      </div>

      <div className="border-t border-white/[0.06] px-5 py-5 text-center text-xs text-white/30">
        © {new Date().getFullYear()} Oryz. All rights reserved.
      </div>
    </footer>
  );
}
