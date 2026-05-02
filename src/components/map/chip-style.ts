export const MAP_CHIP_BASE_CLASS =
  "flex h-7 min-w-fit items-center justify-center gap-1 rounded-full border px-2.5 text-xs font-medium transition-colors";

export const MAP_CHIP_SELECTED_CLASS = "border-primary bg-primary text-primary-foreground";

/** 지도 검색 입력·카테고리 칩(비선택·패널 포커스) 공통 글래스 — 패널 본문과 동일 불투명도 */
export const MAP_OVERLAY_GLASS_SURFACE_CLASS =
  "border-border/35 bg-background/80 backdrop-blur-md";

export const MAP_CHIP_UNSELECTED_CLASS = `${MAP_OVERLAY_GLASS_SURFACE_CLASS} text-muted-foreground/80 hover:bg-background/85`;

export const MAP_CHIP_PANEL_FOCUS_CLASS =
  `${MAP_OVERLAY_GLASS_SURFACE_CLASS} text-foreground/80 ring-1 ring-inset ring-foreground/12 hover:bg-background/85 dark:ring-white/15`;

/** active 칩이면서 태그 패널 포커스일 때 — 코랄 위 대비용 얕은 링 */
export const MAP_CHIP_PANEL_FOCUS_ON_ACTIVE_CLASS = "ring-2 ring-inset ring-primary-foreground/45";

/** 인라인 뱃지 (md 이상, primary 칩 위) */
export const MAP_CHIP_BADGE_SELECTED_CLASS =
  "md:bg-primary-foreground/25 md:text-primary-foreground md:backdrop-blur-sm";

export const MAP_CHIP_BADGE_UNSELECTED_CLASS = "md:bg-muted md:text-muted-foreground/85";

/** 모바일(md 미만): 모서리 오버레이 + 실색 */
export const MAP_CHIP_BADGE_SELECTED_MOBILE_CLASS =
  "max-md:absolute max-md:-top-1 max-md:-right-0.5 max-md:z-1 max-md:flex max-md:h-4 max-md:min-w-4 max-md:items-center max-md:justify-center max-md:rounded-full max-md:px-1 max-md:tabular-nums max-md:font-semibold max-md:shadow-sm max-md:border max-md:border-primary-foreground/50 max-md:bg-primary-foreground max-md:text-primary";

export const MAP_CHIP_BADGE_UNSELECTED_MOBILE_CLASS =
  "max-md:absolute max-md:-top-1 max-md:-right-0.5 max-md:z-1 max-md:flex max-md:h-4 max-md:min-w-4 max-md:items-center max-md:justify-center max-md:rounded-full max-md:px-1 max-md:tabular-nums max-md:font-semibold max-md:shadow-sm max-md:border max-md:border-primary/30 max-md:bg-primary max-md:text-primary-foreground";

/** 검색 입력(`SearchField`) — `MAP_OVERLAY_GLASS_SURFACE_CLASS` 별칭 */
export const MAP_SEARCH_GLASS_SURFACE_CLASS = MAP_OVERLAY_GLASS_SURFACE_CLASS;

/** 검색창 한 줄만 — 넓은 글래스 패널 없이 얇게 */
export const MAP_SEARCH_INPUT_GLASS_CLASS = `${MAP_SEARCH_GLASS_SURFACE_CLASS} placeholder:text-muted-foreground/90`;

/** 태그 필터 패널·검색 제안 드롭다운 공통 래퍼 */
export const MAP_FILTER_PANEL_BASE_CLASS = `mt-2 overflow-hidden rounded-2xl border ${MAP_OVERLAY_GLASS_SURFACE_CLASS} shadow-filter-panel transition-all duration-200 ease-out`;

export const MAP_FILTER_PANEL_HEADER_ACTION_CLASS =
  "text-xs font-medium text-muted-foreground/90 hover:text-muted-foreground";

export const MAP_FILTER_PANEL_SECTION_CLASS = "min-w-0 px-3 py-3";

export const MAP_FILTER_PANEL_GROUP_TITLE_CLASS =
  "mb-1.5 text-[0.75rem] font-semibold tracking-tight text-muted-foreground/90";

export const MAP_FILTER_PANEL_SECTION_ICON_CLASS = "size-4 shrink-0 text-muted-foreground/90";

export const MAP_FILTER_PANEL_RESET_CLASS =
  "inline-flex items-center gap-1 text-xs font-medium text-muted-foreground/85 hover:text-muted-foreground";
