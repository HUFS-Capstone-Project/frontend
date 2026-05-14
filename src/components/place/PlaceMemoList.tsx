import { User } from "lucide-react";
import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";
import type { RoomPlaceMemo } from "@/shared/types/place-memo";

type PlaceMemoListProps = {
  memos?: RoomPlaceMemo[];
  className?: string;
};

export function PlaceMemoList({ memos, className }: PlaceMemoListProps) {
  const visibleMemos = memos?.filter((item) => item.memo.trim().length > 0) ?? [];

  if (visibleMemos.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "text-foreground border-border/50 bg-muted/20 rounded-lg border px-3 py-2 text-xs leading-relaxed font-medium",
        className,
      )}
    >
      <ul className="space-y-2">
        {visibleMemos.map((item) => (
          <li key={`${item.userId}-${item.updatedAt}`} className="flex min-w-0 items-start gap-2">
            <MemoAvatar memo={item} />
            <div className="min-w-0 flex-1">
              <span className="text-muted-foreground block truncate text-[0.68rem] leading-snug font-semibold">
                {item.nickname}
              </span>
              <p className="wrap-break-word whitespace-pre-wrap">{item.memo}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MemoAvatar({ memo }: { memo: RoomPlaceMemo }) {
  const url = memo.profileImageUrl?.trim() ?? "";
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(url) && failedUrl !== url;

  const handleImageError = useCallback(() => {
    setFailedUrl(url);
  }, [url]);

  if (showImage) {
    return (
      <img
        src={url}
        alt=""
        className="size-6 shrink-0 rounded-full object-cover"
        referrerPolicy="no-referrer"
        onError={handleImageError}
      />
    );
  }

  return (
    <span
      className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full"
      aria-hidden
    >
      <User className="size-3.5" strokeWidth={2} />
    </span>
  );
}
