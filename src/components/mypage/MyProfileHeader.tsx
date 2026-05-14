import { ChevronRight, User } from "lucide-react";
import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";

type MyProfileHeaderProps = {
  nickname: string;
  profileImageUrl?: string | null;
  onOpenProfile?: () => void;
  className?: string;
};

export function MyProfileHeader({
  nickname,
  profileImageUrl,
  onOpenProfile,
  className,
}: MyProfileHeaderProps) {
  const url = profileImageUrl?.trim() ?? "";
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(url) && failedUrl !== url;

  const handleImageError = useCallback(() => {
    setFailedUrl(url);
  }, [url]);

  return (
    <button
      type="button"
      onClick={onOpenProfile}
      className={cn(
        "flex w-full items-center gap-3 px-1 py-4 text-left active:opacity-75",
        className,
      )}
    >
      {showImage ? (
        <img
          src={url}
          alt=""
          className="size-12 shrink-0 rounded-full object-cover"
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />
      ) : (
        <span
          className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-full"
          aria-hidden
        >
          <User className="size-5" strokeWidth={2} />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="text-foreground block truncate text-[1.05rem] font-bold">{nickname}</span>
        <span className="text-muted-foreground mt-0.5 block truncate text-[0.78rem] font-medium">
          내 정보 • 계정 설정
        </span>
      </span>

      <ChevronRight className="text-muted-foreground/55 size-5 shrink-0" aria-hidden />
    </button>
  );
}
