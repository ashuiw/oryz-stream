// One icon source for the whole site: Phosphor (duotone/fill weights give a more
// finished, editorial feel than thin outline sets). Names match the old Lucide
// ones so existing call sites keep working. Uses the SSR entry, so it is safe in
// both server and client components.
import type { CSSProperties, ElementType } from "react";
import {
  ArrowLeft as PhArrowLeft,
  ArrowRight as PhArrowRight,
  ArrowUp as PhArrowUp,
  BookmarkSimple,
  CalendarBlank,
  Check as PhCheck,
  CaretDown,
  CaretLeft,
  CaretRight,
  Clock as PhClock,
  FilmSlate,
  Fire,
  Heart as PhHeart,
  House,
  Info as PhInfo,
  Stack,
  SignIn,
  SignOut,
  Play as PhPlay,
  MagnifyingGlass,
  HardDrives,
  ShieldCheck as PhShieldCheck,
  DeviceMobile,
  Sparkle,
  Star as PhStar,
  Trash,
  Television,
  Key,
  UserCircle,
  Users as PhUsers,
  X as PhX,
  DiceFive,
  ShareNetwork,
  Plus as PhPlus,
  Command as PhCommand,
} from "@phosphor-icons/react/dist/ssr";

type Weight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";

export type IconProps = {
  size?: number | string;
  className?: string;
  color?: string;
  style?: CSSProperties;
  weight?: Weight;
  /** Lucide compatibility: a fill value switches to the filled weight. */
  fill?: string;
  /** Lucide compatibility: ignored (Phosphor uses weights instead). */
  strokeWidth?: number | string;
};

function make(Ph: ElementType, defaultWeight: Weight = "regular") {
  return function Icon({ fill, strokeWidth: _s, weight, ...rest }: IconProps) {
    const w: Weight = weight ?? (fill && fill !== "none" ? "fill" : defaultWeight);
    return <Ph weight={w} aria-hidden="true" {...rest} />;
  };
}

export const ArrowLeft = make(PhArrowLeft);
export const ArrowRight = make(PhArrowRight);
export const ArrowUp = make(PhArrowUp);
export const Bookmark = make(BookmarkSimple);
export const CalendarDays = make(CalendarBlank);
export const Check = make(PhCheck, "bold");
export const ChevronDown = make(CaretDown, "bold");
export const ChevronLeft = make(CaretLeft, "bold");
export const ChevronRight = make(CaretRight, "bold");
export const Clock = make(PhClock);
export const Clock3 = make(PhClock);
export const Film = make(FilmSlate);
export const Flame = make(Fire);
export const Heart = make(PhHeart);
export const Home = make(House);
export const Info = make(PhInfo);
export const Layers = make(Stack);
export const LogIn = make(SignIn);
export const LogOut = make(SignOut);
export const Play = make(PhPlay, "fill");
export const Search = make(MagnifyingGlass);
export const Server = make(HardDrives);
export const ShieldCheck = make(PhShieldCheck);
export const Smartphone = make(DeviceMobile);
export const Sparkles = make(Sparkle);
export const Star = make(PhStar);
export const Trash2 = make(Trash);
export const Tv = make(Television);
export const UserKey = make(Key);
export const UserRound = make(UserCircle);
export const Users = make(PhUsers);
export const X = make(PhX);
export const Dice = make(DiceFive);
export const Share = make(ShareNetwork);
export const Plus = make(PhPlus);
export const CommandKey = make(PhCommand);
