"use client";

import { FormEvent, useState } from "react";

type SearchBarProps = {
  onSearch: (query: string) => void;
  loading?: boolean;
};

export default function SearchBar({
  onSearch,
  loading = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = query.trim();

    if (!trimmed) return;

    onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-2xl gap-3">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search movies..."
          className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-900 px-5 pr-12 text-white outline-none transition placeholder:text-zinc-500 focus:border-white/30"
        />

        <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xl">
          🔍
        </span>
      </div>

      <button
        type="submit"
        disabled={loading || !query.trim()}
        className="h-14 rounded-2xl bg-white px-6 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}