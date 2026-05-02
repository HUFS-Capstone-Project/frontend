import { type JSX } from "react";

import type { PlaceFilterData } from "@/features/map/api/place-taxonomy-types";
import MapHomeWithDetail from "@/pages/map/MapHomeWithDetail";

type MapHomePageProps = {
  defaultFilterPanelOpen?: boolean;
  filterDataOverride?: PlaceFilterData | null;
};

export default function MapHomePage({
  defaultFilterPanelOpen = false,
  filterDataOverride = null,
}: MapHomePageProps): JSX.Element {
  return (
    <MapHomeWithDetail
      defaultFilterPanelOpen={defaultFilterPanelOpen}
      filterDataOverride={filterDataOverride}
    />
  );
}
