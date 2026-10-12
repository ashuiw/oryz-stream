import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // A signed-in user should never see the login screen again.
  if (user) redirect("/");

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-140px)] w-[min(520px,calc(100%-28px))] items-center py-16">
        <section className="w-full rounded-3xl border border-white/[0.07] bg-white/[0.025] p-7 text-center shadow-2xl sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-600 text-xl font-black">O</div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-white/35">Your Oryz account</p>
          <h1 className="mt-2 text-3xl font-bold">Sign in to your library</h1>
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
