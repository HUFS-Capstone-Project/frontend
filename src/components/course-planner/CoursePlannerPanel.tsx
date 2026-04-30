import { CalendarDays, Coffee, Flag, MoreHorizontal, Utensils } from "lucide-react";

import { CoursePlannerActions } from "@/components/course-planner/CoursePlannerActions";
import { CoursePlannerField } from "@/components/course-planner/CoursePlannerField";
import { PlaceTypeChip } from "@/components/course-planner/PlaceTypeChip";

export type PlaceTypeId = "restaurant" | "cafe" | "activity" | "etc";

type CoursePlannerPanelProps = {
  regionValue: string;
  dateTimeValue: string;
  selectedPlaceTypeIds: PlaceTypeId[];
  canGenerate: boolean;
  onOpenRegionSelect: () => void;
  onOpenDateTimeSelect: () => void;
  onTogglePlaceType: (placeTypeId: PlaceTypeId) => void;
  onGenerate: () => void;
  onReset: () => void;
};

const placeTypes: Array<{ id: PlaceTypeId; label: string; icon: React.ReactNode }> = [
  { id: "restaurant", label: "맛집", icon: <Utensils className="size-3.5" /> },
  { id: "cafe", label: "카페", icon: <Coffee className="size-3.5" /> },
  { id: "activity", label: "놀거리", icon: <Flag className="size-3.5" /> },
  { id: "etc", label: "기타", icon: <MoreHorizontal className="size-3.5" /> },
];

export function CoursePlannerPanel({
  regionValue,
  dateTimeValue,
  selectedPlaceTypeIds,
  canGenerate,
  onOpenRegionSelect,
  onOpenDateTimeSelect,
  onTogglePlaceType,
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
          <span className="text-sm font-semibold text-[#171717]">장소 종류</span>
          <div className="flex flex-wrap gap-2">
            {placeTypes.map((type) => (
              <PlaceTypeChip
                key={type.id}
                label={type.label}
                icon={type.icon}
                selected={selectedPlaceTypeIds.includes(type.id)}
                onClick={() => onTogglePlaceType(type.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <CoursePlannerActions canGenerate={canGenerate} onGenerate={onGenerate} onReset={onReset} />
    </section>
  );
}
