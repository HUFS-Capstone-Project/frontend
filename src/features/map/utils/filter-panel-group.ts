import type { TagGroup } from "@/features/map/api/place-taxonomy-types";

export function isDefaultGroup(group: TagGroup): boolean {
  return group.name === null;
}

export function isEmptyGroup(group: TagGroup): boolean {
  return group.tags.length === 0;
}
