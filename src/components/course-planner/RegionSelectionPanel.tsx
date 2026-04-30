import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

type RegionSelectionPanelProps = {
  selectedCity: string;
  selectedDistrict: string;
  onSelectCity: (city: string) => void;
  onSelectDistrict: (district: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

const cities = ["서울", "경기", "인천", "부산", "대구", "대전"];
const districtsByCity: Record<string, string[]> = {
  서울: ["전체", "강남구", "강동구", "강북구", "강서구", "관악구"],
  경기: ["전체", "성남시", "수원시", "고양시", "용인시", "하남시"],
  인천: ["전체", "남동구", "연수구", "부평구", "서구", "중구"],
  부산: ["전체", "해운대구", "수영구", "부산진구", "동래구", "남구"],
  대구: ["전체", "중구", "동구", "서구", "수성구", "달서구"],
  대전: ["전체", "서구", "유성구", "중구", "동구", "대덕구"],
};

export function RegionSelectionPanel({
  selectedCity,
  selectedDistrict,
  onSelectCity,
  onSelectDistrict,
  onClose,
  onConfirm,
}: RegionSelectionPanelProps) {
  const districts = districtsByCity[selectedCity] ?? districtsByCity["서울"];
  const confirmLabel =
    selectedDistrict === "전체"
      ? `${selectedCity} 전체 설정하기`
      : `${selectedCity} ${selectedDistrict} 설정하기`;

  return (
    <section className="relative z-20 -mt-9 rounded-t-[28px] bg-white px-4 pt-5 pb-7 shadow-[0_-16px_40px_rgba(15,23,42,0.08)]">
      <div className="mx-auto mb-5 h-1 w-14 rounded-full bg-[#d9d9d9]" />

      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-[#171717]">지역설정</h1>
        <button
          type="button"
          onClick={onClose}
          className="focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-full text-[#9ca3af] transition-colors hover:bg-[#f4f4f5] focus-visible:ring-3 focus-visible:outline-none"
          aria-label="지역설정 닫기"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <label className="mt-4 flex h-11 items-center gap-2 rounded-lg border border-[#dedede] bg-white px-3">
        <input
          value={selectedDistrict === "전체" ? selectedCity : selectedDistrict}
          readOnly
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#171717] outline-none placeholder:text-[#9ca3af]"
          placeholder="지역명 검색"
          aria-label="지역명 검색"
        />
        <Search className="size-4 text-[#6b7280]" aria-hidden />
      </label>

      <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-lg border border-[#eeeeee]">
        <div className="border-r border-[#eeeeee]">
          <div className="border-b border-[#eeeeee] py-2 text-center text-xs font-medium text-[#52525b]">
            시/도
          </div>
          <div className="grid">
            {cities.map((city) => {
              const selected = city === selectedCity;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => onSelectCity(city)}
                  className={cn(
                    "h-11 px-4 text-left text-sm transition-colors",
                    selected
                      ? "bg-[#fff0ee] font-semibold text-[#f06f6b]"
                      : "text-[#8a8f98] hover:bg-[#fafafa]",
                  )}
                >
                  {city}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="border-b border-[#eeeeee] py-2 text-center text-xs font-medium text-[#52525b]">
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
                      ? "bg-[#ffe6e4] font-semibold text-[#f06f6b]"
                      : "text-[#8a8f98] hover:bg-[#fafafa]",
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
        className="focus-visible:ring-ring/50 mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#f06f6b] text-sm font-semibold text-white transition-colors hover:bg-[#e86460] focus-visible:ring-3 focus-visible:outline-none"
      >
        {confirmLabel}
      </button>
    </section>
  );
}
