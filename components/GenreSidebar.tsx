"use client";

import Link from "next/link";

import {
  FilmIcon,
  FlameIcon,
  StarIcon,
  GridIcon,
} from "./Icons";

type Genre = {
  id: number;
  name: string;
};

export default function GenreSidebar({
  genres,
  activeGenre,
  basePath,
  title,
}: {
  genres: Genre[];
  activeGenre: string;
  basePath: string;
  title: string;
}) {
  const main = [
    {
      label: `All ${title}`,
      icon: GridIcon,
      value: "",
    },
    {
      label: "Popular",
      icon: FlameIcon,
      value: "popular",
    },
    {
      label: "Top Rated",
      icon: StarIcon,
      value: "top-rated",
    },
  ];

  return (
    <aside
      className="
        hidden
        w-[225px]
        shrink-0
        lg:block
      "
    >
      <div className="sticky top-24">
        <div className="mb-4 px-3 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-600">
          Browse
        </div>

        <div className="space-y-1">
          {main.map((item) => {
            const active =
              activeGenre === item.value;

            const Icon = item.icon;

            const href =
              item.value === ""
                ? basePath
                : `${basePath}?filter=${item.value}`;

            return (
              <Link
                key={item.label}
                href={href}
                className={`
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-xs
                  font-medium
                  transition
                  ${
                    active
                      ? "bg-white/[0.14] text-white"
                      : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"
                  }
                `}
              >
                <Icon size={15} />

                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mb-3 mt-8 px-3 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-600">
          Genres
        </div>

        <div className="space-y-1">
          {genres.map((genre) => {
            const active =
              activeGenre ===
              String(genre.id);

            return (
              <Link
                key={genre.id}
                href={`${basePath}?genre=${genre.id}`}
                className={`
                  block
                  rounded-xl
                  px-3
                  py-2.5
                  text-xs
                  font-medium
                  transition
                  ${
                    active
                      ? "bg-white/[0.10] text-white"
                      : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"
                  }
                `}
              >
                {genre.name}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}