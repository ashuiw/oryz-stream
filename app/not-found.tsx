import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return <div className="min-h-screen text-white"><Navbar /><main className="oryz-error-page"><section className="oryz-error-card"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/[.06] text-pink-300"><Compass size={26}/></div><p className="mt-6 text-xs font-bold uppercase tracking-[.24em] text-pink-300/80">Lost in the stream</p><h1 className="mt-3 text-5xl font-black tracking-tight sm:text-7xl">404</h1><p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/50">This title or page has moved off the schedule. Let’s get you back to something good.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black"><Home size={16}/> Go home</Link><Link href="/?search=open" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.05] px-5 py-3 text-sm font-semibold"><Search size={16}/> Search titles</Link></div></section></main><Footer/></div>;
}
