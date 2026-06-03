import { useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { MapBackdropLayer } from "@/components/common/MapBackdropLayer";
import { isEndAfterStart, isHmString } from "@/components/course-planner/course-date-time";
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
import type { GenerateDateCourseRequest } from "@/features/course-planner/api/date-course-api";
import {
  COURSE_LOADING_ROOM_FALLBACK,
  COURSE_TOAST_DURATION_MS,
  COURSE_TOAST_TEXT,
} from "@/features/course-planner/constants";
import { useCoursePlannerCourses } from "@/features/course-planner/hooks/use-course-planner-courses";
import { useCoursePlannerState } from "@/features/course-planner/hooks/use-course-planner-state";
import { useDateCourseSidosQuery } from "@/features/course-planner/hooks/use-date-course-sidos-query";
import { useDateCourseSigungusQuery } from "@/features/course-planner/hooks/use-date-course-sigungus-query";
import { dateCourseQueryKeys } from "@/features/course-planner/query-keys";
import { usePlaceFilterViewModel } from "@/features/map/hooks/use-place-filter-view-model";
import { type RegionSelectionOption, toRegionSelectionOption } from "@/features/regions";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { resolveFormApiError, resolveGeneralApiErrorMessage } from "@/shared/api/error";
import { MAP_INITIAL_CENTER } from "@/shared/config/map";
import { APP_ROUTES } from "@/shared/config/routes";
import type { CourseSavePayload } from "@/shared/types/course";
import { useRoomSelectionStore } from "@/store/room-selection-store";

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
  const firstFieldError = Object.values(formError.fieldErrors)[0];

  return firstFieldError ?? formError.formError ?? resolveGeneralApiErrorMessage(error);
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
  const dateCourseSigungusQuery = useDateCourseSigungusQuery({
    roomId: selectedRoom?.id ?? null,
    sidoCode: draftSidoCode,
    enabled: mode === "region" && draftSidoCode.length > 0,
  });
  const sidoOptions = useMemo<RegionSelectionOption[]>(
    () => dateCourseSidosQuery.data?.map(toRegionSelectionOption) ?? [],
    [dateCourseSidosQuery.data],
  );
  const sigunguOptions = useMemo<RegionSelectionOption[]>(
    () => dateCourseSigungusQuery.data?.map(toRegionSelectionOption) ?? [],
    [dateCourseSigungusQuery.data],
  );
  const dateCourseSidoEmptyMessage =
    !dateCourseSidosQuery.isLoading && !dateCourseSidosQuery.isError && sidoOptions.length === 0
      ? "방에 저장된 장소가 없거나, 지역 정보가 없어요."
      : null;
  const dateCourseSigunguEmptyMessage =
    draftSidoCode.length > 0 &&
    !dateCourseSigungusQuery.isLoading &&
    !dateCourseSigungusQuery.isError &&
    sigunguOptions.length === 0
      ? "이 시/도에 저장된 시군구가 없어요."
      : null;
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
      setDraftSidoCode(option?.code ?? "");
      setDraftDistrict("");
      setDraftSigunguCode("");
      setSelectedSigunguCode("");
    },
    [handleSelectCity, setDraftDistrict],
  );

  const handleSelectRegionDistrict = useCallback(
    (district: string, option?: RegionSelectionOption) => {
      setDraftDistrict(option?.name ?? district);
      setDraftSigunguCode(option?.code ?? "");
      setSelectedSigunguCode(option?.code ?? "");
    },
    [setDraftDistrict],
  );

  const handleCloseRegionPanel = useCallback(() => {
    setRegionSearchKeyword("");
    setMode("form");
  }, [setMode]);

  const handleConfirmCourseRegion = useCallback(() => {
    setRegionSearchKeyword("");
    const matchedSigungu = sigunguOptions.find((option) => option.name === draftDistrict);
    const nextSigunguCode = draftSigunguCode || matchedSigungu?.code || "";
    if (!nextSigunguCode) {
      showToast("시군구를 선택해주세요.", COURSE_TOAST_DURATION_MS);
      return;
    }

    setSelectedSigunguCode(nextSigunguCode);
    const sigunguName = matchedSigungu?.name ?? draftDistrict;
    const displayLabel =
      draftCity.trim().length > 0 ? `${draftCity} ${sigunguName}`.trim() : sigunguName;
    handleConfirmRegion(displayLabel);
  }, [draftCity, draftDistrict, draftSigunguCode, handleConfirmRegion, showToast, sigunguOptions]);

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
      showToast("방을 선택한 뒤 코스를 만들어주세요.", COURSE_TOAST_DURATION_MS);
      return;
    }

    if (!canGenerateByRegion || effectiveSigunguCode.length === 0) {
      showToast("시군구를 선택해주세요.", COURSE_TOAST_DURATION_MS);
      return;
    }

    if (
      !dateTimeValue ||
      !isHmString(dateTimeValue.startTime) ||
      !isHmString(dateTimeValue.endTime) ||
      !isEndAfterStart(dateTimeValue.startTime, dateTimeValue.endTime)
    ) {
      showToast("날짜와 시간을 설정해주세요", COURSE_TOAST_DURATION_MS);
      return;
    }

    if (
      displayedCourseOrders.length === 0 ||
      displayedCourseOrders.length > 5 ||
      !displayedCourseOrders.every((order) => order.category.trim().length > 0)
    ) {
      showToast("방문할 장소를 선택해주세요.", COURSE_TOAST_DURATION_MS);
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
      showToast(COURSE_TOAST_TEXT.generated, COURSE_TOAST_DURATION_MS);
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
        await saveCourse(selectedCourseId, payload.title);
        await queryClient.invalidateQueries({ queryKey: dateCourseQueryKeys.all });
        handleSaveCourse(payload);
      } catch (error) {
        showToast(resolveCoursePlannerApiErrorMessage(error), COURSE_TOAST_DURATION_MS);
        throw error;
      }
    },
    [handleSaveCourse, queryClient, saveCourse, selectedCourseId, showToast],
  );

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
              fitBoundsPlaces={selectedCourseMapPins}
              routeCoordinates={selectedCourseRouteCoordinates}
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
          isCityLoading={dateCourseSidosQuery.isLoading}
          isDistrictLoading={draftSidoCode.length > 0 && dateCourseSigungusQuery.isLoading}
          cityErrorMessage={dateCourseSidosQuery.isError ? "시/도 정보를 불러오지 못했어요." : null}
          cityEmptyMessage={dateCourseSidoEmptyMessage}
          districtErrorMessage={
            dateCourseSigungusQuery.isError ? "시군구 정보를 불러오지 못했어요." : null
          }
          districtEmptyMessage={
            draftSidoCode.length === 0
              ? "시/도를 먼저 선택해주세요."
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

      <CoursePlannerBottomSheet open={mode === "detail"} onClose={handleBackToCourseResults}>
        <CoursePlaceInfoPanel
          courseTitle={courseTitle}
          stops={courseStops}
          roomId={selectedRoom?.id}
          onBack={handleBackToCourseResults}
          onSave={handleSaveSelectedCourse}
        />
      </CoursePlannerBottomSheet>

      <PlaceDetailSheet roomId={selectedRoom?.id} allowMemoEdit={false} />
    </div>
  );
}
