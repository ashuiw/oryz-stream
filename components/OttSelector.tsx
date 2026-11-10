"use client";

type Provider = {
  id: number;
  name: string;
  logo: string;
};

const providers: Provider[] = [
  {
    id: 8,
    name: "Netflix",
    logo: "/ott/netflix.svg",
  },
  {
    id: 9,
    name: "Prime Video",
    logo: "/ott/prime.svg",
  },
  {
    id: 337,
    name: "Disney+",
    logo: "/ott/disney.svg",
  },
  {
    id: 15,
    name: "Hulu",
    logo: "/ott/hulu.svg",
  },
  {
    id: 384,
    name: "HBO Max",
    logo: "/ott/hbo.svg",
  },
  {
    id: 350,
    name: "Apple TV+",
    logo: "/ott/apple.svg",
  },
  {
    id: 531,
    name: "Paramount+",
    logo: "/ott/paramount.svg",
  },
  {
    id: 386,
    name: "Peacock",
    logo: "/ott/peacock.svg",
  },
];

export default function OttSelector({
  onSelect,
}: {
  onSelect: (
    providerId: number,
    providerName: string
  ) => void;
}) {
  return (
    <div className="flex w-full justify-center">
      <div
        className="
          grid
          w-full
          max-w-[1050px]
          grid-cols-2
          gap-3
          sm:grid-cols-4
          lg:grid-cols-8
        "
      >
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() =>
              onSelect(
                provider.id,
                provider.name
              )
            }
            className="
              group
              relative
              flex
              h-[86px]
              items-center
              justify-center
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.06]
              bg-[#0b0b0c]
              p-5
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-white/[0.15]
              hover:bg-[#111113]
              hover:shadow-xl
              hover:shadow-black/30
              active:scale-[0.98]
              sm:h-[92px]
            "
          >
            {/* subtle hover glow */}
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                opacity-0
                transition
                duration-300
                group-hover:opacity-100
              "
            >
              <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-2xl" />
            </div>

            <img
              src={provider.logo}
              alt={provider.name}
              className="
                relative
                z-10
                max-h-8
                max-w-[105px]
                object-contain
                opacity-75
                grayscale
                transition
                duration-300
                group-hover:scale-105
                group-hover:opacity-100
                group-hover:grayscale-0
              "
            />
          </button>
        ))}
      </div>
    </div>
  );
}