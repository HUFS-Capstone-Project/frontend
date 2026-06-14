import { useQueryClient } from "@tanstack/react-query";
import { Route } from "lucide-react";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { ListTopBar } from "@/components/common/ListTopBar";
import { MapBackdropLayer } from "@/components/common/MapBackdropLayer";
import { toCoursePlannerCategories } from "@/components/course-planner/course-category-options";
import { isEndAfterStart, isHmString } from "@/components/course-planner/course-date-time";
import { COURSE_ROUTE_FIT_BOUNDS_PADDING } from "@/components/course-planner/course-map-constants";
import { CourseGenerationLoadingPanel } from "@/components/course-planner/CourseGenerationLoadingPanel";
import { CoursePlaceInfoPanel } from "@/components/course-planner/CoursePlaceInfoPanel";
import { CoursePlannerActions } from "@/components/course-planner/CoursePlannerActions";
import { CoursePlannerBottomSheet } from "@/components/course-planner/CoursePlannerBottomSheet";
import {
  type CourseCategoryOrder,
  CoursePlannerPanel,
  type PlaceTypeId,
} from "@/components/course-planner/CoursePlannerPanel";
import { CourseResultPanel } from "@/components/course-planner/CourseResultPanel";
import { DateTimeSelectionScreen } from "@/components/course-planner/DateTimeSelectionScreen";
import { RegionSelectionPanel } from "@/components/course-planner/RegionSelectionPanel";
import { MAP_CHIP_BASE_CLASS, MAP_CHIP_UNSELECTED_CLASS } from "@/components/map/chip-style";
import { weightedMapCenter } from "@/components/mypage/map-places-from-my-saved";
import { PlaceDetailSheet } from "@/components/place/PlaceDetailSheet";
import type { GenerateDateCourseRequest } from "@/features/course-planner/api/date-course-api";
import {
  COURSE_LOADING_ROOM_FALLBACK,
  COURSE_TOAST_DURATION_MS,
} from "@/features/course-planner/constants";
import { useCoursePlannerCourses } from "@/features/course-planner/hooks/use-course-planner-courses";
import { useCoursePlannerState } from "@/features/course-planner/hooks/use-course-planner-state";
import { useDateCourseSidosQuery } from "@/features/course-planner/hooks/use-date-course-sidos-query";
import { useDateCourseSigungusQuery } from "@/features/course-planner/hooks/use-date-course-sigungus-query";
import { isDateCourseConflictError } from "@/features/course-planner/lib/date-course-errors";
import { dateCourseQueryKeys } from "@/features/course-planner/query-keys";
import { usePlaceFilterViewModel } from "@/features/map/hooks/use-place-filter-view-model";
import { type RegionSelectionOption, toRegionSelectionOption } from "@/features/regions";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { cn } from "@/lib/utils";
import { resolveFormApiError, resolveGeneralApiErrorMessage } from "@/shared/api/error";
import { MAP_INITIAL_CENTER } from "@/shared/config/map";
import { APP_ROUTES } from "@/shared/config/routes";
import { COMMON_TEXT, COURSE_TEXT } from "@/shared/config/text";
import type { CourseSavePayload } from "@/shared/types/course";
import { useRoomSelectionStore } from "@/store/room-selection-store";

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
const KakaoMapView = lazy(() =>
  import("@/components/map/KakaoMapView").then((module) => ({ default: module.KakaoMapView })),
);

let nextCourseOrderId = 0;

function createOrder(category: PlaceTypeId): CourseCategoryOrder {
  nextCourseOrderId += 1;
  return {
    id: nextCourseOrderId,
    category,
    tags: [],
  };
}

type GenerateDateCourseRequestInput = {
  courseOrders: CourseCategoryOrder[];
  date: string;
  startTime: string | null;
  endTime: string | null;
  sigunguCode: string;
};

function toGenerateDateCourseRequest({
  courseOrders,
  date,
  startTime,
  endTime,
  sigunguCode,
}: GenerateDateCourseRequestInput): GenerateDateCourseRequest | null {
  if (!isHmString(startTime) || !isHmString(endTime) || !isEndAfterStart(startTime, endTime)) {
    return null;
  }

  const startDateTime = toIsoInstant(date, startTime);
  const endDateTime = toIsoInstant(date, endTime);
  if (!startDateTime || !endDateTime) {
    return null;
  }

  return {
    sigunguCode,
    startDateTime,
    endDateTime,
    categorySequence: courseOrders.slice(0, 5).map((order) => {
      const tagCode = order.tags.find((tag) => tag.trim() !== "" && tag !== "ALL")?.trim();
      return tagCode ? { categoryCode: order.category, tagCode } : { categoryCode: order.category };
    }),
  };
}

function toIsoInstant(dateValue: string, hmValue: string) {
  const dateMatch = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(dateValue);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(hmValue);
  if (!dateMatch || !timeMatch) {
    return null;
  }

  const [, year, month, day] = dateMatch;
  const [, hour, minute] = timeMatch;
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function resolveCoursePlannerApiErrorMessage(error: unknown) {
  const formError = resolveFormApiError(error, {
    knownFields: ["sigunguCode", "startDateTime", "endDateTime", "categorySequence"],
  });

  if (formError.hasFieldErrors || formError.formError) {
    return COMMON_TEXT.validationDetail;
  }

  return resolveGeneralApiErrorMessage(error, { fallback: COMMON_TEXT.defaultApiError });
}

export default function CoursePlannerPage() {
  const queryClient = useQueryClient();
  const selectedRoom = useRoomSelectionStore((s) => s.selectedRoom);
  const { toastMessage, toastPlacement, handleSelectBottomNav, showToast } =
    useBottomNavController();
  const {
    courses,
    defaultCourseId,
    getCourseStops,
    getCourseMapPlaces,
    getCourseRouteCoordinates,
    generateCourses,
    saveCourse,
    clearCourses,
    isGenerating,
  } = useCoursePlannerCourses(selectedRoom?.id ?? null);
  const {
    filterCategories,
    isCategoryLoading,
    isCategoryError,
    retryLoad: retryLoadCategories,
  } = usePlaceFilterViewModel();
  const [regionSearchKeyword, setRegionSearchKeyword] = useState("");
  const [courseOrders, setCourseOrders] = useState<CourseCategoryOrder[]>([]);
  const [draftSidoCode, setDraftSidoCode] = useState("");
  const [draftSigunguCode, setDraftSigunguCode] = useState("");
  const [selectedSigunguCode, setSelectedSigunguCode] = useState("");
  const [isCourseSheetExpanded, setIsCourseSheetExpanded] = useState(false);
  const [routeViewportKey, setRouteViewportKey] = useState(0);

  const {
    mode,
    regionValue,
    draftCity,
    draftDistrict,
    draftDate,
    draftStartTime,
    draftEndTime,
    dateTimeValue,
    selectedCourseId,
    courseTitle,
    courseStops,
    dateTimeDisplayValue,
    canGenerate: canGenerateByRegion,
    setMode,
    setDraftCity,
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

  const dateCourseSidosQuery = useDateCourseSidosQuery({
    roomId: selectedRoom?.id ?? null,
    enabled: mode === "region",
  });
  const sidoOptions = useMemo<RegionSelectionOption[]>(
    () => dateCourseSidosQuery.data?.map(toRegionSelectionOption) ?? [],
    [dateCourseSidosQuery.data],
  );
  const resolvedDraftSidoOption = useMemo(() => {
    if (draftSidoCode.length > 0) {
      return sidoOptions.find((option) => option.code === draftSidoCode) ?? null;
    }

    return (
      sidoOptions.find((option) => option.name === draftCity) ??
      (sidoOptions.length === 1 ? sidoOptions[0] : null)
    );
  }, [draftCity, draftSidoCode, sidoOptions]);
  const effectiveDraftSidoCode = draftSidoCode || resolvedDraftSidoOption?.code || "";
  const dateCourseSigungusQuery = useDateCourseSigungusQuery({
    roomId: selectedRoom?.id ?? null,
    sidoCode: effectiveDraftSidoCode,
    enabled: mode === "region" && effectiveDraftSidoCode.length > 0,
  });
  const sigunguOptions = useMemo<RegionSelectionOption[]>(
    () => dateCourseSigungusQuery.data?.map(toRegionSelectionOption) ?? [],
    [dateCourseSigungusQuery.data],
  );
  const dateCourseSidoEmptyMessage =
    !dateCourseSidosQuery.isLoading && !dateCourseSidosQuery.isError && sidoOptions.length === 0
      ? "방에 저장된 장소가 없어요"
      : null;
  const dateCourseSigunguEmptyMessage =
    effectiveDraftSidoCode.length > 0 &&
    !dateCourseSigungusQuery.isLoading &&
    !dateCourseSigungusQuery.isError &&
    sigunguOptions.length === 0
      ? "이 시/도에 저장된 시군구가 없어요"
      : null;
  const categoryOptions = useMemo(
    () => toCoursePlannerCategories(filterCategories),
    [filterCategories],
  );

  const handleSelectRegionCity = useCallback(
    (city: string, option?: RegionSelectionOption) => {
      handleSelectCity(option?.name ?? city);
      setDraftSidoCode(option?.code ?? "");
      setDraftDistrict("");
      setDraftSigunguCode("");
      setSelectedSigunguCode("");
    },
    [handleSelectCity, setDraftDistrict],
  );

  const handleSelectRegionDistrict = useCallback(
    (district: string, option?: RegionSelectionOption) => {
      if (option?.parentSidoCode && option.parentSidoName) {
        setDraftSidoCode(option.parentSidoCode);
        setDraftCity(option.parentSidoName);
      }

      setDraftDistrict(option?.name ?? district);
      setDraftSigunguCode(option?.code ?? "");
      setSelectedSigunguCode(option?.code ?? "");
    },
    [setDraftCity, setDraftDistrict],
  );

  const handleCloseRegionPanel = useCallback(() => {
    setRegionSearchKeyword("");
    setMode("form");
  }, [setMode]);

  const handleOpenRegionPanel = useCallback(() => {
    const nextSidoOption = resolvedDraftSidoOption;
    if (nextSidoOption?.code && nextSidoOption.code !== draftSidoCode) {
      setDraftSidoCode(nextSidoOption.code);
    }

    if (nextSidoOption?.name && draftCity.trim().length === 0) {
      setDraftCity(nextSidoOption.name);
    }

    if (!selectedSigunguCode && !draftSigunguCode) {
      setDraftDistrict("");
    }

    setRegionSearchKeyword("");
    setMode("region");
  }, [
    draftCity,
    draftSidoCode,
    draftSigunguCode,
    resolvedDraftSidoOption,
    selectedSigunguCode,
    setDraftCity,
    setDraftDistrict,
    setMode,
  ]);

  const handleConfirmCourseRegion = useCallback(() => {
    setRegionSearchKeyword("");
    const matchedSigungu = sigunguOptions.find((option) => option.name === draftDistrict);
    const nextSigunguCode = draftSigunguCode || matchedSigungu?.code || "";
    if (!nextSigunguCode) {
      showToast(COURSE_TEXT.toast.selectSigungu, COURSE_TOAST_DURATION_MS);
      return;
    }

    setSelectedSigunguCode(nextSigunguCode);
    const sigunguName = matchedSigungu?.name ?? draftDistrict;
    const sidoName =
      draftCity.trim() || resolvedDraftSidoOption?.name || matchedSigungu?.parentSidoName || "";
    const displayLabel = sidoName ? `${sidoName} ${sigunguName}`.trim() : sigunguName;
    handleConfirmRegion(displayLabel);
  }, [
    draftCity,
    draftDistrict,
    draftSigunguCode,
    handleConfirmRegion,
    resolvedDraftSidoOption?.name,
    showToast,
    sigunguOptions,
  ]);

  const handleAddOrder = useCallback(() => {
    if (courseOrders.length >= 5) {
      return;
    }

    const defaultCategory = categoryOptions[0]?.id;
    if (!defaultCategory) {
      return;
    }

    setCourseOrders((current) =>
      current.length > 0
        ? [...current, createOrder(defaultCategory)]
        : [createOrder(defaultCategory), createOrder(defaultCategory)],
    );
  }, [categoryOptions, courseOrders.length]);

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
    setDraftSidoCode("");
    setDraftSigunguCode("");
    setSelectedSigunguCode("");
    clearCourses();
    resetPlannerBase();
  }, [clearCourses, resetPlannerBase]);

  const displayedCourseOrders = useMemo(() => {
    const defaultCategory = categoryOptions[0]?.id;
    if (courseOrders.length > 0 || !defaultCategory) {
      return courseOrders;
    }

    return [{ ...createOrder(defaultCategory), id: -1 }];
  }, [categoryOptions, courseOrders]);

  const effectiveSigunguCode = useMemo(() => {
    const confirmedCode = selectedSigunguCode.trim();
    if (confirmedCode.length > 0) {
      return confirmedCode;
    }

    const draftCode = draftSigunguCode.trim();
    if (draftCode.length > 0) {
      return draftCode;
    }

    const matchedSigungu = sigunguOptions.find(
      (option) => option.name === draftDistrict || option.name === regionValue.trim(),
    );

    return matchedSigungu?.code ?? "";
  }, [draftDistrict, draftSigunguCode, regionValue, selectedSigunguCode, sigunguOptions]);

  const canAttemptGenerate = !isGenerating;

  const handleGenerateCourse = useCallback(async () => {
    if (isGenerating) {
      return;
    }

    if (!selectedRoom?.id) {
      showToast(COURSE_TEXT.toast.selectRoomFirst, COURSE_TOAST_DURATION_MS);
      return;
    }

    if (!canGenerateByRegion || effectiveSigunguCode.length === 0) {
      showToast(COURSE_TEXT.toast.selectSigungu, COURSE_TOAST_DURATION_MS);
      return;
    }

    if (
      !dateTimeValue ||
      !isHmString(dateTimeValue.startTime) ||
      !isHmString(dateTimeValue.endTime) ||
      !isEndAfterStart(dateTimeValue.startTime, dateTimeValue.endTime)
    ) {
      showToast(COURSE_TEXT.toast.setDateTime, COURSE_TOAST_DURATION_MS);
      return;
    }

    if (
      displayedCourseOrders.length === 0 ||
      displayedCourseOrders.length > 5 ||
      !displayedCourseOrders.every((order) => order.category.trim().length > 0)
    ) {
      showToast(COURSE_TEXT.toast.selectPlaces, COURSE_TOAST_DURATION_MS);
      return;
    }

    const payload = toGenerateDateCourseRequest({
      courseOrders: displayedCourseOrders,
      date: dateTimeValue.date,
      startTime: dateTimeValue.startTime,
      endTime: dateTimeValue.endTime,
      sigunguCode: effectiveSigunguCode,
    });

    if (!payload) {
      return;
    }

    setMode("loading");
    clearCourses();
    try {
      await generateCourses(payload);
      showToast(COURSE_TEXT.toast.generated, COURSE_TOAST_DURATION_MS);
      setMode("result");
    } catch (error) {
      setMode("form");
      showToast(resolveCoursePlannerApiErrorMessage(error), COURSE_TOAST_DURATION_MS);
    }
  }, [
    canGenerateByRegion,
    clearCourses,
    dateTimeValue,
    displayedCourseOrders,
    effectiveSigunguCode,
    generateCourses,
    isGenerating,
    selectedRoom?.id,
    setMode,
    showToast,
  ]);

  const selectedCourseMapPins = useMemo(
    () => getCourseMapPlaces(selectedCourseId || defaultCourseId),
    [defaultCourseId, getCourseMapPlaces, selectedCourseId],
  );
  const selectedCourseRouteCoordinates = useMemo(
    () => getCourseRouteCoordinates(selectedCourseId || defaultCourseId),
    [defaultCourseId, getCourseRouteCoordinates, selectedCourseId],
  );
  const selectedCourseMarkerLabelByPlaceId = useMemo(
    () =>
      selectedCourseMapPins.reduce<Record<string, string>>((labels, place, index) => {
        labels[place.id] = String(index + 1);
        return labels;
      }, {}),
    [selectedCourseMapPins],
  );
  const selectedCourseMapCenter = useMemo(
    () =>
      selectedCourseMapPins.length > 0
        ? weightedMapCenter(selectedCourseMapPins)
        : MAP_INITIAL_CENTER,
    [selectedCourseMapPins],
  );

  const handleSaveSelectedCourse = useCallback(
    async (payload: CourseSavePayload) => {
      if (payload.kind === "edit") {
        handleSaveCourse(payload);
        return;
      }

      if (!selectedCourseId) {
        return;
      }

      try {
        await saveCourse(
          selectedCourseId,
          payload.title,
          payload.stops.map((stop) => stop.roomPlaceId),
        );
        await queryClient.invalidateQueries({ queryKey: dateCourseQueryKeys.all });
        handleSaveCourse(payload);
      } catch (error) {
        if (isDateCourseConflictError(error)) {
          throw error;
        }
        showToast(resolveCoursePlannerApiErrorMessage(error), COURSE_TOAST_DURATION_MS);
        throw error;
      }
    },
    [handleSaveCourse, queryClient, saveCourse, selectedCourseId, showToast],
  );

  const handleSelectCourseRoute = useCallback(
    (courseId: string) => {
      setIsCourseSheetExpanded(false);
      setRouteViewportKey((current) => current + 1);
      handleSelectCourse(courseId);
    },
    [handleSelectCourse],
  );

  const handleBackToCourseResultsRoute = useCallback(() => {
    setIsCourseSheetExpanded(false);
    handleBackToCourseResults();
  }, [handleBackToCourseResults]);

  const handleShowRoute = useCallback(() => {
    setIsCourseSheetExpanded(false);
    setRouteViewportKey((current) => current + 1);
  }, []);

  if (!selectedRoom) {
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
              fitBoundsCoordinates={selectedCourseRouteCoordinates}
              fitBoundsPadding={COURSE_ROUTE_FIT_BOUNDS_PADDING}
              routeCoordinates={selectedCourseRouteCoordinates}
              markerLabelByPlaceId={selectedCourseMarkerLabelByPlaceId}
              viewportKey={`course-detail-${selectedCourseId ?? "default"}-${routeViewportKey}`}
              className="h-full w-full"
            />
          </Suspense>
        </MapBackdropLayer>
      ) : null}

      {mode === "detail" ? (
        <ListTopBar
          title={selectedRoom.name}
          trailing={`${selectedCourseMapPins.length}개 장소`}
          variant="overlay"
          backLabel="코스 목록으로 돌아가기"
          onBack={handleBackToCourseResultsRoute}
        />
      ) : null}

      {mode === "detail" ? (
        <div className="pointer-events-none absolute top-[max(5rem,calc(var(--inset-top)+4.5rem))] left-[max(1rem,var(--inset-left))] z-40 flex items-center">
          <button
            type="button"
            onClick={handleShowRoute}
            className={cn(
              MAP_CHIP_BASE_CLASS,
              MAP_CHIP_UNSELECTED_CLASS,
              "hover:bg-muted/70 active:bg-muted pointer-events-auto h-9 px-3 font-semibold transition-colors",
            )}
          >
            <Route className="size-3.5" aria-hidden />
            경로 보기
          </button>
        </div>
      ) : null}

      {mode !== "detail" ? (
        <main className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto pb-[max(7rem,calc(var(--inset-bottom)+7rem))]">
          <div className="flex min-h-0 w-full max-w-full min-w-0 flex-1 flex-col">
            {mode === "form" || mode === "region" || mode === "datetime" ? (
              <>
                <CoursePlannerPanel
                  roomName={selectedRoom.name}
                  roomAvatarSeed={selectedRoom.avatarSeed}
                  roomMemberCount={selectedRoom.memberCount}
                  regionValue={regionValue}
                  dateTimeValue={dateTimeDisplayValue}
                  courseOrders={displayedCourseOrders}
                  categoryOptions={categoryOptions}
                  isCategoryLoading={isCategoryLoading}
                  isCategoryError={isCategoryError}
                  className="pt-16 pb-0"
                  onOpenRegionSelect={handleOpenRegionPanel}
                  onOpenDateTimeSelect={handleOpenDateTimeSelect}
                  onAddOrder={handleAddOrder}
                  onRemoveOrder={handleRemoveOrder}
                  onSelectOrderCategory={handleSelectOrderCategory}
                  onToggleOrderTag={handleToggleOrderTag}
                  onRetryLoadCategories={() => {
                    void retryLoadCategories();
                  }}
                />

                <div className="bg-background px-6 pt-6 pb-[max(5rem,calc(var(--inset-bottom)+5rem))]">
                  <CoursePlannerActions
                    canGenerate={canAttemptGenerate}
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
                onSelectCourse={handleSelectCourseRoute}
                className="pt-16 pb-8"
              />
            ) : null}
          </div>
        </main>
      ) : null}

      {mode !== "detail" ? (
        <div className="android-keyboard-lift pointer-events-none absolute inset-x-0 bottom-0 z-30 *:pointer-events-auto">
          <BottomNavToast message={toastMessage} placement={toastPlacement} />
          <BottomNavigationBar activeId="course" onSelect={handleSelectBottomNav} />
        </div>
      ) : null}

      <CoursePlannerBottomSheet open={mode === "region"} onClose={handleCloseRegionPanel}>
        <RegionSelectionPanel
          selectedCity={draftCity}
          selectedDistrict={draftDistrict}
          cityOptions={sidoOptions}
          districtOptions={sigunguOptions}
          isCityLoading={dateCourseSidosQuery.isLoading}
          isDistrictLoading={effectiveDraftSidoCode.length > 0 && dateCourseSigungusQuery.isLoading}
          cityErrorMessage={dateCourseSidosQuery.isError ? "시/도 정보를 불러오지 못했어요" : null}
          cityEmptyMessage={dateCourseSidoEmptyMessage}
          districtErrorMessage={
            dateCourseSigungusQuery.isError ? "시군구 정보를 불러오지 못했어요" : null
          }
          districtEmptyMessage={
            effectiveDraftSidoCode.length === 0
              ? "시/도를 먼저 선택해주세요"
              : dateCourseSigunguEmptyMessage
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

      <CoursePlannerBottomSheet
        open={mode === "detail"}
        onClose={handleBackToCourseResultsRoute}
        className="pointer-events-none"
        overlayClassName="pointer-events-none bg-transparent"
        panelClassName={cn(
          "pointer-events-auto",
          !isCourseSheetExpanded && "h-[24dvh] min-h-[9.5rem] max-h-[12rem]",
        )}
        contentClassName={!isCourseSheetExpanded ? "h-full overflow-hidden!" : undefined}
        onHandleClick={() => setIsCourseSheetExpanded((current) => !current)}
        onDragDismiss={() => setIsCourseSheetExpanded(false)}
      >
        <CoursePlaceInfoPanel
          courseTitle={courseTitle}
          stops={courseStops}
          roomId={selectedRoom?.id}
          onBack={handleBackToCourseResultsRoute}
          onSave={handleSaveSelectedCourse}
          collapsed={!isCourseSheetExpanded}
          onExpand={() => setIsCourseSheetExpanded(true)}
        />
      </CoursePlannerBottomSheet>

      <PlaceDetailSheet roomId={selectedRoom?.id} allowMemoEdit={false} />
    </div>
  );
}
