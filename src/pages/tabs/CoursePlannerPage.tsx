import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import type { BottomNavId } from "@/components/common/BottomNavigationBar";
import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import {
  type DateTimeSelection,
  getDateTimeDisplayValue,
  isEndAfterStart,
  isHmString,
} from "@/components/course-planner/course-date-time";
import { CourseGenerationLoadingPanel } from "@/components/course-planner/CourseGenerationLoadingPanel";
import {
  CoursePlaceInfoPanel,
  type CourseStop,
} from "@/components/course-planner/CoursePlaceInfoPanel";
import { CoursePlannerBottomSheet } from "@/components/course-planner/CoursePlannerBottomSheet";
import { CoursePlannerMapPreview } from "@/components/course-planner/CoursePlannerMapPreview";
import { CoursePlannerPanel } from "@/components/course-planner/CoursePlannerPanel";
import {
  type CourseOption,
  CourseResultPanel,
} from "@/components/course-planner/CourseResultPanel";
import { DateTimeSelectionScreen } from "@/components/course-planner/DateTimeSelectionScreen";
import { RegionSelectionPanel } from "@/components/course-planner/RegionSelectionPanel";
import { MapHeader } from "@/components/map/MapHeader";
import { PlaceDetailSheet } from "@/components/place/PlaceDetailSheet";
import { useMapSearchFilters } from "@/features/map/hooks/use-map-search-filters";
import { usePlaceFilterData } from "@/features/map/hooks/use-place-filter-data";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { MAP_INITIAL_CENTER, SAVED_PLACE_MOCKS } from "@/pages/map/map-home-mock";
import MyHomePage_WithDetail from "@/pages/MyHomePage_WithDetail";
import { MAP_ALL_CATEGORY_FILTER_CHIP } from "@/shared/types/map-home";
import { useRoomSelectionStore } from "@/store/room-selection-store";

type CoursePlannerMode = "form" | "region" | "datetime" | "loading" | "result" | "detail";

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
const KakaoMapView = lazy(() =>
  import("@/components/map/KakaoMapView").then((module) => ({ default: module.KakaoMapView })),
);

const mockCourses: CourseOption[] = [
  { id: "course-1", title: "코스 1", description: "균형 있게 구성된 코스" },
  { id: "course-2", title: "코스 2", description: "릴스 좋아요 순으로 구성된 인기 코스" },
  { id: "course-3", title: "코스 3", description: "최근 등록된 장소로 구성된 코스" },
];

const mockStops: CourseStop[] = [
  {
    id: "hufs-seoul",
    placeId: "place-1",
    name: "한국외국어대학교 서울캠퍼스",
    address: "서울 동대문구 이문로 107",
    category: "대학 · 캠퍼스",
    walkingTime: "도보 10분",
    hours: "10:40 ~ 19:30",
  },
  {
    id: "gangneung",
    placeId: "place-2",
    name: "감동",
    address: "회기로 25길 10-13 1층",
    category: "맛집",
    walkingTime: "도보 8분",
    hours: "11:30 ~ 21:00",
  },
  {
    id: "oegwan-street",
    placeId: "place-3",
    name: "사르스트 외대점",
    address: "회기로 23길 2",
    category: "카페",
    walkingTime: "도보 7분",
    hours: "12:00 ~ 22:00",
  },
];

type CoursePlannerPageProps = {
  skipRoomGuard?: boolean;
};

function CourseDevMapBackground({
  onSelectBottomNav,
}: {
  onSelectBottomNav: (id: BottomNavId) => void;
}) {
  return (
    <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <MapHeader title="데이트 지도" />

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

      <div className="relative shrink-0">
        <BottomNavigationBar activeId="map" onSelect={onSelectBottomNav} />
      </div>
    </div>
  );
}

export default function CoursePlannerPage({ skipRoomGuard = false }: CoursePlannerPageProps) {
  const navigate = useNavigate();
  const selectedRoom = useRoomSelectionStore((s) => s.selectedRoom);
  const { toastMessage, toastPlacement, handleSelectBottomNav, showToast } =
    useBottomNavController();
  const [mode, setMode] = useState<CoursePlannerMode>("form");
  const [regionValue, setRegionValue] = useState("");
  const [draftCity, setDraftCity] = useState("서울");
  const [draftDistrict, setDraftDistrict] = useState("강남구");
  const [dateTimeValue, setDateTimeValue] = useState<DateTimeSelection | null>(null);
  const [draftDate, setDraftDate] = useState<string | null>(null);
  const [draftStartTime, setDraftStartTime] = useState<string | null>(null);
  const [draftEndTime, setDraftEndTime] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseTitle, setCourseTitle] = useState(mockCourses[0]?.title ?? "코스 1");
  const [courseStops, setCourseStops] = useState<CourseStop[]>(mockStops);
  const {
    categories,
    categoryNameByCode,
    filterCategories,
    isInitialLoading,
    isInitialError,
    retryLoad,
  } = usePlaceFilterData();
  const {
    activeCategories,
    focusedCategory,
    toggleCategory,
    closeTagPanel,
    isTagPanelOpen,
    selectedTagKeysByCategory,
    selectedTagCountByCategory,
    toggleTagInCategory,
    resetFocusedCategoryTags,
  } = useMapSearchFilters({
    places: SAVED_PLACE_MOCKS,
    filterCategories,
  });

  useEffect(() => {
    if (mode !== "loading") return;

    const timerId = window.setTimeout(() => {
      showToast("데이트코스가 완성되었습니다", 3200);
      setSelectedCourseId("");
      setMode("result");
    }, 900);

    return () => window.clearTimeout(timerId);
  }, [mode, showToast]);

  const applyDateTimeFromDrafts = useCallback(() => {
    if (!draftDate) {
      setDateTimeValue(null);
      return;
    }

    const weekday = new Date(draftDate.replaceAll(".", "/"))
      .toLocaleDateString("ko-KR", { weekday: "short" })
      .replace("요일", "");

    setDateTimeValue({
      date: draftDate,
      weekday,
      startTime: draftStartTime,
      endTime: draftEndTime,
    });
  }, [draftDate, draftStartTime, draftEndTime]);

  const handleOpenDateTimeSelect = useCallback(() => {
    closeTagPanel();
    setMode("datetime");
  }, [closeTagPanel]);

  const handleCloseDateTimeScreen = useCallback(() => {
    setMode("form");
  }, []);

  const handleConfirmDateTime = useCallback(() => {
    if (
      !draftDate ||
      !isHmString(draftStartTime) ||
      !isHmString(draftEndTime) ||
      !isEndAfterStart(draftStartTime, draftEndTime)
    ) {
      return;
    }
    applyDateTimeFromDrafts();
    setMode("form");
  }, [applyDateTimeFromDrafts, draftDate, draftEndTime, draftStartTime]);

  if (!skipRoomGuard && !selectedRoom) {
    return <Navigate to="/room" replace />;
  }

  const canGenerate = regionValue.trim().length > 0;

  const handleDismissCourse = () => {
    navigate("/map");
  };

  const handleSelectCity = (city: string) => {
    setDraftCity(city);
    setDraftDistrict("전체");
  };

  const handleConfirmRegion = () => {
    setRegionValue(draftDistrict === "전체" ? draftCity : `${draftCity} ${draftDistrict}`);
    setMode("form");
  };

  const handleResetPlanner = () => {
    setRegionValue("");
    setDraftCity("서울");
    setDraftDistrict("강남구");
    setDateTimeValue(null);
    setDraftDate(null);
    setDraftStartTime(null);
    setDraftEndTime(null);
    toggleCategory(MAP_ALL_CATEGORY_FILTER_CHIP);
    setSelectedCourseId("");
    setCourseTitle(mockCourses[0]?.title ?? "코스 1");
    setCourseStops(mockStops);
    setMode("form");
  };

  const handleGenerateCourse = () => {
    if (!canGenerate) return;
    setMode("loading");
  };

  const handleSelectCourse = (courseId: string) => {
    const selectedCourse = mockCourses.find((course) => course.id === courseId);
    setSelectedCourseId(courseId);
    setCourseTitle(selectedCourse?.title ?? "코스 1");
    setCourseStops(mockStops);
    setMode("detail");
  };

  const handleSaveCourse = (nextTitle: string, nextStops: CourseStop[], fromEditMode: boolean) => {
    showToast("코스가 저장되었습니다", 3200);
    if (fromEditMode) {
      setCourseTitle(nextTitle);
      setCourseStops(nextStops);
      return;
    }
    handleResetPlanner();
  };

  const placeFilterBarProps = {
    categories,
    categoryNameByCode,
    filterCategories,
    isCategoryLoading: isInitialLoading,
    isCategoryError: isInitialError,
    onRetryLoadCategories: () => {
      void retryLoad();
    },
    activeCategories,
    focusedCategory,
    onToggleCategory: toggleCategory,
    isTagPanelOpen,
    selectedTagKeysByCategory,
    selectedTagCountByCategory,
    onToggleTagInCategory: toggleTagInCategory,
    onResetFocusedCategoryTags: resetFocusedCategoryTags,
    onCloseTagPanel: closeTagPanel,
  };

  return (
    <>
      {selectedRoom ? (
        <MyHomePage_WithDetail />
      ) : (
        <CourseDevMapBackground onSelectBottomNav={handleSelectBottomNav} />
      )}

      <BottomNavToast message={toastMessage} placement={toastPlacement} />

      {skipRoomGuard && !selectedRoom ? <PlaceDetailSheet /> : null}

      <CoursePlannerBottomSheet open onClose={handleDismissCourse}>
        {mode === "region" ? (
          <RegionSelectionPanel
            selectedCity={draftCity}
            selectedDistrict={draftDistrict}
            onSelectCity={handleSelectCity}
            onSelectDistrict={setDraftDistrict}
            onClose={() => setMode("form")}
            onConfirm={handleConfirmRegion}
          />
        ) : null}

        {mode === "datetime" ? (
          <DateTimeSelectionScreen
            selectedDate={draftDate}
            selectedStartTime={draftStartTime}
            selectedEndTime={draftEndTime}
            onSelectDate={setDraftDate}
            onSelectStartTime={setDraftStartTime}
            onSelectEndTime={setDraftEndTime}
            onClose={handleCloseDateTimeScreen}
            onConfirm={handleConfirmDateTime}
          />
        ) : null}

        {mode === "form" ? (
          <CoursePlannerPanel
            regionValue={regionValue}
            dateTimeValue={getDateTimeDisplayValue(dateTimeValue)}
            canGenerate={canGenerate}
            placeFilterBarProps={placeFilterBarProps}
            onOpenRegionSelect={() => setMode("region")}
            onOpenDateTimeSelect={handleOpenDateTimeSelect}
            onGenerate={handleGenerateCourse}
            onReset={handleResetPlanner}
          />
        ) : null}

        {mode === "loading" ? (
          <CourseGenerationLoadingPanel roomName={selectedRoom?.name ?? "방"} />
        ) : null}

        {mode === "result" ? (
          <CourseResultPanel
            courses={mockCourses}
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
          />
        ) : null}

        {mode === "detail" ? (
          <CoursePlaceInfoPanel
            courseTitle={courseTitle}
            stops={courseStops}
            onBack={() => {
              setSelectedCourseId("");
              setMode("result");
            }}
            onSave={handleSaveCourse}
          />
        ) : null}
      </CoursePlannerBottomSheet>
    </>
  );
}
