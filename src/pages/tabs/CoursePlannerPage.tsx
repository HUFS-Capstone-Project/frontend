import { useCallback, useMemo, useState } from "react";
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
import { useCoursePlannerCourses } from "@/features/course-planner/hooks/use-course-planner-courses";
import { useCoursePlannerState } from "@/features/course-planner/hooks/use-course-planner-state";
import { useMapSearchFilters } from "@/features/map/hooks/use-map-search-filters";
import { usePlaceFilterViewModel } from "@/features/map/hooks/use-place-filter-view-model";
import {
  REGION_ALL_CODE,
  REGION_ALL_OPTION,
  type RegionSelectionOption,
  useSidosQuery,
  useSigungusQueries,
  useSigungusQuery,
} from "@/features/regions";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import MapHomeWithDetail from "@/pages/map/MapHomeWithDetail";
import { APP_ROUTES } from "@/shared/config/routes";
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
  const { courses, defaultCourseId, getCourseStops } = useCoursePlannerCourses();
  const [regionSearchKeyword, setRegionSearchKeyword] = useState("");

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
    courses,
    defaultCourseId,
    getCourseStops,
    closeTagPanel,
    resetCategorySelection,
    showToast,
  });
  const sidosQuery = useSidosQuery();
  const sidoOptions = sidosQuery.data?.length ? sidosQuery.data : [REGION_ALL_OPTION];
  const searchableSidoOptions = useMemo(
    () => sidosQuery.data?.filter((sido) => sido.code !== REGION_ALL_CODE) ?? [],
    [sidosQuery.data],
  );
  const draftSidoOption = useMemo(() => {
    return (
      searchableSidoOptions.find(
        (sido) => sido.name === draftCity || sido.name.includes(draftCity),
      ) ?? null
    );
  }, [draftCity, searchableSidoOptions]);
  const isRegionSearching = regionSearchKeyword.trim().length > 0;
  const sigungusQuery = useSigungusQuery({
    sidoCode: draftSidoOption?.code ?? REGION_ALL_CODE,
    enabled: mode === "region" && !isRegionSearching,
  });
  const allSigungusQueries = useSigungusQueries({
    sidoCodes: searchableSidoOptions.map((sido) => sido.code),
    enabled: mode === "region" && isRegionSearching,
  });
  const allSigunguOptions = useMemo((): RegionSelectionOption[] => {
    return allSigungusQueries.flatMap((query, index) => {
      const parentSido = searchableSidoOptions[index];
      if (!parentSido || !query.data) {
        return [];
      }

      return query.data
        .filter((sigungu) => sigungu.code !== REGION_ALL_CODE)
        .map((sigungu) => ({
          code: sigungu.code,
          name: sigungu.name,
          displayName: `${parentSido.name} ${sigungu.name}`,
          parentSidoCode: parentSido.code,
          parentSidoName: parentSido.name,
        }));
    });
  }, [allSigungusQueries, searchableSidoOptions]);
  const sigunguOptions = isRegionSearching
    ? allSigunguOptions
    : draftSidoOption
      ? sigungusQuery.data?.length
        ? sigungusQuery.data
        : [REGION_ALL_OPTION]
      : [REGION_ALL_OPTION];
  const isAllSigunguSearchLoading =
    isRegionSearching &&
    allSigungusQueries.some((query) => query.isLoading || query.isFetching) &&
    allSigunguOptions.length === 0;
  const isAllSigunguSearchError =
    isRegionSearching &&
    allSigungusQueries.length > 0 &&
    allSigungusQueries.every((query) => query.isError);

  const handleSelectRegionCity = useCallback(
    (city: string, option?: RegionSelectionOption) => {
      handleSelectCity(option?.name ?? city);
    },
    [handleSelectCity],
  );

  const handleSelectRegionDistrict = useCallback(
    (district: string, option?: RegionSelectionOption) => {
      if (option?.parentSidoName) {
        handleSelectCity(option.parentSidoName);
        setDraftDistrict(option.name);
        return;
      }

      setDraftDistrict(option?.name ?? district);
    },
    [handleSelectCity, setDraftDistrict],
  );

  const handleCloseRegionPanel = useCallback(() => {
    setRegionSearchKeyword("");
    setMode("form");
  }, [setMode]);

  const handleConfirmCourseRegion = useCallback(() => {
    setRegionSearchKeyword("");
    handleConfirmRegion();
  }, [handleConfirmRegion]);

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
            cityOptions={sidoOptions}
            districtOptions={sigunguOptions}
            isCityLoading={sidosQuery.isLoading}
            isDistrictLoading={
              isAllSigunguSearchLoading ||
              (!isRegionSearching && Boolean(draftSidoOption) && sigungusQuery.isLoading)
            }
            cityErrorMessage={sidosQuery.isError ? "지역 정보를 불러오지 못했어요." : null}
            districtErrorMessage={
              isAllSigunguSearchError
                ? "시/군/구 정보를 확인할 수 없어요."
                : !isRegionSearching && draftSidoOption && sigungusQuery.isError
                  ? "시/군/구 정보를 확인할 수 없어요."
                  : null
            }
            searchKeyword={regionSearchKeyword}
            onSearchKeywordChange={setRegionSearchKeyword}
            onSelectCity={handleSelectRegionCity}
            onSelectDistrict={handleSelectRegionDistrict}
            onClose={handleCloseRegionPanel}
            onConfirm={handleConfirmCourseRegion}
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
            courses={courses}
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
