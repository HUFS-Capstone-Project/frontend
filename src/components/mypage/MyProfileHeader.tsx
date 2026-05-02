import { User } from "lucide-react";
import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";

type MyProfileHeaderProps = {
  nickname: string;
  profileImageUrl?: string | null;
  className?: string;
};

export function MyProfileHeader({ nickname, profileImageUrl, className }: MyProfileHeaderProps) {
  const url = profileImageUrl?.trim() ?? "";
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(url) && failedUrl !== url;

  const handleImageError = useCallback(() => {
    setFailedUrl(url);
  }, [url]);

  return (
    <header
      className={cn(
        "border-border/60 flex items-center gap-3 border-b bg-white px-5 py-5",
        className,
      )}
    >
      {showImage ? (
        <img
          src={url}
          alt=""
          className="size-11 shrink-0 rounded-full object-cover"
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />
      ) : (
        <span
          className="bg-muted text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-full"
          aria-hidden
        >
          <User className="size-5" strokeWidth={2} />
        </span>
      )}
      <p className="text-foreground text-[1rem] font-semibold">{nickname}</p>
    </header>
  );
}
