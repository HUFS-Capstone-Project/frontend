import type { ServiceCategoryCode } from "@/shared/types/map-home";

export const SERVICE_CATEGORY_NAME_BY_CODE = {
  FOOD: "음식점",
  CAFE: "카페",
  ACTIVITY: "놀거리",
} as const satisfies Record<ServiceCategoryCode, string>;

export function isServiceCategoryCode(
  value: string | null | undefined,
): value is ServiceCategoryCode {
  return value === "FOOD" || value === "CAFE" || value === "ACTIVITY";
}

export function getServiceCategoryName(code: ServiceCategoryCode): string {
  return SERVICE_CATEGORY_NAME_BY_CODE[code];
}
