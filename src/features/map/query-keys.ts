export const mapQueryKeys = {
  all: ["map"] as const,
  placeFilterOptions: () => [...mapQueryKeys.all, "place-filter-options"] as const,
};
