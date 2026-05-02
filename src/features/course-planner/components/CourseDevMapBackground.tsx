import { lazy, Suspense } from "react";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { CoursePlannerMapPreview } from "@/components/course-planner/CoursePlannerMapPreview";
import { MapHeader } from "@/components/map/MapHeader";
import { COURSE_DEV_MAP_TITLE } from "@/features/course-planner/constants";
import type { BottomNavId } from "@/shared/config/navigation";
import { MAP_INITIAL_CENTER, SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
const KakaoMapView = lazy(() =>
  import("@/components/map/KakaoMapView").then((module) => ({ default: module.KakaoMapView })),
);

type CourseDevMapBackgroundProps = {
  onSelectBottomNav: (id: BottomNavId) => void;
};

export function CourseDevMapBackground({ onSelectBottomNav }: CourseDevMapBackgroundProps) {
  return (
    <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <MapHeader title={COURSE_DEV_MAP_TITLE} />

      <main className="relative min-h-0 flex-1">
        <Suspense fallback={<CoursePlannerMapPreview />}>
          <KakaoMapView
            appKey={KAKAO_MAP_APP_KEY}
            places={SAVED_PLACE_MOCKS}
            center={MAP_INITIAL_CENTER}
            className="absolute inset-0"
          />
        </Suspense>
      </main>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 [&>*]:pointer-events-auto">
        <BottomNavigationBar activeId="map" onSelect={onSelectBottomNav} />
      </div>
    </div>
  );
}
