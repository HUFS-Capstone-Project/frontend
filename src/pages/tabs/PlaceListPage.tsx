import { MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { PlaceListCategoryTabs } from "@/components/place-list/PlaceListCategoryTabs";
import { PlaceListDetailPage } from "@/components/place-list/PlaceListDetailPage";
import { PlaceListEmptyState } from "@/components/place-list/PlaceListEmptyState";
import { PlaceListItem } from "@/components/place-list/PlaceListItem";
import {
  PLACE_CATEGORY_TABS,
  PLACE_LIST_ITEMS,
  PLACE_LIST_TEXT,
  type PlaceCategoryId,
  type PlaceListItemData,
} from "@/components/place-list/place-list-mock-data";
import { RegionFilterPanel } from "@/components/place-list/RegionFilterPanel";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";

type PlaceListPageProps = {
  preview?: boolean;
};

function PlaceListMapHeader() {
  return (
    <section className="relative h-[13.5rem] shrink-0 overflow-hidden bg-[#eef3f5]">
      <div className="absolute inset-0 opacity-80">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#f3f4f6_0_25%,#ffffff_25%_50%,#edf2f7_50%_75%,#ffffff_75%)] bg-[length:82px_82px]" />
        <div className="absolute left-[-5rem] top-32 h-3 w-[34rem] rotate-[-12deg] rounded-full bg-[#2f5fce]/70" />
        <div className="absolute left-[-6rem] top-24 h-4 w-[34rem] rotate-[28deg] rounded-full bg-[#8cc3d8]/65" />
        <span className="absolute left-[38%] top-[45%] flex size-6 items-center justify-center rounded-full border-2 border-white bg-[#f47f7b] shadow-sm">
          <MapPin className="size-4 fill-white text-white" aria-hidden />
        </span>
        <span className="absolute right-[20%] top-[62%] flex size-6 items-center justify-center rounded-full border-2 border-white bg-[#f47f7b] shadow-sm">
          <MapPin className="size-4 fill-white text-white" aria-hidden />
        </span>
      </div>

      <div className="relative z-10 bg-[#f47f7b] px-4 pb-4 pt-9 text-white">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="size-5 fill-white" aria-hidden />
          <span>{PLACE_LIST_TEXT.mapTitle}</span>
        </div>
      </div>

      <div className="relative z-10 px-4 pt-3">
        <div className="flex h-10 items-center gap-3 rounded-full bg-white px-4 shadow-sm">
          <span className="flex-1 text-sm text-[#6b7280]">{PLACE_LIST_TEXT.searchPlaceholder}</span>
          <Search className="size-5 text-[#4b5563]" aria-hidden />
        </div>
      </div>
    </section>
  );
}

export default function PlaceListPage({ preview = false }: PlaceListPageProps) {
  const { toastMessage, toastPlacement, handleSelectBottomNav } = useBottomNavController();
  const [activeCategory, setActiveCategory] = useState<PlaceCategoryId>("all");
  const [selectedCity, setSelectedCity] = useState("서울");
  const [selectedDistrict, setSelectedDistrict] = useState("동대문구");
  const [isRegionPanelOpen, setIsRegionPanelOpen] = useState(false);
  const [isRegionSearchMode, setIsRegionSearchMode] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceListItemData | null>(null);

  const regionLabel =
    selectedCity === "전체" && selectedDistrict === "전체" ? PLACE_LIST_TEXT.regionDefault : `${selectedCity} ${selectedDistrict}`;

  const filteredPlaces = useMemo(() => {
    return PLACE_LIST_ITEMS.filter((place) => {
      const matchesCategory = activeCategory === "all" || place.category === activeCategory;
      const matchesCity = selectedCity === "전체" || place.region.includes(selectedCity);
      const matchesDistrict = selectedDistrict === "전체" || place.region.includes(selectedDistrict);
      return matchesCategory && matchesCity && matchesDistrict;
    });
  }, [activeCategory, selectedCity, selectedDistrict]);

  if (selectedPlace) {
    return (
      <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <PlaceListDetailPage place={selectedPlace} onBack={() => setSelectedPlace(null)} />
        <BottomNavToast message={toastMessage} placement={toastPlacement} />
        <BottomNavigationBar activeId="list" onSelect={handleSelectBottomNav} />
      </div>
    );
  }

  return (
    <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {preview ? <PlaceListMapHeader /> : null}
      <main className="bg-background relative min-h-0 flex-1 overflow-hidden pb-24">
        <PlaceListCategoryTabs
          tabs={PLACE_CATEGORY_TABS}
          activeId={activeCategory}
          regionLabel={regionLabel}
          onRegionClick={() => {
            setIsRegionPanelOpen(true);
            setIsRegionSearchMode(false);
          }}
          onSelect={setActiveCategory}
        />

        {isRegionPanelOpen ? (
          <RegionFilterPanel
            selectedCity={selectedCity}
            selectedDistrict={selectedDistrict}
            searchMode={isRegionSearchMode}
            onCitySelect={setSelectedCity}
            onDistrictSelect={setSelectedDistrict}
            onClose={() => setIsRegionPanelOpen(false)}
            onConfirm={() => setIsRegionPanelOpen(false)}
          />
        ) : null}

        {filteredPlaces.length > 0 ? (
          <div className="min-h-0 flex-1 overflow-y-auto" role="list" aria-label="저장 장소 목록">
            {filteredPlaces.map((place) => (
              <PlaceListItem key={place.id} place={place} onSelect={setSelectedPlace} />
            ))}
          </div>
        ) : (
          <PlaceListEmptyState message={PLACE_LIST_ITEMS.length === 0 ? PLACE_LIST_TEXT.emptySaved : PLACE_LIST_TEXT.emptyFiltered} />
        )}
      </main>
      <BottomNavToast message={toastMessage} placement={toastPlacement} />
      <BottomNavigationBar activeId="list" onSelect={handleSelectBottomNav} />
    </div>
  );
}