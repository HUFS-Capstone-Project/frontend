import { UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

type ProfilePlaceholderProps = {
  className?: string;
  size?: "lg" | "md";
};

/**
 * 중앙 원형 프로필 placeholder (추후 프로필 설정 시 재사용 가능).
 */
export function ProfilePlaceholder({
  className,
  size = "lg",
}: ProfilePlaceholderProps) {
  const dim = size === "lg" ? "h-36 w-36" : "h-28 w-28";
  const icon = size === "lg" ? "h-16 w-16" : "h-12 w-12";

  return (
    <div
      className={cn(
        "mx-auto flex items-center justify-center rounded-full bg-gradient-to-b from-[var(--brand-coral-gradient-from)] to-[var(--brand-coral-gradient-to)] shadow-none",
        dim,
        className,
      )}
      aria-hidden
    >
      <UserRound className={cn("text-white/95", icon)} strokeWidth={1.25} />
    </div>
  );
}
