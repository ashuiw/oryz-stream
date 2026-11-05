"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Home, Film, Tv, Sparkles, Bookmark, Layers, LogIn } from "lucide-react";
import AuthStatus from "@/components/auth/AuthStatus";
import { useAuth } from "@/components/auth/AuthProvider";
import Avatar from "@/components/auth/Avatar";
import Logo from "@/components/Logo";
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
  if (loading) return <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />;
  if (!user) {
    return (
      <Link href="/login" aria-label="Sign in" className="grid h-10 w-10 place-items-center rounded-xl border border-gold-400/40 text-gold-300 transition hover:bg-gold-400/10">
        <LogIn size={17} />
      </Link>
    );
  }
  return (
    <Link href="/library" aria-label="Open your library" className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-gold-400/40 bg-gold-500 text-xs font-bold text-ink">
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
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The tab bar would sit on top of the player, so hide it (and its spacing) while watching.
  useEffect(() => {
    document.body.classList.toggle("no-tabbar", watching);
    return () => document.body.classList.remove("no-tabbar");
  }, [watching]);

  function openSearch() {
    router.push("/?search=open");
  }

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
      <header className="sticky top-0 z-[100] px-3 pt-3 sm:px-5">
        <nav
          aria-label="Main"
          className={`mx-auto flex max-w-[1280px] items-center gap-2 rounded-2xl border px-2.5 py-2 backdrop-blur-2xl transition-all duration-300 ${
            scrolled
              ? "border-gold-400/20 bg-ink/85 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.9)]"
              : "border-white/[0.07] bg-ink/45"
          }`}
        >
          <Link href="/" aria-label="Oryz home" className="flex shrink-0 items-center rounded-xl px-1.5 py-1 transition hover:opacity-90">
            <Logo size={34} />
          </Link>

          <div className="mx-1 hidden h-7 w-px bg-white/10 sm:block" />

          <div className="scrollbar-none hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto sm:flex">
            {links.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active ? "text-gold-200" : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <Icon size={15} strokeWidth={1.8} />
                  <span>{label}</span>
                  {active ? <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold-400" /> : null}
                </Link>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={openSearch}
              className="flex h-10 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/55 transition hover:border-gold-400/40 hover:text-white md:min-w-[200px]"
              aria-label="Search (press slash or Command K)"
            >
              <Search size={16} />
              <span className="hidden flex-1 text-left md:inline">Search titles</span>
              <span className="kbd hidden lg:inline-grid">⌘K</span>
            </button>

            <div className="hidden sm:block"><AuthStatus /></div>
            <div className="sm:hidden"><MobileAuth /></div>
          </div>
        </nav>
      </header>

      {/* Mobile bottom tab bar */}
      {!watching ? (
        <nav
          aria-label="Primary"
          className="glass fixed inset-x-0 bottom-0 z-[100] border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)] sm:hidden"
        >
          <div className="mx-auto grid max-w-md grid-cols-5">
            {tabs.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${
                    active ? "text-gold-300" : "text-white/45"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
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
