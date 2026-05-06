import { X } from "lucide-react";
import { useMemo, useState } from "react";

import { SearchField } from "@/components/common/SearchField";
import {
  COURSE_DISTRICTS_BY_CITY,
  COURSE_REGION_CITIES,
} from "@/features/course-planner/constants";
import type { RegionSelectionOption } from "@/features/regions";
import { cn } from "@/lib/utils";

type RegionSelectionPanelProps = {
  selectedCity: string;
  selectedDistrict: string;
  cityOptions?: RegionSelectionOption[];
  districtOptions?: RegionSelectionOption[];
  isCityLoading?: boolean;
  isDistrictLoading?: boolean;
  cityErrorMessage?: string | null;
  districtErrorMessage?: string | null;
  searchKeyword?: string;
  onSearchKeywordChange?: (keyword: string) => void;
  onSelectCity: (city: string, option?: RegionSelectionOption) => void;
  onSelectDistrict: (district: string, option?: RegionSelectionOption) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function RegionSelectionPanel({
  selectedCity,
  selectedDistrict,
  cityOptions,
  districtOptions,
  isCityLoading = false,
  isDistrictLoading = false,
  cityErrorMessage = null,
  districtErrorMessage = null,
  searchKeyword,
  onSearchKeywordChange,
  onSelectCity,
  onSelectDistrict,
  onClose,
  onConfirm,
}: RegionSelectionPanelProps) {
  const [localSearchKeyword, setLocalSearchKeyword] = useState("");
  const resolvedSearchKeyword = searchKeyword ?? localSearchKeyword;
  const setResolvedSearchKeyword = onSearchKeywordChange ?? setLocalSearchKeyword;
  const fallbackCityOptions: RegionSelectionOption[] = COURSE_REGION_CITIES.map((city) => ({
    code: city,
    name: city,
  }));
  const fallbackDistrictOptions = (
    COURSE_DISTRICTS_BY_CITY[selectedCity] ?? COURSE_DISTRICTS_BY_CITY["서울"]
  ).map<RegionSelectionOption>((district) => ({
    code: district,
    name: district,
  }));
  const resolvedCityOptions = cityOptions ?? fallbackCityOptions;
  const resolvedDistrictOptions = districtOptions ?? fallbackDistrictOptions;
  const normalizedSearchKeyword = resolvedSearchKeyword.trim().toLocaleLowerCase("ko-KR");
  const filteredDistrictOptions = useMemo(() => {
    if (!normalizedSearchKeyword) {
      return resolvedDistrictOptions;
    }

    return resolvedDistrictOptions.filter((district) =>
      `${district.name} ${district.displayName ?? ""}`
        .toLocaleLowerCase("ko-KR")
        .includes(normalizedSearchKeyword),
    );
  }, [normalizedSearchKeyword, resolvedDistrictOptions]);
  const filteredCityOptions = useMemo(() => {
    if (!normalizedSearchKeyword) {
      return resolvedCityOptions;
    }

    const matchedByCityName = resolvedCityOptions.filter((city) =>
      `${city.name} ${city.displayName ?? ""}`
        .toLocaleLowerCase("ko-KR")
        .includes(normalizedSearchKeyword),
    );
    const cityByCode = new Map(matchedByCityName.map((city) => [city.code, city]));

    for (const district of filteredDistrictOptions) {
      if (!district.parentSidoCode || !district.parentSidoName) {
        continue;
      }

      cityByCode.set(district.parentSidoCode, {
        code: district.parentSidoCode,
        name: district.parentSidoName,
      });
    }

    return [...cityByCode.values()];
  }, [filteredDistrictOptions, normalizedSearchKeyword, resolvedCityOptions]);
  const hasCitySearchResult = filteredCityOptions.length > 0;
  const hasDistrictSearchResult = filteredDistrictOptions.length > 0;

  const handleSelectCity = (city: RegionSelectionOption) => {
    onSelectCity(city.name, city);
    setResolvedSearchKeyword("");
  };

  const handleSelectDistrict = (district: RegionSelectionOption) => {
    onSelectDistrict(district.name, district);
    setResolvedSearchKeyword("");
  };

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
        value={resolvedSearchKeyword}
        onChange={(event) => setResolvedSearchKeyword(event.target.value)}
        className="mt-4"
        inputClassName="h-11 rounded-lg pe-10"
        placeholder="지역명 검색"
        aria-label="지역명 검색"
      />

      <div className="border-border mt-4 grid h-[21rem] max-h-[42dvh] grid-cols-2 overflow-hidden rounded-lg border">
        <div className="border-border flex min-h-0 flex-col border-r">
          <div className="border-border text-muted-foreground shrink-0 border-b py-2 text-center text-xs font-medium">
            시/도
          </div>
          <div className="scrollbar-hide grid min-h-0 overflow-y-auto">
            {isCityLoading ? (
              <p className="text-muted-foreground px-4 py-3 text-sm">지역을 불러오는 중이에요</p>
            ) : null}
            {!isCityLoading && cityErrorMessage ? (
              <p className="text-muted-foreground px-4 py-3 text-sm">{cityErrorMessage}</p>
            ) : null}
            {!isCityLoading && !cityErrorMessage
              ? filteredCityOptions.map((city) => {
                  const selected = city.name === selectedCity;
                  return (
                    <button
                      key={city.code}
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className={cn(
                        "h-11 px-4 text-left text-sm transition-colors",
                        selected
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted/35",
                      )}
                    >
                      {city.name}
                    </button>
                  );
                })
              : null}
            {!isCityLoading && !cityErrorMessage && !hasCitySearchResult ? (
              <p className="text-muted-foreground px-4 py-3 text-sm">검색 결과가 없어요</p>
            ) : null}
          </div>
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="border-border text-muted-foreground shrink-0 border-b py-2 text-center text-xs font-medium">
            시/구/군
          </div>
          <div className="scrollbar-hide grid min-h-0 overflow-y-auto">
            {isDistrictLoading ? (
              <p className="text-muted-foreground px-4 py-3 text-sm">지역을 불러오는 중이에요</p>
            ) : null}
            {!isDistrictLoading && districtErrorMessage ? (
              <p className="text-muted-foreground px-4 py-3 text-sm">{districtErrorMessage}</p>
            ) : null}
            {!isDistrictLoading && !districtErrorMessage
              ? filteredDistrictOptions.map((district) => {
                  const selected = district.name === selectedDistrict;
                  return (
                    <button
                      key={district.code}
                      type="button"
                      onClick={() => handleSelectDistrict(district)}
                      className={cn(
                        "h-11 px-4 text-left text-sm transition-colors",
                        selected
                          ? "bg-primary/15 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted/35",
                      )}
                    >
                      {district.name}
                    </button>
                  );
                })
              : null}
            {!isDistrictLoading && !districtErrorMessage && !hasDistrictSearchResult ? (
              <p className="text-muted-foreground px-4 py-3 text-sm">검색 결과가 없어요</p>
            ) : null}
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
