"use client";

import { useEffect, useState } from "react";
import { Search, Home, Film, Tv, Sparkles, Bookmark, Layers, LayoutGrid, X } from "lucide-react";
import AuthStatus from "@/components/auth/AuthStatus";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/components/auth/AuthProvider";
import Avatar from "@/components/auth/Avatar";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/shows", label: "Shows", icon: Tv },
  { href: "/anime", label: "Anime", icon: Sparkles },
  { href: "/streaming", label: "Streaming", icon: Layers },
  { href: "/library", label: "Library", icon: Bookmark },
];

function MobileAccount() {
  const { user, profile, signOut } = useAuth();
  if (!user) return <GoogleSignInButton className="w-full" />;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] p-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-red-600 text-xs font-bold">
          <Avatar urls={[profile?.avatar_url, user.user_metadata?.avatar_url, user.user_metadata?.picture]} fallback={profile?.display_name || user.email || "U"} className="h-full w-full object-cover" />
        </span>
        <span className="truncate text-sm text-white/70">{profile?.display_name || user.email}</span>
      </div>
      <button onClick={() => signOut()} className="rounded-lg px-2 py-1.5 text-xs text-white/45 hover:bg-white/10 hover:text-white">Sign out</button>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function openSearch() {
    setMenuOpen(false);
    router.push("/?search=open");
  }

  function go(href: string) {
    setMenuOpen(false);
    router.push(href);
  }

  return (
    <header className="sticky top-0 z-[100] px-3 pt-3 sm:px-5">
      <nav className="oryz-navbar mx-auto flex max-w-[1280px] items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/65 px-2 py-2 shadow-2xl backdrop-blur-2xl">
        <button
          onClick={() => go("/")}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-600 text-lg font-black text-white transition hover:bg-red-500"
          aria-label="Home"
        >
          O
        </button>

        <div className="hidden h-7 w-px bg-white/10 sm:block" />

        <div className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-none sm:flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <button
                key={href}
                onClick={() => go(href)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <Icon size={15} strokeWidth={1.8} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={openSearch}
            className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/[0.07] hover:text-white"
            aria-label="Search"
          >
            <Search size={17} />
            <span className="hidden md:inline">Search</span>
          </button>

          <div className="hidden sm:block"><AuthStatus /></div>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-white/80 transition hover:bg-white/[0.1] sm:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <LayoutGrid size={19} />}
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <>
          <button
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          />
          <div className="relative z-50 mx-auto mt-2 max-w-[1280px] rounded-2xl border border-white/[0.08] bg-[#0b0b0b]/95 p-2 shadow-2xl backdrop-blur-2xl sm:hidden">
            <div className="grid grid-cols-2 gap-1">
              {links.map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/"
                    ? pathname === "/"
                    : pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <button
                    key={href}
                    onClick={() => go(href)}
                    className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-left text-sm transition ${
                      active
                        ? "bg-white/12 text-white"
                        : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                    <span>{label}</span>
                  </button>
                );
              })}
              <div className="mt-1 border-t border-white/[0.07] pt-2">
                <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">Account</div>
                <MobileAccount />
              </div>
              <button
                onClick={openSearch}
                className="flex min-h-12 items-center gap-3 rounded-xl px-4 text-left text-sm text-white/55 transition hover:bg-white/[0.06] hover:text-white"
              >
                <Search size={17} />
                <span>Search</span>
              </button>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
