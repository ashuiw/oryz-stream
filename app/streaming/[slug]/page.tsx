import StreamingProviderPage from "@/components/streaming/StreamingProviderPage";

export default async function StreamingProviderRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <StreamingProviderPage slug={slug} />;
}
