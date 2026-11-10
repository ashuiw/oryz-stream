export const TMDB_IMAGE = "https://image.tmdb.org/t/p";

export type Media = {
  id: number;
  media_type?: "movie" | "tv";
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  popularity?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
};

export function titleOf(item: Media) {
  return item.title || item.name || "Untitled";
}

export function yearOf(item: Media) {
  const date = item.release_date || item.first_air_date || "";
  return date ? date.slice(0, 4) : "";
}

export function poster(path?: string | null, size = "w500") {
  return path ? `${TMDB_IMAGE}/${size}${path}` : "/placeholder-poster.jpg";
}

export function backdrop(path?: string | null, size = "original") {
  return path ? `${TMDB_IMAGE}/${size}${path}` : "";
}

export function mediaType(item: Media) {
  return item.media_type || (item.first_air_date ? "tv" : "movie");
}


export const MOVIE_GENRES: { id: number; name: string }[] = [
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

export const TV_GENRES: { id: number; name: string }[] = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
];
