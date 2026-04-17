import { Coffee, Flag, RotateCcw, UtensilsCrossed } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FilterTagKey } from "@/store/filterStore";
import { useFilterStore } from "@/store/filterStore";

type MapHomePageSelectOptionProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FilterSection = {
  title: string;
  tone: string;
  icon: typeof UtensilsCrossed;
  iconClassName: string;
  tags: Array<{
    key: FilterTagKey;
    label: string;
  }>;
};

const FILTER_SECTIONS: FilterSection[] = [
  {
    title: "맛집",
    tone: "bg-[#FDE9D6]",
    icon: UtensilsCrossed,
    iconClassName: "text-[#F29C52]",
    tags: [
      { key: "맛집-한식", label: "한식" },
      { key: "맛집-중식", label: "중식" },
      { key: "맛집-일식", label: "일식" },
      { key: "맛집-양식", label: "양식" },
      { key: "맛집-분식", label: "분식" },
      { key: "맛집-아시아식", label: "아시아식" },
      { key: "맛집-술집", label: "술집" },
      { key: "맛집-기타", label: "기타" },
    ],
  },
  {
    title: "카페",
    tone: "bg-[#DDE2FF]",
    icon: Coffee,
    iconClassName: "text-[#7E8DF8]",
    tags: [{ key: "카페-제과, 베이커리", label: "제과, 베이커리" }],
  },
  {
    title: "놀거리",
    tone: "bg-[#FDE2E5]",
    icon: Flag,
    iconClassName: "text-[#FF6F6F]",
    tags: [
      { key: "놀거리-테마파크", label: "테마파크" },
      { key: "놀거리-보드카페", label: "보드카페" },
      { key: "놀거리-만화카페", label: "만화카페" },
      { key: "놀거리-문화,예술", label: "문화,예술" },
      { key: "놀거리-방탈출카페", label: "방탈출카페" },
      { key: "놀거리-스포츠", label: "스포츠" },
      { key: "놀거리-찜질방", label: "찜질방" },
      { key: "놀거리-공원", label: "공원" },
      { key: "놀거리-생활용품점", label: "생활용품점" },
      { key: "놀거리-아쿠아리움", label: "아쿠아리움" },
      { key: "놀거리-기타", label: "기타" },
    ],
  },
];

export function MapHomePage_SelectOption({
  open,
  onOpenChange,
}: MapHomePageSelectOptionProps) {
  const selectedTags = useFilterStore((state) => state.selectedTags);
  const toggleSelectedTag = useFilterStore((state) => state.toggleSelectedTag);
  const setSelectedTags = useFilterStore((state) => state.setSelectedTags);

  if (!open) {
    return null;
  }

  return (
    <section className="rounded-[1.35rem] bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-[15px] font-semibold text-[#7A7A7A]">세부 태그사항 선택</p>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="text-sm font-semibold text-[#7A7A7A]"
        >
          접기
        </button>
      </div>

      <div className="space-y-3">
        {FILTER_SECTIONS.map((section) => {
          const Icon = section.icon;

          return (
            <section key={section.title} className={cn("rounded-[1.15rem] p-4", section.tone)}>
              <div className="mb-3 flex items-center gap-2">
                <Icon className={cn("size-4", section.iconClassName)} strokeWidth={2.4} />
                <h3 className="text-base font-bold text-[#555]">{section.title}</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {section.tags.map((tag) => {
                  const selected = selectedTags.includes(tag.key);

                  return (
                    <button
                      key={tag.key}
                      type="button"
                      onClick={() => toggleSelectedTag(tag.key)}
                      className={cn(
                        "rounded-full border bg-white px-3 py-1.5 text-sm font-medium transition-colors",
                        selected
                          ? "border-[#FA8F87] bg-[#FFE3DF] text-[#E36F66]"
                          : "border-[#E4E4E7] text-[#616161]",
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

      <div className="mt-3 flex justify-end px-1">
        <button
          type="button"
          onClick={() => setSelectedTags([])}
          className="flex items-center gap-1 text-sm font-semibold text-[#8B8B8B]"
        >
          초기화
          <RotateCcw className="size-3.5" />
        </button>
      </div>
    </section>
  );
}
