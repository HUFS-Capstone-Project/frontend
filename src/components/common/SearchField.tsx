import { Search } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export const SEARCH_FIELD_DEFAULT_PLACEHOLDER = "검색";

export type SearchFieldProps = Omit<React.ComponentProps<"input">, "type"> & {
  inputClassName?: string;
  searchButtonLabel?: string;
  onSubmitSearch?: () => void;
};

export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(
    {
      className,
      inputClassName,
      searchButtonLabel = "검색",
      onSubmitSearch,
      id,
      placeholder = SEARCH_FIELD_DEFAULT_PLACEHOLDER,
      "aria-label": ariaLabel,
      onKeyDown,
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
            "border-input placeholder:text-muted-foreground bg-background text-foreground h-10 w-full rounded-full border px-3.5 pe-10 text-sm outline-none focus-visible:ring-0",
            inputClassName,
          )}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (!event.defaultPrevented && event.key === "Enter") {
              onSubmitSearch?.();
            }
          }}
          {...inputProps}
        />
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute end-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-2"
          aria-label={searchButtonLabel}
          onClick={onSubmitSearch}
        >
          <Search className="size-4" aria-hidden />
        </button>
      </div>
    );
  },
);

SearchField.displayName = "SearchField";
