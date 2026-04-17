import { MapHomePageSelectOption } from "@/components/filter/MapHomePage_SelectOption";
import { MapHomePage } from "@/pages/map/MapHomePage";
import { useUiStore } from "@/store/uiStore";

export function MapHomePage_WithFilter() {
  const isOpen = useUiStore((state) => state.filterOpen);
  const setIsOpen = useUiStore((state) => state.setFilterOpen);

  return (
    <>
      <MapHomePage />
      <MapHomePageSelectOption open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
