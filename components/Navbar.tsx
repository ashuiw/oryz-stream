"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Home, Film, Tv, Sparkles, Bookmark, Layers, LogIn } from "@/components/ui/icons";
import AuthStatus from "@/components/auth/AuthStatus";
import { useAuth } from "@/components/auth/AuthProvider";
import Avatar from "@/components/auth/Avatar";
import Logo from "@/components/Logo";
import ScrollProgress from "@/components/motion/ScrollProgress";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/shows", label: "Shows", icon: Tv },
  { href: "/anime", label: "Anime", icon: Sparkles },
  { href: "/streaming", label: "Streaming", icon: Layers },
  { href: "/library", label: "Library", icon: Bookmark },
];

// Bottom tab bar keeps the five most-used destinations one thumb-tap away.
const tabs = [links[0], links[1], links[2], links[4], links[5]];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function MobileAuth() {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />;
  if (!user) {
    return (
      <Link href="/login" aria-label="Sign in" className="grid h-9 w-9 place-items-center rounded-md border border-white/20 text-white/80">
        <LogIn size={18} weight="duotone" />
      </Link>
    );
  }
  return (
    <Link href="/library" aria-label="Open your library" className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-gold-500 text-xs font-bold text-ink">
      <Avatar urls={[profile?.avatar_url, user.user_metadata?.avatar_url, user.user_metadata?.picture]} fallback={profile?.display_name || user.email || "U"} className="h-full w-full object-cover" />
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const watching = pathname.startsWith("/watch");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The tab bar would sit on top of the player, so hide it (and its spacing) while watching.
  useEffect(() => {
    document.body.classList.toggle("no-tabbar", watching);
    return () => document.body.classList.remove("no-tabbar");
  }, [watching]);

  // ⌘K / Ctrl+K or "/" opens search from anywhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        router.push("/?search=open");
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        router.push("/?search=open");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <>
      <header
        className={`sticky top-0 z-[100] transition-colors duration-300 ${
          scrolled ? "border-b border-white/10 bg-ink/95 backdrop-blur-sm" : "border-b border-transparent bg-gradient-to-b from-ink/80 to-transparent"
        }`}
      >
        <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1280px] items-center gap-6 px-4 sm:px-5">
          <Link href="/" aria-label="Oryz home" className="flex shrink-0 items-center">
            <Logo size={32} />
          </Link>

          <div className="scrollbar-none hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto sm:flex">
            {links.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative shrink-0 px-3 py-5 text-sm font-semibold transition-colors ${
                    active ? "text-white" : "text-white/55 hover:text-white"
                  }`}
                >
                  {label}
                  <span className={`absolute inset-x-3 bottom-0 h-[3px] bg-gold-500 transition-transform duration-200 ${active ? "scale-x-100" : "scale-x-0"}`} />
                </Link>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => router.push("/?search=open")}
              className="flex h-10 items-center gap-2.5 rounded-md border border-white/15 px-3 text-sm text-white/60 transition hover:border-white/40 hover:text-white md:min-w-[210px]"
              aria-label="Search (press slash or Command K)"
            >
              <Search size={18} />
              <span className="hidden flex-1 text-left md:inline">Search titles</span>
              <span className="kbd hidden lg:inline-grid">/</span>
            </button>

            <div className="hidden sm:block"><AuthStatus /></div>
            <div className="sm:hidden"><MobileAuth /></div>
          </div>
        </nav>
        <ScrollProgress />
      </header>

      {/* Mobile bottom tab bar */}
      {!watching ? (
        <nav aria-label="Primary" className="glass fixed inset-x-0 bottom-0 z-[100] border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)] sm:hidden">
          <div className="mx-auto grid max-w-md grid-cols-5">
            {tabs.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                    active ? "text-gold-400" : "text-white/45"
                  }`}
                >
                  <Icon size={22} weight={active ? "duotone" : "regular"} />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </>
  );
}
