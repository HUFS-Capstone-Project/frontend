import { Coffee, LayoutGrid, Sparkles, Utensils } from "lucide-react";
import type { JSX } from "react";

type IconProps = {
  className: string;
  strokeWidth?: number;
};

function renderIconByCategoryName(categoryName: string, props: IconProps): JSX.Element {
  switch (categoryName) {
    case "전체":
      return <LayoutGrid {...props} aria-hidden />;
    case "음식점":
    case "음식":
    case "FOOD":
      return <Utensils {...props} aria-hidden />;
    case "카페":
      return <Coffee {...props} aria-hidden />;
    case "놀거리":
      return <Sparkles {...props} aria-hidden />;
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
