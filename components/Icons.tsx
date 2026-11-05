type IconProps = {
  size?: number;
  strokeWidth?: number;
};

const base = (
  size: number,
  strokeWidth: number
) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function HomeIcon({
  size = 17,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

export function FilmIcon({
  size = 17,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <path d="m8 5 3 4M16 5l-3 4M8 19l3-4M16 19l-3-4" />
    </svg>
  );
}

export function TvIcon({
  size = 17,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <path d="m9 2 3 3 3-3" />
      <path d="M8 10h.01M12 10h.01M16 10h.01" />
      <path d="M8 14h.01M12 14h.01M16 14h.01" />
    </svg>
  );
}

export function StarIcon({
  size = 17,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />
    </svg>
  );
}

export function SearchIcon({
  size = 17,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

export function FlameIcon({
  size = 17,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M12 22c4 0 7-2.8 7-7 0-3.4-2-6.1-4.4-8.6.1 2.1-1 3.7-2.5 4.6.2-3.7-1.6-6.3-3.6-8C8.7 7.7 5 10.7 5 15c0 4.2 3 7 7 7Z" />
    </svg>
  );
}

export function GridIcon({
  size = 17,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function ChevronLeft({
  size = 18,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronRight({
  size = 18,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}