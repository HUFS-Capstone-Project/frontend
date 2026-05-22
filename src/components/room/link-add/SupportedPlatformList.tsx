import type { CSSProperties } from "react";
import type { IconType } from "react-icons";
import { SiInstagram, SiNaver, SiYoutube } from "react-icons/si";

import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";
import { cn } from "@/lib/utils";

type SupportedPlatformListProps = {
  className?: string;
};

type PlatformItem = {
  key: string;
  label: string;
  Icon: IconType;
  iconClassName: string;
  iconBackgroundStyle?: CSSProperties;
};

const ICON_BOX_CLASS = "flex size-10 shrink-0 items-center justify-center rounded-[10px]";

const INSTAGRAM_ICON_BACKGROUND =
  "radial-gradient(circle at 30% 110%, #ffc500 0%, #ff9a00 22%, #ff4f1f 40%, transparent 58%), linear-gradient(135deg, #8a00ff 0%, #c400ff 18%, #ff00b8 38%, #ff0066 58%, #ff3d1b 76%, #ffb000 100%)";

const PLATFORM_ITEMS: PlatformItem[] = [
  {
    key: "instagram",
    label: PLACE_FLOW_COPY.unsupportedPlatformUrl.platforms.instagram,
    Icon: SiInstagram,
    iconClassName: "text-white",
    iconBackgroundStyle: { background: INSTAGRAM_ICON_BACKGROUND },
  },
  {
    key: "naver",
    label: PLACE_FLOW_COPY.unsupportedPlatformUrl.platforms.naverBlog,
    Icon: SiNaver,
    iconClassName: "bg-[#03C75A]/15 text-[#03C75A]",
  },
  {
    key: "youtube",
    label: PLACE_FLOW_COPY.unsupportedPlatformUrl.platforms.youtube,
    Icon: SiYoutube,
    iconClassName: "bg-[#FF0000]/12 text-[#FF0000]",
  },
];

const PLATFORM_CARD_CLASS =
  "bg-card flex min-w-0 flex-1 flex-col items-center gap-2.5 rounded-2xl px-2 py-5 shadow-[0_8px_24px_rgba(15,23,42,0.045)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(15,23,42,0.075)]";

export function SupportedPlatformList({ className }: SupportedPlatformListProps) {
  return (
    <ul className={cn("flex w-full gap-2.5", className)} aria-label="지원 플랫폼">
      {PLATFORM_ITEMS.map(({ key, label, iconClassName, iconBackgroundStyle, Icon }) => (
        <li key={key} className={PLATFORM_CARD_CLASS}>
          <span className={cn(ICON_BOX_CLASS, iconClassName)} style={iconBackgroundStyle}>
            <Icon className="size-5" aria-hidden />
          </span>
          <span className="text-foreground text-center text-xs leading-snug font-semibold">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
