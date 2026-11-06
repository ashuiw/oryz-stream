import type { Metadata } from "next";
import StreamingProviderPage from "@/components/streaming/StreamingProviderPage";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${name}: what to watch`,
    description: `Browse movies and shows available on ${name}.`,
  };
}

export default async function StreamingProviderRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <StreamingProviderPage slug={slug} />;
}
