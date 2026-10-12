"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Clock3, Heart, LogIn, Play, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MediaPreviewModal from "@/components/MediaPreviewModal";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { Media } from "@/lib/tmdb";
import { backdrop, poster, titleOf, yearOf } from "@/lib/tmdb";

type MediaRow = { user_id: string; media_type: "movie" | "tv"; media_id: number; title: string; poster_path: string | null; backdrop_path: string | null; release_date: string | null; vote_average: number | null; liked: boolean; watch_later: boolean };
type Progress = MediaRow & { season_number: number | null; episode_number: number | null; episode_name: string | null; position_seconds: number; duration_seconds: number | null; progress_percent: number; updated_at: string };

export default function LibraryClient() {
  const { user, profile, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [saved, setSaved] = useState<MediaRow[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [history, setHistory] = useState<Progress[]>([]);
  const [selected, setSelected] = useState<Media | null>(null);
  const [selectedType, setSelectedType] = useState<"movie" | "tv">("movie");
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!user) return;
    setLoading(true);
    const [savedRes, progressRes, historyRes] = await Promise.all([
      supabase.from("media_library").select("*").eq("user_id", user.id).or("liked.eq.true,watch_later.eq.true").order("updated_at", { ascending: false }),
      supabase.from("watch_progress").select("*").eq("user_id", user.id).lt("progress_percent", 95).gt("position_seconds", 5).order("updated_at", { ascending: false }).limit(30),
      supabase.from("watch_history").select("*").eq("user_id", user.id).order("watched_at", { ascending: false }).limit(30),
    ]);
    if (!savedRes.error) setSaved((savedRes.data || []) as MediaRow[]);
    if (!progressRes.error) setProgress((progressRes.data || []) as Progress[]);
    if (!historyRes.error) setHistory((historyRes.data || []) as Progress[]);
    setLoading(false);
  }

  useEffect(() => { if (user) load(); else { setSaved([]); setProgress([]); setHistory([]); } }, [user]);

  function open(row: { media_type: "movie" | "tv"; media_id: number; title: string; poster_path: string | null; backdrop_path: string | null; release_date: string | null; vote_average: number | null }) {
    setSelectedType(row.media_type);
    setSelected({ id: row.media_id, media_type: row.media_type, title: row.media_type === "movie" ? row.title : undefined, name: row.media_type === "tv" ? row.title : undefined, poster_path: row.poster_path, backdrop_path: row.backdrop_path, release_date: row.media_type === "movie" ? row.release_date || undefined : undefined, first_air_date: row.media_type === "tv" ? row.release_date || undefined : undefined, vote_average: row.vote_average || undefined });
  }

  async function removeSaved(row: MediaRow) {
    await supabase.from("media_library").update({ liked: false, watch_later: false }).eq("user_id", user!.id).eq("media_type", row.media_type).eq("media_id", row.media_id);
    await load();
  }

  if (authLoading) return <div className="grid min-h-screen place-items-center bg-[#070707] text-sm text-white/40">Loading your library...</div>;

  if (!user) return (
    <div className="min-h-screen bg-[#070707] text-white">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-150px)] w-[min(620px,calc(100%-28px))] items-center justify-center py-16">
        <section className="w-full rounded-3xl border border-white/[0.07] bg-white/[0.025] p-8 text-center sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-600"><Bookmark size={22} /></div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-white/35">Oryz Library</p>
          <h1 className="mt-2 text-3xl font-bold">Your library starts here</h1>
          <p className="mt-3 text-sm leading-6 text-white/45">Sign in with Google to like titles, save watch-later picks, and continue movies and episodes from where you left off.</p>
          <GoogleSignInButton className="mt-7 px-6 py-3.5" />
        </section>
      </main>
      <Footer />
    </div>
  );

  const watchLater = saved.filter((x) => x.watch_later);
  const liked = saved.filter((x) => x.liked);

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <Navbar />
      <main className="mx-auto w-[min(1280px,calc(100%-28px))] pb-16 pt-10 sm:w-[min(1280px,calc(100%-40px))] sm:pt-12">
        <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">Oryz / Library</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{profile?.display_name ? `${profile.display_name}'s library` : "Your library"}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">Everything you save, like, and watch in one place.</p>
        </section>

        <div className="mt-8 space-y-10">
          <LibrarySection title="Continue watching" icon={<Clock3 size={16} />} empty="Start watching something and your progress will appear here.">
            {progress.map((item) => <ProgressCard key={`${item.media_type}-${item.media_id}-${item.season_number}-${item.episode_number}`} item={item} onOpen={() => open(item)} />)}
          </LibrarySection>

          <LibrarySection title="Watch later" icon={<Bookmark size={16} />} empty="Save movies and shows from their preview to build your list.">
            {watchLater.map((item) => <SavedCard key={`${item.media_type}-${item.media_id}`} item={item} onOpen={() => open(item)} onRemove={() => removeSaved(item)} />)}
          </LibrarySection>

          <LibrarySection title="Liked" icon={<Heart size={16} />} empty="Like something from its preview and it will appear here.">
            {liked.map((item) => <SavedCard key={`${item.media_type}-${item.media_id}`} item={item} onOpen={() => open(item)} onRemove={() => removeSaved(item)} />)}
          </LibrarySection>

          <LibrarySection title="Watch history" icon={<Clock3 size={16} />} empty="Your recently watched titles will appear here.">
            {history.map((item, index) => <HistoryCard key={`${item.media_type}-${item.media_id}-${item.season_number}-${item.episode_number}-${index}`} item={item} onOpen={() => open(item)} />)}
          </LibrarySection>
        </div>

        {loading ? <div className="mt-6 text-center text-xs text-white/30">Refreshing library...</div> : null}
      </main>
      <Footer />
      {selected ? <MediaPreviewModal item={selected} type={selectedType} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}

function LibrarySection({ title, icon, empty, children }: { title: string; icon: React.ReactNode; empty: string; children: React.ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : !!children;
  return <section><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-white/45">{icon}</span><h2 className="text-xl font-semibold">{title}</h2></div></div>{hasChildren ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{children}</div> : <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-sm text-white/35">{empty}</div>}</section>;
}

function toMedia(row: MediaRow): Media { return { id: row.media_id, media_type: row.media_type, title: row.media_type === "movie" ? row.title : undefined, name: row.media_type === "tv" ? row.title : undefined, poster_path: row.poster_path, backdrop_path: row.backdrop_path, release_date: row.media_type === "movie" ? row.release_date || undefined : undefined, first_air_date: row.media_type === "tv" ? row.release_date || undefined : undefined, vote_average: row.vote_average || undefined }; }

function SavedCard({ item, onOpen, onRemove }: { item: MediaRow; onOpen: () => void; onRemove: () => void }) {
  return <article className="group min-w-0"><button onClick={onOpen} className="block w-full text-left"><div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]"><img src={poster(item.poster_path)} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]" /></div><h3 className="mt-2 line-clamp-2 text-sm font-medium text-white/80">{item.title}</h3><p className="mt-1 text-xs text-white/30">{item.release_date?.slice(0, 4) || "—"}</p></button><button onClick={onRemove} className="mt-2 inline-flex items-center gap-1 text-xs text-white/25 hover:text-red-300"><Trash2 size={12} /> Remove</button></article>;
}

function ProgressCard({ item, onOpen }: { item: Progress; onOpen: () => void }) {
  const href = item.media_type === "tv" ? `/watch/tv/${item.media_id}/${item.season_number || 1}/${item.episode_number || 1}` : `/watch/movie/${item.media_id}`;
  return <article className="group min-w-0"><Link href={href} className="block"><div className="relative aspect-video overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]"><img src={backdrop(item.backdrop_path || item.poster_path)} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" /><span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 text-xs text-white"><Play size={11} fill="currentColor" /> Resume</span><div className="absolute inset-x-3 bottom-0 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full bg-red-500" style={{ width: `${Math.min(100, item.progress_percent || 0)}%` }} /></div></div></Link><h3 className="mt-2 line-clamp-1 text-sm font-medium text-white/80">{item.title}</h3><p className="mt-1 text-xs text-white/35">{item.media_type === "tv" ? `S${item.season_number} · E${item.episode_number}${item.episode_name ? ` · ${item.episode_name}` : ""}` : `${Math.round(item.progress_percent || 0)}% watched`}</p></article>;
}

function HistoryCard({ item, onOpen }: { item: Progress; onOpen: () => void }) {
  return <button onClick={onOpen} className="group min-w-0 text-left"><div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]"><img src={poster(item.poster_path)} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]" /></div><h3 className="mt-2 line-clamp-2 text-sm font-medium text-white/80">{item.title}</h3><p className="mt-1 text-xs text-white/30">{item.media_type === "tv" ? `S${item.season_number} · E${item.episode_number}` : "Movie"}</p></button>;
}
