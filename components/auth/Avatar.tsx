"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  urls?: Array<string | null | undefined>;
  fallback?: string;
  className?: string;
  alt?: string;
};

export default function Avatar({ urls = [], fallback = "U", className = "h-full w-full", alt = "" }: Props) {
  const sources = useMemo(() => Array.from(new Set(urls.filter((url): url is string => Boolean(url && url.trim())))), [urls]);
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [sources.join("|")]);

  const src = sources[index];
  if (!src) {
    return <span className="grid h-full w-full place-items-center bg-red-600 text-xs font-bold text-white">{fallback.slice(0, 1).toUpperCase()}</span>;
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setIndex((current) => current + 1)}
    />
  );
}
