import { cn } from "@/lib/utils";

import {
  MAP_CHIP_BASE_CLASS,
  MAP_CHIP_SELECTED_CLASS,
  MAP_CHIP_UNSELECTED_CLASS,
} from "./chip-style";

type TagChipProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

export function TagChip({ label, selected, onClick }: TagChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        MAP_CHIP_BASE_CLASS,
        selected ? MAP_CHIP_SELECTED_CLASS : MAP_CHIP_UNSELECTED_CLASS,
      )}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}
