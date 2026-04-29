import { type JSX } from "react";

import type { PlaceFilterData } from "@/features/map/api/place-taxonomy-types";
import MyHomePage_WithDetail from "@/pages/MyHomePage_WithDetail";

type MapHomePageProps = {
  defaultFilterPanelOpen?: boolean;
  filterDataOverride?: PlaceFilterData | null;
};

export default function MapHomePage({
  defaultFilterPanelOpen = false,
  filterDataOverride = null,
}: MapHomePageProps): JSX.Element {
  return (
    <MyHomePage_WithDetail
      defaultFilterPanelOpen={defaultFilterPanelOpen}
      filterDataOverride={filterDataOverride}
    />
  );
}
