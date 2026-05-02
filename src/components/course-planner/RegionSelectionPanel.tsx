import { X } from "lucide-react";

import { SearchField } from "@/components/common/SearchField";
import { COURSE_DISTRICTS_BY_CITY, COURSE_REGION_CITIES } from "@/features/course-planner/constants";
import { cn } from "@/lib/utils";

type RegionSelectionPanelProps = {
  selectedCity: string;
  selectedDistrict: string;
  onSelectCity: (city: string) => void;
  onSelectDistrict: (district: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function RegionSelectionPanel({
  selectedCity,
  selectedDistrict,
  onSelectCity,
  onSelectDistrict,
  onClose,
  onConfirm,
}: RegionSelectionPanelProps) {
  const districts = COURSE_DISTRICTS_BY_CITY[selectedCity] ?? COURSE_DISTRICTS_BY_CITY["서울"];

  return (
    <section className="bg-background px-6 pt-8 pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-base font-bold">지역설정</h1>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:bg-muted/45 focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-full transition-colors focus-visible:ring-3 focus-visible:outline-none"
          aria-label="지역설정 닫기"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <SearchField
        value={selectedDistrict === "전체" ? selectedCity : selectedDistrict}
        readOnly
        className="mt-4"
        inputClassName="h-11 rounded-lg pe-10"
        placeholder="지역명 검색"
        aria-label="지역명 검색"
      />

      <div className="border-border mt-4 grid grid-cols-2 overflow-hidden rounded-lg border">
        <div className="border-border border-r">
          <div className="border-border text-muted-foreground border-b py-2 text-center text-xs font-medium">
            시/도
          </div>
          <div className="grid">
            {COURSE_REGION_CITIES.map((city) => {
              const selected = city === selectedCity;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => onSelectCity(city)}
                  className={cn(
                    "h-11 px-4 text-left text-sm transition-colors",
                    selected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/35",
                  )}
                >
                  {city}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="border-border text-muted-foreground border-b py-2 text-center text-xs font-medium">
            시/구/군
          </div>
          <div className="grid">
            {districts.map((district) => {
              const selected = district === selectedDistrict;
              return (
                <button
                  key={district}
                  type="button"
                  onClick={() => onSelectDistrict(district)}
                  className={cn(
                    "h-11 px-4 text-left text-sm transition-colors",
                    selected
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/35",
                  )}
                >
                  {district}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onConfirm}
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none"
      >
        설정하기
      </button>
    </section>
  );
}
