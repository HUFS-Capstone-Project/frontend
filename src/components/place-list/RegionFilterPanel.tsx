import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { REGION_CITIES, REGION_DISTRICTS } from "./place-list-mock-data";

type RegionFilterPanelProps = {
  selectedCity: string;
  selectedDistrict: string;
  searchMode?: boolean;
  onCitySelect: (city: string) => void;
  onDistrictSelect: (district: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function RegionFilterPanel({
  selectedCity,
  selectedDistrict,
  searchMode = false,
  onCitySelect,
  onDistrictSelect,
  onClose,
  onConfirm,
}: RegionFilterPanelProps) {
  const confirmLabel =
    selectedCity === "전체" && selectedDistrict === "전체"
      ? "지역 설정하기"
      : `${selectedCity} ${selectedDistrict} 설정하기`;

  if (searchMode) {
    return (
      <section className="absolute inset-x-4 top-20 z-30 rounded-[10px] bg-white px-3 pt-3 pb-4 shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#111111]">지역설정</h2>
          <button
            type="button"
            onClick={onClose}
            className="touch-target-min -mt-3 -mr-3 flex items-center justify-center text-[#a3a3a3]"
            aria-label="지역 설정 닫기"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <button
          type="button"
          className="mb-4 flex h-10 w-full items-center rounded-[5px] border border-[#d8d8d8] px-3 text-left text-sm text-[#111111]"
        >
          <span className="flex-1">강남구</span>
          <Search className="size-4 text-[#555555]" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onDistrictSelect("강남구")}
          className="flex w-full items-center border-b border-[#e5e5e5] pb-4 text-left text-xs"
        >
          <span className="text-[#111111]">서울특별시</span>
          <span className="ml-1 text-[#2f7df6]">강남구</span>
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="mt-36 h-10 w-full rounded-[5px] bg-[#ef7373] text-sm font-semibold text-white"
        >
          지역 설정하기
        </button>
      </section>
    );
  }

  return (
    <section className="absolute inset-x-4 top-20 z-30 rounded-[10px] bg-white px-3 pt-3 pb-4 shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#111111]">지역설정</h2>
        <button
          type="button"
          onClick={onClose}
          className="touch-target-min -mt-3 -mr-3 flex items-center justify-center text-[#a3a3a3]"
          aria-label="지역 설정 닫기"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div className="mb-3 flex h-10 items-center rounded-[5px] border border-[#d8d8d8] px-3 text-sm text-[#a3a3a3]">
        <span className="flex-1">지역명 검색</span>
        <Search className="size-4 text-[#555555]" aria-hidden />
      </div>

      <div className="grid grid-cols-2 border-y border-[#e6e6e6] text-center text-xs font-medium text-[#555555]">
        <div className="border-r border-[#e6e6e6] py-3">시/도</div>
        <div className="py-3">시/구/군</div>
      </div>

      <div className="grid min-h-52 grid-cols-2 text-sm">
        <div className="border-r border-[#e6e6e6]">
          {REGION_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => onCitySelect(city)}
              className={cn(
                "h-10 w-full px-4 text-left text-[#777777]",
                selectedCity === city && "bg-[#fde5e5] font-semibold text-[#ef7373]",
              )}
            >
              {city}
            </button>
          ))}
        </div>
        <div>
          {REGION_DISTRICTS.map((district) => (
            <button
              key={district}
              type="button"
              onClick={() => onDistrictSelect(district)}
              className={cn(
                "h-10 w-full px-4 text-left text-[#777777]",
                selectedDistrict === district && "bg-[#fde5e5] font-semibold text-[#ef7373]",
              )}
            >
              {district}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onConfirm}
        className="mt-4 h-10 w-full rounded-[5px] bg-[#ef7373] text-sm font-semibold text-white"
      >
        {confirmLabel}
      </button>
    </section>
  );
}
