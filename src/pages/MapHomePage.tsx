import { type JSX } from "react";

import { MapHomePageContent } from "@/pages/map/MapHomePage";

type MapHomePageProps = {
  defaultFilterPanelOpen?: boolean;
};

export function MapHomePage({ defaultFilterPanelOpen = false }: MapHomePageProps): JSX.Element {
  return <MapHomePageContent defaultFilterPanelOpen={defaultFilterPanelOpen} />;
}
