import { useId } from "react";

/** The Oryz mark: three gold petals around a small hub. Scales crisply at any size. */
export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const petal =
    "M540 238C485 285 462 350 478 430C488 470 510 500 540 516C570 500 592 470 602 430C618 350 595 285 540 238Z";
  return (
    <svg
      width={size}
      height={size}
      viewBox="250 215 580 510"
      className={className}
      role="img"
      aria-label="Oryz"
    >
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1dd9f" />
          <stop offset="0.5" stopColor="#d9a441" />
          <stop offset="1" stopColor="#a8832f" />
        </linearGradient>
      </defs>
      {[0, 120, 240].map((deg) => (
        <path key={deg} d={petal} fill={`url(#g-${id})`} transform={`rotate(${deg} 540 540)`} />
      ))}
      <circle cx="540" cy="540" r="68" fill="#110f0b" />
      <path d="M520 503c-5-3-11 1-11 7v60c0 6 6 10 11 7l60-36c5-3 5-11 0-14z" fill="#f5de93" />
    </svg>
  );
}

export default function Logo({ size = 34, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      {withWordmark ? (
        <span className="text-[1.35rem] font-semibold leading-none tracking-[-0.04em] text-white">Oryz</span>
      ) : null}
    </span>
  );
}
