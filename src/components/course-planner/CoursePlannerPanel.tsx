import { CalendarDays, Coffee, Flag, Plus, Utensils } from "lucide-react";

import { CoursePlannerActions } from "@/components/course-planner/CoursePlannerActions";
import { CoursePlannerField } from "@/components/course-planner/CoursePlannerField";
import { PlaceTypeChip } from "@/components/course-planner/PlaceTypeChip";
import { cn } from "@/lib/utils";

export type PlaceTypeId = "restaurant" | "cafe" | "activity";

export type CourseCategoryOrder = {
  id: number;
  category: PlaceTypeId;
  tags: string[];
};

type CoursePlannerPanelProps = {
  regionValue: string;
  dateTimeValue: string;
  courseOrders: CourseCategoryOrder[];
  canGenerate: boolean;
  onOpenRegionSelect: () => void;
  onOpenDateTimeSelect: () => void;
  onCreateFirstOrder: (placeTypeId: PlaceTypeId) => void;
  onAddOrder: () => void;
  onSelectOrderCategory: (orderId: number, placeTypeId: PlaceTypeId) => void;
  onToggleOrderTag: (orderId: number, tag: string) => void;
  onGenerate: () => void;
  onReset: () => void;
};

const placeTypes: Array<{ id: PlaceTypeId; label: string; icon: React.ReactNode }> = [
  { id: "restaurant", label: "음식점", icon: <Utensils className="size-3.5" /> },
  { id: "cafe", label: "카페", icon: <Coffee className="size-3.5" /> },
  { id: "activity", label: "놀거리", icon: <Flag className="size-3.5" /> },
];

const categoryTags: Record<PlaceTypeId, string[]> = {
  restaurant: ["한식", "중식", "일식", "양식", "분식", "아시아식", "술집", "기타"],
  cafe: ["제과, 베이커리", "디저트 카페", "브런치 카페", "루프탑 카페", "보드카페", "만화카페"],
  activity: [
    "테마파크",
    "보드카페",
    "만화카페",
    "문화,예술",
    "방탈출카페",
    "스포츠",
    "찜질방",
    "공원",
    "생활용품점",
    "아쿠아리움",
    "기타",
  ],
};

export function CoursePlannerPanel({
  regionValue,
  dateTimeValue,
  courseOrders,
  canGenerate,
  onOpenRegionSelect,
  onOpenDateTimeSelect,
  onCreateFirstOrder,
  onAddOrder,
  onSelectOrderCategory,
  onToggleOrderTag,
  onGenerate,
  onReset,
}: CoursePlannerPanelProps) {
  return (
    <section className="relative z-20 -mt-9 rounded-t-[28px] bg-white px-4 pb-7 pt-7 shadow-[0_-16px_40px_rgba(15,23,42,0.08)]">
      <h1 className="text-lg font-bold text-[#171717]">맞춤 데이트코스 설정하기</h1>

      <div className="mt-6 grid gap-5">
        <CoursePlannerField
          label="지역설정"
          required
          value={regionValue}
          placeholder="지역을 선택해주세요."
          onClick={onOpenRegionSelect}
        />

        <CoursePlannerField
          label="날짜 및 시간 설정"
          value={dateTimeValue}
          placeholder="날짜 및 시간을 설정해주세요."
          icon={<CalendarDays className="size-4" aria-hidden />}
          onClick={onOpenDateTimeSelect}
        />

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#171717]">
              데이트 카테고리 및 순서 설정
              <span className="ml-0.5 text-[#f06f6b]">*</span>
            </span>

            {courseOrders.length > 0 ? (
              <button
                type="button"
                onClick={onAddOrder}
                className="inline-flex size-7 items-center justify-center rounded-full text-[#5f6368] transition-colors hover:bg-[#f4f4f5] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-label="순서 추가"
              >
                <Plus className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>

          {courseOrders.length === 0 ? (
            <div className="flex flex-wrap gap-2">
              {placeTypes.map((type) => (
                <PlaceTypeChip
                  key={type.id}
                  label={type.label}
                  icon={type.icon}
                  onClick={() => onCreateFirstOrder(type.id)}
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-3">
              {courseOrders.map((order, index) => (
                <div key={order.id} className="rounded-[20px] border border-[#e7e5e4] bg-white px-3 py-3.5">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#f4a09a] text-[0.68rem] font-bold text-white">
                    {index + 1}
                  </span>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {placeTypes.map((type) => (
                      <PlaceTypeChip
                        key={type.id}
                        label={type.label}
                        icon={type.icon}
                        selected={order.category === type.id}
                        selectedStyle="muted"
                        onClick={() => onSelectOrderCategory(order.id, type.id)}
                      />
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 rounded-2xl border border-[#ececec] bg-[#fafafa] p-3">
                    {categoryTags[order.category].map((tag) => {
                      const selected = order.tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => onToggleOrderTag(order.id, tag)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                            selected
                              ? "border-[#f4a09a] bg-[#fff0ee] text-[#d95f5b]"
                              : "border-[#dfdfdf] bg-white text-[#5f6368] hover:bg-[#f8f8f8]",
                          )}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CoursePlannerActions canGenerate={canGenerate} onGenerate={onGenerate} onReset={onReset} />
    </section>
  );
}