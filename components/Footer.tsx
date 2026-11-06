import Link from "next/link";
import Logo from "@/components/Logo";

const browse = [
  { href: "/movies", label: "Movies" },
  { href: "/shows", label: "Shows" },
  { href: "/anime", label: "Anime" },
  { href: "/streaming", label: "Streaming apps" },
];

const account = [
  { href: "/library", label: "Your library" },
  { href: "/login", label: "Sign in" },
];

export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/10">
      <div aria-hidden className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url(/brand/banner.jpg)" }} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink via-ink/85 to-ink" />

      <div className="relative mx-auto grid max-w-[1280px] gap-10 px-4 py-14 sm:px-5 md:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
        <div>
          <Link href="/" aria-label="Oryz home" className="mb-4 inline-flex"><Logo size={38} /></Link>
          <p className="max-w-sm text-sm leading-6 text-white/60">
            A fast, clean place to discover movies, shows and anime, and pick up where you left off.
          </p>
        </div>

        <nav aria-label="Browse">
          <h2 className="mb-4 text-base text-white">Browse</h2>
          <ul className="space-y-2.5 text-sm text-white/60">
            {browse.map((l) => (
              <li key={l.href}><Link className="transition hover:text-gold-400" href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account">
          <h2 className="mb-4 text-base text-white">Account</h2>
          <ul className="space-y-2.5 text-sm text-white/60">
            {account.map((l) => (
              <li key={l.href}><Link className="transition hover:text-gold-400" href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-base text-white">Credits</h2>
          <p className="text-sm leading-6 text-white/60">
            Movie and show data from{" "}
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-gold-400 underline-offset-4 hover:underline">TMDB</a>
            . This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>

      <div className="relative border-t border-white/10 px-4 py-5 text-center text-xs text-white/45">
        © <span suppressHydrationWarning>{new Date().getFullYear()}</span> Oryz. All rights reserved.
      </div>
    </footer>
  );
}
