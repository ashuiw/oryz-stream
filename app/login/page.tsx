import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "@/components/ui/icons";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LogoMark } from "@/components/Logo";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { createClient } from "@/lib/supabase/server";


export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
  description: "Sign in to Oryz to save favorites, build a watch-later list and resume across devices.",
};

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // A signed-in user should never see the login screen again.
  if (user) redirect("/");

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-140px)] w-[min(520px,calc(100%-28px))] items-center py-16">
        <section className="w-full relative overflow-hidden rounded-lg border border-gold-400/20 bg-surface/80 p-7 text-center shadow-glow backdrop-blur-xl sm:p-10">
          <Link href="/" aria-label="Oryz home" className="mx-auto grid h-20 w-20 place-items-center"><LogoMark size={80} /></Link>
          <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">Sign in to your library</h1>
          <p className="mt-3 text-sm leading-6 text-white/45">Save favorites, keep a watch-later list, and continue movies and episodes from where you stopped.</p>
          <GoogleSignInButton className="mt-7 w-full py-3.5" />
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-white/30"><ShieldCheck size={14} /> Your account is handled by Supabase Auth.</div>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"><ArrowLeft size={15} /> Back to Oryz</Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
