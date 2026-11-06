export default function Loading() {
  return (
    <div className="min-h-screen" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-16 w-full" />
      <div className="mx-auto mt-6 grid max-w-[1280px] grid-cols-2 gap-4 px-4 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[2/3] rounded-lg" />
        ))}
      </div>
    </div>
  );
}
