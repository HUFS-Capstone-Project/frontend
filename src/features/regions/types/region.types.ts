export const REGION_ALL_CODE = "ALL" as const;
export const REGION_ALL_NAME = "전체" as const;

export type RegionOption = {
  code: string;
  name: string;
  displayOrder: number;
  all: boolean;
};

export type RegionSelectionOption = Pick<RegionOption, "code" | "name"> & {
  displayName?: string;
  parentSidoCode?: string;
  parentSidoName?: string;
};

export const REGION_ALL_OPTION: RegionSelectionOption = {
  code: REGION_ALL_CODE,
  name: REGION_ALL_NAME,
};
