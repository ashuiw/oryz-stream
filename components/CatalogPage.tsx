"use client";

import { useEffect, useState } from "react";

import {
  Media,
  MOVIE_GENRES,
  TV_GENRES,
} from "@/lib/tmdb";

import MediaGrid from "./MediaGrid";
import GenreSidebar from "./GenreSidebar";

type CatalogType =
  | "movie"
  | "tv"
  | "anime";

export default function CatalogPage({
  type,
  title,
  description,
}: {
  type: CatalogType;
  title: string;
  description: string;
}) {
  const [items, setItems] =
    useState<Media[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] =
    useState(true);

  const [genre, setGenre] =
    useState("");

  const genres =
    type === "movie"
      ? MOVIE_GENRES
      : TV_GENRES;

  const load = async (
    nextPage: number,
    append = false
  ) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params =
        new URLSearchParams();

      params.set(
        "type",
        type === "anime"
          ? "tv"
          : type
      );

      params.set(
        "page",
        String(nextPage)
      );

      if (type === "anime") {
        params.set("anime", "true");
      } else if (genre) {
        params.set("genre", genre);
      }

      const response =
        await fetch(
          `/api/tmdb?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      const newItems =
        data.results || [];

      setItems((previous) =>
        append
          ? [...previous, ...newItems]
          : newItems
      );

      setPage(nextPage);

      setHasMore(
        nextPage <
          (data.total_pages || 1)
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);

    load(1, false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, genre]);

  /*
   * Infinite scrolling
   */

  useEffect(() => {
    const handleScroll = () => {
      if (
        loading ||
        loadingMore ||
        !hasMore
      ) {
        return;
      }

      const bottom =
        window.innerHeight +
          window.scrollY >=
        document.documentElement
          .scrollHeight - 1000;

      if (bottom) {
        load(page + 1, true);
      }
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, [
    page,
    loading,
    loadingMore,
    hasMore,
  ]);

  /*
   * Read genre from URL.
   */

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    setGenre(
      params.get("genre") || ""
    );
  }, []);

  return (
    <main className="min-h-screen px-4 pb-24 pt-28 sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto flex max-w-[1500px] gap-10">
        <GenreSidebar
          genres={genres}
          activeGenre={genre}
          basePath={
            type === "movie"
              ? "/movies"
              : type === "tv"
                ? "/shows"
                : "/anime"
          }
          title={title}
        />

        <section className="min-w-0 flex-1">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h1
                className="
                  text-3xl
                  font-semibold
                  tracking-[-0.04em]
                  text-white
                  sm:text-4xl
                "
              >
                {title}
              </h1>

              <p className="mt-2 max-w-xl text-sm text-zinc-500">
                {description}
              </p>
            </div>

            <div
              className="
                hidden
                rounded-full
                border
                border-white/[0.07]
                bg-white/[0.03]
                px-4
                py-2
                text-xs
                text-zinc-500
                sm:block
              "
            >
              {items.length} titles
            </div>
          </div>

          {/* Mobile genre navigation */}

          <div className="mb-7 overflow-x-auto lg:hidden">
            <div className="flex w-max gap-2">
              <button
                onClick={() =>
                  setGenre("")
                }
                className={`
                  rounded-full
                  border
                  px-4
                  py-2.5
                  text-xs
                  ${
                    !genre
                      ? "border-white bg-white text-black"
                      : "border-white/[0.08] text-zinc-500"
                  }
                `}
              >
                All
              </button>

              {genres.map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    setGenre(
                      String(item.id)
                    )
                  }
                  className={`
                    rounded-full
                    border
                    px-4
                    py-2.5
                    text-xs
                    whitespace-nowrap
                    ${
                      genre ===
                      String(item.id)
                        ? "border-white bg-white text-black"
                        : "border-white/[0.08] text-zinc-500"
                    }
                  `}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingGrid />
          ) : items.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center text-sm text-zinc-600">
              No titles found.
            </div>
          ) : (
            <>
              <MediaGrid
                items={items}
              />

              {loadingMore && (
                <div className="mt-12 flex justify-center">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-white" />
                </div>
              )}

              {!hasMore && (
                <div className="mt-14 text-center text-xs text-zinc-700">
                  You reached the end of the catalog.
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function LoadingGrid() {
  return (
    <div
      className="
        grid
        grid-cols-2
        gap-3
        sm:grid-cols-3
        lg:grid-cols-4
        xl:grid-cols-5
        2xl:grid-cols-6
      "
    >
      {Array.from({
        length: 18,
      }).map((_, i) => (
        <div
          key={i}
          className="
            overflow-hidden
            rounded-[17px]
            border
            border-white/[0.04]
            bg-white/[0.02]
          "
        >
          <div className="aspect-[2/3] animate-pulse bg-white/[0.04]" />

          <div className="space-y-2 p-3">
            <div className="h-3 w-4/5 animate-pulse rounded bg-white/[0.04]" />
            <div className="h-2 w-1/3 animate-pulse rounded bg-white/[0.03]" />
          </div>
        </div>
      ))}
    </div>
  );
}