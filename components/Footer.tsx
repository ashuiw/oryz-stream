import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-gold-400/15">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-35"
        style={{ backgroundImage: "url(/brand/banner.jpg)" }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink via-ink/85 to-ink" />

      <div className="relative mx-auto grid max-w-[1280px] gap-10 px-5 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="mb-4"><Logo size={38} /></div>
          <p className="max-w-md text-sm leading-6 text-white/55">
            Discover movies, shows and anime in one calm, fast place. Metadata by TMDB.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-gold-200">Browse</h3>
          <div className="space-y-2.5 text-sm text-white/55">
            <Link className="block transition hover:text-gold-200" href="/movies">Movies</Link>
            <Link className="block transition hover:text-gold-200" href="/shows">Shows</Link>
            <Link className="block transition hover:text-gold-200" href="/anime">Anime</Link>
            <Link className="block transition hover:text-gold-200" href="/streaming">Streaming apps</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-gold-200">Credits</h3>
          <p className="text-sm leading-6 text-white/55">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>

      <div className="relative border-t border-white/[0.06] px-5 py-5 text-center text-xs text-white/35">
        © {new Date().getFullYear()} Oryz. All rights reserved.
      </div>
    </footer>
  );
}
