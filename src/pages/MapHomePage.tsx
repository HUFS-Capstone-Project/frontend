import { MapHomePageSelectOption } from "@/components/filter/MapHomePage_SelectOption";
import { MapHomePageContent } from "@/pages/map/MapHomePage";
import { useUiStore } from "@/store/uiStore";

export function MapHomePage() {
  const isOpen = useUiStore((state) => state.filterOpen);
  const setIsOpen = useUiStore((state) => state.setFilterOpen);

  return (
    <>
      <MapHomePageContent />
      <MapHomePageSelectOption open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
