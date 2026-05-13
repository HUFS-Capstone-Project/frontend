import { Coffee, LayoutGrid, Sparkles, Utensils } from "lucide-react";
import type { JSX } from "react";

import { cn } from "@/lib/utils";

type IconProps = {
  className: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
};

function renderIconByCategoryName(categoryName: string, props: IconProps): JSX.Element {
  switch (categoryName) {
    case "전체":
      return <LayoutGrid {...props} aria-hidden />;
    case "음식점":
    case "음식":
    case "FOOD":
      return <Utensils {...props} fill="#f3f4f6" fillOpacity={0.65} aria-hidden />;
    case "카페":
      return (
        <Coffee
          {...props}
          className={cn(props.className, "text-[#7a4a2a]")}
          fill="currentColor"
          fillOpacity={0.2}
          aria-hidden
        />
      );
    case "놀거리":
      return (
        <Sparkles
          {...props}
          className={cn(props.className, "text-[#f2b705]")}
          fill="currentColor"
          fillOpacity={0.35}
          aria-hidden
        />
      );
    default:
      return <Sparkles {...props} aria-hidden />;
  }
}

export function renderMapCategoryFilterChipIcon(categoryName: string): JSX.Element {
  return renderIconByCategoryName(categoryName, {
    className: "size-3 shrink-0",
    strokeWidth: 2.2,
  });
}

export function renderMapPrimaryCategoryIcon(categoryName: string, className: string): JSX.Element {
  return renderIconByCategoryName(categoryName, { className });
}
