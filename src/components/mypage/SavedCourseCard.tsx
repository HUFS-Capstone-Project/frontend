import { ChevronRight, Heart, User, UsersRound } from "lucide-react";
import { useCallback, useState } from "react";

import { RoomAvatar } from "@/components/room/RoomAvatar";
import { cn } from "@/lib/utils";
import type { SavedCourse } from "@/shared/types/course";

type SavedCourseCardProps = {
  course: SavedCourse;
  onSelect?: (course: SavedCourse) => void;
  className?: string;
};

export function SavedCourseCard({ course, onSelect, className }: SavedCourseCardProps) {
  const isFriendCourse = course.badgeLabel === "친구";
  const Icon = isFriendCourse ? UsersRound : Heart;
  const saverNickname = course.savedByNickname?.trim() ?? "";
  const roomName = course.savedFromRoomName?.trim() ?? "";
  const roomAvatarSeed = course.savedFromRoomAvatarSeed?.trim() ?? "";
  const hasSaver = saverNickname.length > 0 || Boolean(course.savedByProfileImageUrl?.trim());
  const metadata = saverNickname
    ? `${saverNickname}님이 저장 · ${course.executedAtLabel}`
    : roomName
      ? `${roomName}에서 저장 · ${course.executedAtLabel}`
      : course.executedAtLabel;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(course)}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left",
        "active:bg-muted/45 transition-colors",
        className,
      )}
    >
      {hasSaver ? (
        <SaverAvatar imageUrl={course.savedByProfileImageUrl} />
      ) : roomAvatarSeed ? (
        <span className="size-9 shrink-0 overflow-hidden rounded-full">
          <RoomAvatar avatarSeed={roomAvatarSeed} size="100%" />
        </span>
      ) : (
        <span className="bg-brand-coral-soft text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
          {isFriendCourse ? (
            <span className="text-[0.65rem] font-semibold">친구</span>
          ) : (
            <Icon className="size-3.5 fill-current" aria-hidden />
          )}
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="text-foreground block truncate text-[0.8rem] font-semibold">
          {course.title}
        </span>
        <span className="text-muted-foreground mt-0.5 block truncate text-[0.66rem] font-medium">
          {metadata}
        </span>
      </span>

      <ChevronRight className="text-muted-foreground/55 size-4 shrink-0" aria-hidden />
    </button>
  );
}

function SaverAvatar({ imageUrl }: { imageUrl?: string | null }) {
  const url = imageUrl?.trim() ?? "";
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
        className="size-9 shrink-0 rounded-full object-cover"
        referrerPolicy="no-referrer"
        onError={handleImageError}
      />
    );
  }

  return (
    <span
      className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full"
      aria-hidden
    >
      <User className="size-4.5" strokeWidth={2} />
    </span>
  );
}
