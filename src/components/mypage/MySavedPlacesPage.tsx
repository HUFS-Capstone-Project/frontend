import { AlertCircle, ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";

import type { SavedPlace } from "./mypage-mock-data";
import { SavedPlaceCategoryTabs, type SavedPlaceFilter } from "./SavedPlaceCategoryTabs";
import { SavedPlaceItem } from "./SavedPlaceItem";

type MySavedPlacesPageProps = {
  places: SavedPlace[];
  onBack: () => void;
  onChangePlaces: (places: SavedPlace[]) => void;
  onSelectPlace: (place: SavedPlace) => void;
};

function formatCount(count: number) {
  return count > 999 ? "999+" : String(count);
}

export function MySavedPlacesPage({
  places,
  onBack,
  onChangePlaces,
  onSelectPlace,
}: MySavedPlacesPageProps) {
  const [selectedFilter, setSelectedFilter] = useState<SavedPlaceFilter>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [memoDraft, setMemoDraft] = useState("");

  const filteredPlaces = useMemo(() => {
    if (selectedFilter === "all") {
      return places;
    }

    return places.filter((place) => place.category === selectedFilter);
  }, [places, selectedFilter]);

  const emptyMessage =
    places.length === 0 ? "나의 장소를 저장해보세요!" : "해당하는 장소가 없습니다.";

  const handleStartMemo = (place: SavedPlace) => {
    setOpenMenuId(null);
    setEditingPlaceId(place.id);
    setMemoDraft(place.memo ?? "");
  };

  const handleSaveMemo = () => {
    if (!editingPlaceId) {
      return;
    }

    const nextMemo = memoDraft.trim();
    onChangePlaces(
      places.map((place) =>
        place.id === editingPlaceId
          ? {
              ...place,
              memo: nextMemo || undefined,
            }
          : place,
      ),
    );
    setEditingPlaceId(null);
    setMemoDraft("");
  };

  const handleDeletePlace = (id: string) => {
    onChangePlaces(places.filter((place) => place.id !== id));
    setOpenMenuId(null);
    if (editingPlaceId === id) {
      setEditingPlaceId(null);
      setMemoDraft("");
    }
  };

  return (
    <main className="bg-background min-h-0 flex-1 overflow-y-auto pb-28">
      <header className="sticky top-0 z-20 bg-white pt-[max(1rem,env(safe-area-inset-top))] shadow-[0_1px_0_rgb(0_0_0_/_0.06)]">
        <div className="flex h-12 items-center px-5">
          <button
            type="button"
            onClick={onBack}
            className="touch-target-min -ml-3 flex items-center justify-center rounded-full"
          >
            <ArrowLeft className="size-5 text-[#222222]" aria-hidden />
            <span className="sr-only">마이페이지로 돌아가기</span>
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-[#111111]">나의 장소</h1>
          <span className="w-14 text-right text-xs font-semibold text-[#555555]">
            총 {formatCount(places.length)}개
          </span>
        </div>

        <SavedPlaceCategoryTabs selected={selectedFilter} onSelect={setSelectedFilter} />
      </header>

      <section className="px-5 pt-4">
        {filteredPlaces.length > 0 ? (
          <div className="space-y-2">
            {filteredPlaces.map((place) => (
              <SavedPlaceItem
                key={place.id}
                place={place}
                isMenuOpen={openMenuId === place.id}
                isEditing={editingPlaceId === place.id}
                memoDraft={memoDraft}
                onToggleMenu={(id) => setOpenMenuId((current) => (current === id ? null : id))}
                onStartMemo={handleStartMemo}
                onChangeMemo={setMemoDraft}
                onSaveMemo={handleSaveMemo}
                onClearMemo={() => setMemoDraft("")}
                onDelete={handleDeletePlace}
                onSelect={onSelectPlace}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[26rem] flex-col items-center justify-center text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-[#777777] text-white">
              <AlertCircle className="size-5" aria-hidden />
            </span>
            <p className="mt-4 text-sm font-medium text-[#8a8a8a]">{emptyMessage}</p>
          </div>
        )}
      </section>
    </main>
  );
}
