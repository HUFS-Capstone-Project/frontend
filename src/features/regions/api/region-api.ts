import { API_PATHS } from "@/shared/api/api-paths";
import { api } from "@/shared/api/axios";
import type { CommonResponse } from "@/shared/types/api-types";

import { REGION_ALL_CODE, REGION_ALL_NAME, type RegionOption } from "../types/region.types";

function normalizeRegionOptions(options: RegionOption[]): RegionOption[] {
  const normalized = options
    .map((option) =>
      option.code === REGION_ALL_CODE ? { ...option, name: REGION_ALL_NAME, all: true } : option,
    )
    .sort((left, right) => left.displayOrder - right.displayOrder);

  if (normalized.some((option) => option.code === REGION_ALL_CODE)) {
    return normalized;
  }

  return [
    { code: REGION_ALL_CODE, name: REGION_ALL_NAME, displayOrder: 0, all: true },
    ...normalized,
  ];
}

export const regionApi = {
  getSidos: async (): Promise<RegionOption[]> => {
    const response = await api.get<CommonResponse<RegionOption[]>>(API_PATHS.regions.sidos);
    return normalizeRegionOptions(response.data.data);
  },

  getSigungus: async (sidoCode: string): Promise<RegionOption[]> => {
    const response = await api.get<CommonResponse<RegionOption[]>>(
      API_PATHS.regions.sigungus(sidoCode),
    );
    return normalizeRegionOptions(response.data.data);
  },
};
