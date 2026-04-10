import { Search } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/** 방 헤더 검색창 기본 placeholder */
export const ROOM_SEARCH_DEFAULT_PLACEHOLDER = "친구 이름 또는 장소 검색";

export type RoomSearchFieldProps = Omit<React.ComponentProps<"input">, "type"> & {
  inputClassName?: string;
};

/**
 * 방 메인 헤더용 pill 검색 입력
 */
export const RoomSearchField = React.forwardRef<HTMLInputElement, RoomSearchFieldProps>(
  function RoomSearchField(
    {
      className,
      inputClassName,
      id,
      placeholder = ROOM_SEARCH_DEFAULT_PLACEHOLDER,
      "aria-label": ariaLabel,
      ...inputProps
    },
    ref,
  ) {
    const generatedId = React.useId();

    return (
      <div className={cn("relative w-full", className)}>
        <input
          ref={ref}
          id={id ?? generatedId}
          type="text"
          placeholder={placeholder}
          autoComplete="off"
          aria-label={ariaLabel ?? placeholder}
          className={cn(
            "border-input placeholder:text-muted-foreground h-10 w-full rounded-full border bg-background px-3.5 pe-10 text-sm text-foreground shadow-sm outline-none focus-visible:ring-0",
            inputClassName,
          )}
          {...inputProps}
        />
        <Search
          className="text-muted-foreground pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2"
          aria-hidden
        />
      </div>
    );
  },
);

RoomSearchField.displayName = "RoomSearchField";
