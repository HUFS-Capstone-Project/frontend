import { Coffee, Flag, RotateCcw, UtensilsCrossed } from "lucide-react";

import { cn } from "@/lib/utils";
import { FILTER_SECTIONS, type FilterSection, useFilterStore } from "@/store/filterStore";

type MapHomePageSelectOptionProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SECTION_ICON_MAP: Record<FilterSection["category"], typeof UtensilsCrossed> = {
  맛집: UtensilsCrossed,
  카페: Coffee,
  놀거리: Flag,
};

export function MapHomePageSelectOption({ open, onOpenChange }: MapHomePageSelectOptionProps) {
  const selectedTags = useFilterStore((state) => state.selectedTags);
  const toggleTag = useFilterStore((state) => state.toggleTag);
  const setSelectedTags = useFilterStore((state) => state.setSelectedTags);

  if (!open) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-6 top-[10.25rem] z-30 mx-auto w-auto max-w-md">
      <section
        className={cn(
          "pointer-events-auto overflow-hidden rounded-[1.75rem] border border-white/90 bg-white/96 shadow-[0_18px_40px_rgba(0,0,0,0.16)] backdrop-blur-sm",
          "animate-in fade-in-0 zoom-in-95 duration-200",
        )}
        aria-label="세부 태그 선택"
      >
        <div className="flex items-center justify-between px-5 py-3">
          <p className="text-muted-foreground text-sm font-semibold">세부 태그사항 선택</p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold"
          >
            접기
          </button>
        </div>

        <div className="space-y-3 px-4 pb-3">
          {FILTER_SECTIONS.map((section) => {
            const Icon = SECTION_ICON_MAP[section.category];

            return (
              <section
                key={section.category}
                className={cn(
                  "rounded-[1.5rem] px-4 py-3",
                  section.category === "맛집" && "bg-[#fde9d8]",
                  section.category === "카페" && "bg-[#dfe2fb]",
                  section.category === "놀거리" && "bg-[#fde3e3]",
                )}
              >
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#5f5f5f]">
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      section.category === "맛집" && "text-[#ff9759]",
                      section.category === "카페" && "text-[#7c8cff]",
                      section.category === "놀거리" && "text-[#ff6b6b]",
                    )}
                    aria-hidden
                  />
                  <span>{section.category}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {section.tags.map((tag) => {
                    const selected = selectedTags.includes(tag.key);

                    return (
                      <button
                        key={tag.key}
                        type="button"
                        onClick={() => toggleTag(tag.key)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          selected
                            ? "border-brand-coral bg-brand-coral-soft text-[#cc6b66]"
                            : "border-black/10 bg-white text-[#666]",
                        )}
                        aria-pressed={selected}
                      >
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="flex justify-end px-5 pb-4">
          <button
            type="button"
            onClick={() => setSelectedTags([])}
            className="text-muted-foreground inline-flex items-center gap-1 text-sm font-semibold"
          >
            <span>초기화</span>
            <RotateCcw className="size-4" aria-hidden />
          </button>
        </div>
      </section>
    </div>
  );
}
