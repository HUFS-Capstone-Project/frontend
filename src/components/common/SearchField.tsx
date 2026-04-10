import { Search } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export const SEARCH_FIELD_DEFAULT_PLACEHOLDER = "검색";

export type SearchFieldProps = Omit<React.ComponentProps<"input">, "type"> & {
  inputClassName?: string;
};

export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(
    {
      className,
      inputClassName,
      id,
      placeholder = SEARCH_FIELD_DEFAULT_PLACEHOLDER,
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
            "border-input placeholder:text-muted-foreground bg-background text-foreground h-10 w-full rounded-full border px-3.5 pe-10 text-sm outline-none focus-visible:ring-0",
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

SearchField.displayName = "SearchField";
