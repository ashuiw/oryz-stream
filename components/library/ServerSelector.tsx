"use client";

import {
  ChevronDown,
  Server,
} from "lucide-react";

import type {
  ServerOption,
} from "./WatchPlayer";

type Props = {
  value: ServerOption;
  onChange: (
    value: ServerOption,
  ) => void;
};

export default function ServerSelector({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative w-full sm:w-auto">
      <label
        className="
          flex
          h-11
          w-full
          min-w-0
          items-center
          gap-2
          rounded-xl
          border
          border-white/10
          bg-white/[0.04]
          px-3
          text-sm
          text-white/80
          shadow-lg
          backdrop-blur-xl
          sm:w-[190px]
        "
      >
        <Server
          size={16}
          className="
            shrink-0
            text-white/50
          "
        />

        <span className="sr-only">
          Select streaming server
        </span>

        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target
                .value as ServerOption,
            )
          }
          aria-label="Select streaming server"
          className="
            min-w-0
            flex-1
            cursor-pointer
            appearance-none
            bg-transparent
            pr-7
            text-sm
            font-medium
            text-white
            outline-none
          "
        >
          <option
            value="server1"
            className="
              bg-[#111]
              text-white
            "
          >
            Server 1
          </option>

          <option
            value="server2"
            className="
              bg-[#111]
              text-white
            "
          >
            Server 2
          </option>

          <option
            value="server3"
            className="
              bg-[#111]
              text-white
            "
          >
            Server 3
          </option>
        </select>

        <ChevronDown
          size={15}
          className="
            pointer-events-none
            absolute
            right-3
            text-white/45
          "
        />
      </label>
    </div>
  );
}