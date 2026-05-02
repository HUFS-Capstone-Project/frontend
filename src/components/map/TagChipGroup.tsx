import type { Tag } from "@/features/map/api/place-taxonomy-types";

import { TagChip } from "./TagChip";

type TagChipGroupProps = {
  tags: Tag[];
  selectedKeys: readonly string[];
  onToggleTagKey: (tagKey: string) => void;
  keyPrefix?: string;
  hideBlankLabels?: boolean;
};

export function TagChipGroup({
  tags,
  selectedKeys,
  onToggleTagKey,
  keyPrefix,
  hideBlankLabels = false,
}: TagChipGroupProps) {
  const visibleTags = hideBlankLabels ? tags.filter((tag) => tag.name.trim()) : tags;

  if (visibleTags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2" role="group">
      {visibleTags.map((tag) => (
        <TagChip
          key={keyPrefix ? `${keyPrefix}-${tag.code}` : tag.code}
          label={tag.name}
          selected={selectedKeys.includes(tag.code)}
          onClick={() => onToggleTagKey(tag.code)}
        />
      ))}
    </div>
  );
}
