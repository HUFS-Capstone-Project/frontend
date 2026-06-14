import type { Category } from "@/features/map/api/place-taxonomy-types";

import type { CoursePlannerCategory } from "./CoursePlannerPanel";

export function toCoursePlannerCategories(categories: Category[]): CoursePlannerCategory[] {
  return categories
    .filter((category) => {
      const code = category.code.trim().toLocaleLowerCase("ko-KR");
      const name = category.name.trim();
      return code !== "all" && name !== "전체";
    })
    .map((category) => {
      const tagGroups = category.tagGroups
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((group) => ({
          code: group.code,
          name: group.name,
          sortOrder: group.sortOrder,
          tags: group.tags
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((tag) => ({
              code: tag.code,
              name: tag.name,
              sortOrder: tag.sortOrder,
            })),
        }));
      const tags = tagGroups.flatMap((group) => group.tags);

      return {
        id: category.code,
        label: category.name,
        tagGroups,
        tags,
      };
    });
}
