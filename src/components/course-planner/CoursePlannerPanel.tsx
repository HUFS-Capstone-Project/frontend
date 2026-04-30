import { CalendarDays } from "lucide-react";

import { CoursePlaceTagSelector } from "@/components/course-planner/CoursePlaceTagSelector";
import { CoursePlannerActions } from "@/components/course-planner/CoursePlannerActions";
import { CoursePlannerField } from "@/components/course-planner/CoursePlannerField";
import type { MapFilterBarProps } from "@/components/map/filters/map-filter-bar-props";

type CoursePlannerPanelProps = {
  regionValue: string;
  dateTimeValue: string;
  canGenerate: boolean;
  placeFilterBarProps: MapFilterBarProps;
  onOpenRegionSelect: () => void;
  onOpenDateTimeSelect: () => void;
  onGenerate: () => void;
  onReset: () => void;
};

export function CoursePlannerPanel({
  regionValue,
  dateTimeValue,
  canGenerate,
  placeFilterBarProps,
  onOpenRegionSelect,
  onOpenDateTimeSelect,
  onGenerate,
  onReset,
}: CoursePlannerPanelProps) {
  return (
    <section className="bg-background px-6 pt-8 pb-0">
      <h1 className="text-foreground text-[1.25rem] leading-tight font-semibold tracking-[-0.01em]">
        맞춤 데이트코스 설정하기
      </h1>

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
          <span className="text-foreground text-sm font-semibold">장소 종류</span>
          <CoursePlaceTagSelector {...placeFilterBarProps} />
        </div>
      </div>

      <CoursePlannerActions canGenerate={canGenerate} onGenerate={onGenerate} onReset={onReset} />
    </section>
  );
}
