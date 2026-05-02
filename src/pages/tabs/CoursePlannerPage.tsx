import { useCallback, useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { BottomNavToast } from "@/components/common/BottomNavToast";
import { CourseGenerationLoadingPanel } from "@/components/course-planner/CourseGenerationLoadingPanel";
import { CoursePlaceInfoPanel } from "@/components/course-planner/CoursePlaceInfoPanel";
import { CoursePlannerBottomSheet } from "@/components/course-planner/CoursePlannerBottomSheet";
import { CoursePlannerPanel } from "@/components/course-planner/CoursePlannerPanel";
import { CourseResultPanel } from "@/components/course-planner/CourseResultPanel";
import { DateTimeSelectionScreen } from "@/components/course-planner/DateTimeSelectionScreen";
import { RegionSelectionPanel } from "@/components/course-planner/RegionSelectionPanel";
import { PlaceDetailSheet } from "@/components/place/PlaceDetailSheet";
import { CourseDevMapBackground } from "@/features/course-planner/components/CourseDevMapBackground";
import { COURSE_LOADING_ROOM_FALLBACK } from "@/features/course-planner/constants";
import { useCoursePlannerState } from "@/features/course-planner/hooks/use-course-planner-state";
import { useMapSearchFilters } from "@/features/map/hooks/use-map-search-filters";
import { usePlaceFilterViewModel } from "@/features/map/hooks/use-place-filter-view-model";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import MapHomeWithDetail from "@/pages/map/MapHomeWithDetail";
import { APP_ROUTES } from "@/shared/config/routes";
import { COURSE_OPTIONS } from "@/shared/mocks/course-mocks";
import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import { MAP_ALL_CATEGORY_FILTER_CHIP } from "@/shared/types/map-home";
import { useRoomSelectionStore } from "@/store/room-selection-store";

type CoursePlannerPageProps = {
  skipRoomGuard?: boolean;
};

export default function CoursePlannerPage({ skipRoomGuard = false }: CoursePlannerPageProps) {
  const navigate = useNavigate();
  const selectedRoom = useRoomSelectionStore((s) => s.selectedRoom);
  const { toastMessage, toastPlacement, handleSelectBottomNav, showToast } =
    useBottomNavController();

  const {
    filterCategories,
    categories,
    categoryNameByCode,
    isCategoryLoading,
    isCategoryError,
    retryLoad,
  } = usePlaceFilterViewModel();

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
    initialFocusedCategory: "놀거리",
  });

  const resetCategorySelection = useCallback(() => {
    toggleCategory(MAP_ALL_CATEGORY_FILTER_CHIP);
  }, [toggleCategory]);

  const {
    mode,
    regionValue,
    draftCity,
    draftDistrict,
    draftDate,
    draftStartTime,
    draftEndTime,
    selectedCourseId,
    courseTitle,
    courseStops,
    dateTimeDisplayValue,
    canGenerate,
    setMode,
    setDraftDistrict,
    setDraftDate,
    setDraftStartTime,
    setDraftEndTime,
    handleOpenDateTimeSelect,
    handleCloseDateTimeScreen,
    handleConfirmDateTime,
    handleSelectCity,
    handleConfirmRegion,
    handleResetPlanner,
    handleGenerateCourse,
    handleSelectCourse,
    handleBackToCourseResults,
    handleSaveCourse,
  } = useCoursePlannerState({
    closeTagPanel,
    resetCategorySelection,
    showToast,
  });

  const handleRetryLoadCategories = useCallback(() => {
    void retryLoad();
  }, [retryLoad]);

  const handleDismissCourse = useCallback(() => {
    navigate(APP_ROUTES.map);
  }, [navigate]);

  const placeFilterBarProps = useMemo(
    () => ({
      categories,
      categoryNameByCode,
      filterCategories,
      isCategoryLoading,
      isCategoryError,
      onRetryLoadCategories: handleRetryLoadCategories,
      activeCategories,
      focusedCategory,
      onToggleCategory: toggleCategory,
      isTagPanelOpen,
      selectedTagKeysByCategory,
      selectedTagCountByCategory,
      onToggleTagInCategory: toggleTagInCategory,
      onResetFocusedCategoryTags: resetFocusedCategoryTags,
      onCloseTagPanel: closeTagPanel,
    }),
    [
      activeCategories,
      categories,
      categoryNameByCode,
      closeTagPanel,
      filterCategories,
      focusedCategory,
      handleRetryLoadCategories,
      isCategoryError,
      isCategoryLoading,
      isTagPanelOpen,
      resetFocusedCategoryTags,
      selectedTagCountByCategory,
      selectedTagKeysByCategory,
      toggleCategory,
      toggleTagInCategory,
    ],
  );

  if (!skipRoomGuard && !selectedRoom) {
    return <Navigate to={APP_ROUTES.room} replace />;
  }

  return (
    <>
      {selectedRoom ? (
        <MapHomeWithDetail />
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
            dateTimeValue={dateTimeDisplayValue}
            canGenerate={canGenerate}
            placeFilterBarProps={placeFilterBarProps}
            onOpenRegionSelect={() => setMode("region")}
            onOpenDateTimeSelect={handleOpenDateTimeSelect}
            onGenerate={handleGenerateCourse}
            onReset={handleResetPlanner}
          />
        ) : null}

        {mode === "loading" ? (
          <CourseGenerationLoadingPanel
            roomName={selectedRoom?.name ?? COURSE_LOADING_ROOM_FALLBACK}
          />
        ) : null}

        {mode === "result" ? (
          <CourseResultPanel
            courses={COURSE_OPTIONS}
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
          />
        ) : null}

        {mode === "detail" ? (
          <CoursePlaceInfoPanel
            courseTitle={courseTitle}
            stops={courseStops}
            onBack={handleBackToCourseResults}
            onSave={handleSaveCourse}
          />
        ) : null}
      </CoursePlannerBottomSheet>
    </>
  );
}
