import { Coffee, LayoutGrid, type LucideIcon, Sparkles, UtensilsCrossed } from "lucide-react";

import type { MapCategoryFilterChip, MapPrimaryCategory } from "@/shared/types/map-home";

/** 맛집·카페·놀거리 (필터 패널 헤더 등) */
export const MAP_PRIMARY_CATEGORY_ICON: Record<MapPrimaryCategory, LucideIcon> = {
  맛집: UtensilsCrossed,
  카페: Coffee,
  놀거리: Sparkles,
};

/** 「전체」 포함 상단 칩 줄 */
export const MAP_CATEGORY_FILTER_CHIP_ICON: Record<MapCategoryFilterChip, LucideIcon> = {
  전체: LayoutGrid,
  ...MAP_PRIMARY_CATEGORY_ICON,
};
