import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { MapBackdropLayer } from "@/components/common/MapBackdropLayer";
import { CourseGenerationLoadingPanel } from "@/components/course-planner/CourseGenerationLoadingPanel";
import { CoursePlaceInfoPanel } from "@/components/course-planner/CoursePlaceInfoPanel";
import { CoursePlannerActions } from "@/components/course-planner/CoursePlannerActions";
import { CoursePlannerBottomSheet } from "@/components/course-planner/CoursePlannerBottomSheet";
import {
  type CourseCategoryOrder,
  type CoursePlannerCategory,
  CoursePlannerPanel,
  type PlaceTypeId,
} from "@/components/course-planner/CoursePlannerPanel";
import { CourseResultPanel } from "@/components/course-planner/CourseResultPanel";
import { DateTimeSelectionScreen } from "@/components/course-planner/DateTimeSelectionScreen";
import { RegionSelectionPanel } from "@/components/course-planner/RegionSelectionPanel";
import { weightedMapCenter } from "@/components/mypage/map-places-from-my-saved";
import { PlaceDetailSheet } from "@/components/place/PlaceDetailSheet";
import { COURSE_LOADING_ROOM_FALLBACK } from "@/features/course-planner/constants";
import { useCoursePlannerCourses } from "@/features/course-planner/hooks/use-course-planner-courses";
import { useCoursePlannerState } from "@/features/course-planner/hooks/use-course-planner-state";
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
import { APP_ROUTES } from "@/shared/config/routes";
import { MAP_INITIAL_CENTER, SAVED_PLACE_BY_ID } from "@/shared/mocks/place-mocks";
import { useRoomSelectionStore } from "@/store/room-selection-store";

type CoursePlannerPageProps = {
  skipRoomGuard?: boolean;
};

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
const KakaoMapView = lazy(() =>
  import("@/components/map/KakaoMapView").then((module) => ({ default: module.KakaoMapView })),
);

function createOrder(category: PlaceTypeId): CourseCategoryOrder {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    category,
    tags: [],
  };
}

export default function CoursePlannerPage({ skipRoomGuard = false }: CoursePlannerPageProps) {
  const selectedRoom = useRoomSelectionStore((s) => s.selectedRoom);
  const { toastMessage, toastPlacement, handleSelectBottomNav, showToast } =
    useBottomNavController();
  const { courses, defaultCourseId, getCourseStops } = useCoursePlannerCourses();
  const {
    filterCategories,
    isCategoryLoading,
    isCategoryError,
    retryLoad: retryLoadCategories,
  } = usePlaceFilterViewModel();
  const [regionSearchKeyword, setRegionSearchKeyword] = useState("");
  const [courseOrders, setCourseOrders] = useState<CourseCategoryOrder[]>([]);

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
    canGenerate: canGenerateByRegion,
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
    handleResetPlanner: resetPlannerBase,
    handleGenerateCourse: generateCourseBase,
    handleSelectCourse,
    handleBackToCourseResults,
    handleSaveCourse,
  } = useCoursePlannerState({
    courses,
    defaultCourseId,
    getCourseStops,
    closeTagPanel: () => undefined,
    resetCategorySelection: () => undefined,
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
  const categoryOptions = useMemo<CoursePlannerCategory[]>(() => {
    return filterCategories
      .filter((category) => {
        const code = category.code.trim().toLocaleLowerCase("ko-KR");
        const name = category.name.trim();
        return code !== "all" && name !== "전체";
      })
      .map((category) => {
        const tagGroups = category.tagGroups
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((group) => ({
            code: group.code,
            name: group.name,
            sortOrder: group.sortOrder,
            tags: group.tags
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((tag) => ({
                code: tag.code,
                name: tag.name,
                sortOrder: tag.sortOrder,
              })),
          }));
        const tags = tagGroups.flatMap((group) => group.tags);

        return {
          id: category.code,
          label: category.name,
          tagGroups,
          tags,
        };
      });
  }, [filterCategories]);

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

  const handleAddOrder = useCallback(() => {
    const defaultCategory = categoryOptions[0]?.id;
    if (!defaultCategory) {
      return;
    }

    setCourseOrders((current) =>
      current.length > 0
        ? [...current, createOrder(defaultCategory)]
        : [createOrder(defaultCategory), createOrder(defaultCategory)],
    );
  }, [categoryOptions]);

  const handleRemoveOrder = useCallback((orderId: number) => {
    setCourseOrders((current) => current.filter((order) => order.id !== orderId));
  }, []);

  const handleSelectOrderCategory = useCallback((orderId: number, placeTypeId: PlaceTypeId) => {
    setCourseOrders((current) =>
      current.some((order) => order.id === orderId)
        ? current.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  category: placeTypeId,
                  tags: [],
                }
              : order,
          )
        : [createOrder(placeTypeId)],
    );
  }, []);

  const handleToggleOrderTag = useCallback(
    (orderId: number, tag: string) => {
      setCourseOrders((current) =>
        current.some((order) => order.id === orderId)
          ? current.map((order) => {
              if (order.id !== orderId) {
                return order;
              }

              const selectedCategory = categoryOptions.find(
                (category) => category.id === order.category,
              );
              const allTagCode = selectedCategory?.tags.find((item) => item.code === "ALL")?.code;
              const hasTag = order.tags.includes(tag);
              const tagsWithoutAll = allTagCode
                ? order.tags.filter((item) => item !== allTagCode)
                : order.tags;

              return {
                ...order,
                tags:
                  allTagCode && tag === allTagCode
                    ? hasTag
                      ? []
                      : [allTagCode]
                    : hasTag
                      ? tagsWithoutAll.filter((item) => item !== tag)
                      : [...tagsWithoutAll, tag],
              };
            })
          : categoryOptions[0]?.id
            ? [{ ...createOrder(categoryOptions[0].id), tags: [tag] }]
            : current,
      );
    },
    [categoryOptions],
  );

  const handleResetPlanner = useCallback(() => {
    setCourseOrders([]);
    resetPlannerBase();
  }, [resetPlannerBase]);

  const canGenerate =
    canGenerateByRegion &&
    courseOrders.length > 0 &&
    courseOrders.every((order) => order.tags.length > 0);

  const handleGenerateCourse = useCallback(() => {
    if (!canGenerate) {
      return;
    }
    generateCourseBase();
  }, [canGenerate, generateCourseBase]);

  const displayedCourseOrders = useMemo(() => {
    const defaultCategory = categoryOptions[0]?.id;
    if (courseOrders.length > 0 || !defaultCategory) {
      return courseOrders;
    }

    return [{ ...createOrder(defaultCategory), id: -1 }];
  }, [categoryOptions, courseOrders]);

  const selectedCourseMapPins = useMemo(
    () =>
      courseStops
        .map((stop) => SAVED_PLACE_BY_ID.get(stop.placeId))
        .filter((place) => place != null),
    [courseStops],
  );
  const selectedCourseMapCenter = useMemo(
    () =>
      selectedCourseMapPins.length > 0
        ? weightedMapCenter(selectedCourseMapPins)
        : MAP_INITIAL_CENTER,
    [selectedCourseMapPins],
  );

  if (!skipRoomGuard && !selectedRoom) {
    return <Navigate to={APP_ROUTES.room} replace />;
  }

  return (
    <div className="room-no-caret -m-page bg-background relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {mode === "detail" ? (
        <MapBackdropLayer>
          <Suspense fallback={<div className="bg-muted h-full w-full" aria-hidden />}>
            <KakaoMapView
              appKey={KAKAO_MAP_APP_KEY}
              places={selectedCourseMapPins}
              center={selectedCourseMapCenter}
              fitBoundsPlaces={selectedCourseMapPins}
              viewportKey={`course-detail-${selectedCourseId ?? "default"}`}
              className="h-full w-full"
            />
          </Suspense>
        </MapBackdropLayer>
      ) : null}

      <main className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto pb-[max(7rem,calc(env(safe-area-inset-bottom)+7rem))]">
        <div className="flex min-h-0 w-full max-w-full min-w-0 flex-1 flex-col">
          {mode === "form" || mode === "region" || mode === "datetime" ? (
            <>
              <CoursePlannerPanel
                regionValue={regionValue}
                dateTimeValue={dateTimeDisplayValue}
                courseOrders={displayedCourseOrders}
                categoryOptions={categoryOptions}
                isCategoryLoading={isCategoryLoading}
                isCategoryError={isCategoryError}
                className="pt-16 pb-0"
                onOpenRegionSelect={() => setMode("region")}
                onOpenDateTimeSelect={handleOpenDateTimeSelect}
                onAddOrder={handleAddOrder}
                onRemoveOrder={handleRemoveOrder}
                onSelectOrderCategory={handleSelectOrderCategory}
                onToggleOrderTag={handleToggleOrderTag}
                onRetryLoadCategories={() => {
                  void retryLoadCategories();
                }}
              />

              <div className="bg-background px-6 pt-6 pb-[max(5rem,calc(env(safe-area-inset-bottom)+5rem))]">
                <CoursePlannerActions
                  canGenerate={canGenerate}
                  onGenerate={handleGenerateCourse}
                  onReset={handleResetPlanner}
                  className="mt-0"
                />
              </div>
            </>
          ) : null}

          {mode === "loading" ? (
            <CourseGenerationLoadingPanel
              roomName={selectedRoom?.name ?? COURSE_LOADING_ROOM_FALLBACK}
              className="pt-16 pb-8"
            />
          ) : null}

          {mode === "result" ? (
            <CourseResultPanel
              courses={courses}
              selectedCourseId={selectedCourseId}
              onSelectCourse={handleSelectCourse}
              className="pt-16 pb-8"
            />
          ) : null}
        </div>
      </main>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 *:pointer-events-auto">
        <BottomNavToast message={toastMessage} placement={toastPlacement} />
        <BottomNavigationBar activeId="course" onSelect={handleSelectBottomNav} />
      </div>

      <CoursePlannerBottomSheet open={mode === "region"} onClose={handleCloseRegionPanel}>
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
              ? "시군구 정보를 확인할 수 없어요."
              : !isRegionSearching && draftSidoOption && sigungusQuery.isError
                ? "시군구 정보를 확인할 수 없어요."
                : null
          }
          searchKeyword={regionSearchKeyword}
          onSearchKeywordChange={setRegionSearchKeyword}
          onSelectCity={handleSelectRegionCity}
          onSelectDistrict={handleSelectRegionDistrict}
          onClose={handleCloseRegionPanel}
          onConfirm={handleConfirmCourseRegion}
        />
      </CoursePlannerBottomSheet>

      <CoursePlannerBottomSheet open={mode === "datetime"} onClose={handleCloseDateTimeScreen}>
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
      </CoursePlannerBottomSheet>

      <CoursePlannerBottomSheet open={mode === "detail"} onClose={handleBackToCourseResults}>
        <CoursePlaceInfoPanel
          courseTitle={courseTitle}
          stops={courseStops}
          roomId={selectedRoom?.id}
          onBack={handleBackToCourseResults}
          onSave={handleSaveCourse}
        />
      </CoursePlannerBottomSheet>

      <PlaceDetailSheet roomId={selectedRoom?.id} />
    </div>
  );
}
