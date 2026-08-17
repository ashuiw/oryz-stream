export type Provider = {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
  logo_url?: string | null;
  slug: string;
};

export type MediaItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
};

export const GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" },
];

export const PROVIDER_ORDER = [
  "netflix",
  "prime-video",
  "disney-plus",
  "hulu",
  "max",
  "apple-tv-plus",
  "paramount-plus",
  "peacock",
  "crunchyroll",
];

export const PROVIDER_LABELS: Record<string, string> = {
  netflix: "Netflix",
  "prime-video": "Amazon Prime Video",
  "disney-plus": "Disney+",
  hulu: "Hulu",
  max: "Max",
  "apple-tv-plus": "Apple TV+",
  "paramount-plus": "Paramount+",
  peacock: "Peacock",
  crunchyroll: "Crunchyroll",
};

export function posterUrl(path?: string | null, size = "w500") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : "";
}
