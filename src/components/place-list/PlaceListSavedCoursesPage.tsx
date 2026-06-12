import { AlertCircle, Check, ChevronDown, Route, User } from "lucide-react";
import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";

import { type BottomNavId, BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { EmptyState } from "@/components/common/EmptyState";
import { LIST_TOP_BAR_AFTER_TITLE_CLASS, ListTopBar } from "@/components/common/ListTopBar";
import { MapBackdropLayer } from "@/components/common/MapBackdropLayer";
import { CoursePlaceInfoPanel } from "@/components/course-planner/CoursePlaceInfoPanel";
import { CoursePlannerBottomSheet } from "@/components/course-planner/CoursePlannerBottomSheet";
import { DateCalendarPanel } from "@/components/course-planner/DateTimeSelectionPanel";
import {
  MAP_CHIP_BASE_CLASS,
  MAP_CHIP_SELECTED_CLASS,
  MAP_CHIP_UNSELECTED_CLASS,
  MAP_FILTER_PANEL_BASE_CLASS,
} from "@/components/map/chip-style";
import { weightedMapCenter } from "@/components/mypage/map-places-from-my-saved";
import {
  getSavedCourseRouteMapData,
  mapPlacesFromSavedCourses,
  savedCourseToPlannerStops,
} from "@/components/mypage/saved-course-planner-map";
import { SavedCourseCard } from "@/components/mypage/SavedCourseCard";
import { PlaceDetailSheet } from "@/components/place/PlaceDetailSheet";
import { BrandMarkerLoader } from "@/components/ui/BrandMarkerLoader";
import { COURSE_TOAST_DURATION_MS } from "@/features/course-planner/constants";
import { useDateCourseDetailQuery } from "@/features/course-planner/hooks/use-date-course-detail-query";
import { useRoomDateCoursesQuery } from "@/features/course-planner/hooks/use-room-date-courses-query";
import { useUpdateDateCourseMutation } from "@/features/course-planner/hooks/use-update-date-course-mutation";
import { isDateCourseConflictError } from "@/features/course-planner/lib/date-course-errors";
import { mapRoomSavedDateCourseToSavedCourse } from "@/features/course-planner/lib/map-room-saved-date-course";
import type { BottomNavToastPlacement } from "@/hooks/use-bottom-nav-controller";
import { useInfiniteScrollTrigger } from "@/hooks/use-infinite-scroll-trigger";
import { usePointerDownOutside } from "@/hooks/use-pointer-down-outside";
import { cn } from "@/lib/utils";
import { resolveGeneralApiErrorMessage } from "@/shared/api/error";
import { MAP_INITIAL_CENTER } from "@/shared/config/map";
import type { CourseSavePayload, SavedCourse } from "@/shared/types/course";
import type { SavedPlace } from "@/shared/types/my-page";
import { usePlaceDetailStore } from "@/store/place-detail-store";

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
const KakaoMapView = lazy(() =>
  import("@/components/map/KakaoMapView").then((module) => ({ default: module.KakaoMapView })),
);

const COURSE_ROUTE_FIT_BOUNDS_PADDING = {
  top: 88,
  right: 32,
  bottom: 260,
  left: 32,
} as const;

type CourseFilter = "all" | "member" | "date";
type FilterPopup = Exclude<CourseFilter, "all"> | null;

type MemberFilterOption = {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
};

type PlaceListSavedCoursesPageProps = {
  roomId?: string | null;
  roomName?: string;
  savedPlaces: SavedPlace[];
  toastMessage: string;
  toastPlacement?: BottomNavToastPlacement;
  onShowToast?: (message: string, durationMs?: number) => void;
  onSelectBottomNav: (id: BottomNavId) => void;
  onBackToMap: () => void;
  onSwitchTab: (tab: "places" | "courses") => void;
};

function formatCount(count: number) {
  return count > 999 ? "999+" : String(count);
}

function filterChipClass(active: boolean) {
  return cn(MAP_CHIP_BASE_CLASS, active ? MAP_CHIP_SELECTED_CLASS : MAP_CHIP_UNSELECTED_CLASS);
}

function formatDateLabel(date: string | null) {
  return date ?? "날짜";
}

export function PlaceListSavedCoursesPage({
  roomId = null,
  roomName,
  savedPlaces,
  toastMessage,
  toastPlacement = "bottom",
  onShowToast,
  onSelectBottomNav,
  onBackToMap,
  onSwitchTab,
}: PlaceListSavedCoursesPageProps) {
  const updateDateCourseMutation = useUpdateDateCourseMutation();
  const [selectedCourse, setSelectedCourse] = useState<SavedCourse | null>(null);
  const [courseOverrides, setCourseOverrides] = useState<Record<string, SavedCourse>>({});
  const [, setSelectedFilter] = useState<CourseFilter>("all");
  const [openPopup, setOpenPopup] = useState<FilterPopup>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isCourseSheetExpanded, setIsCourseSheetExpanded] = useState(false);
  const [routeViewportKey, setRouteViewportKey] = useState(0);
  const roomDateCoursesQuery = useRoomDateCoursesQuery({
    roomId,
    enabled: Boolean(roomId),
  });
  const dateCourseDetailQuery = useDateCourseDetailQuery({
    roomId,
    dateCourseId: selectedCourse?.id ?? null,
    enabled: Boolean(selectedCourse),
  });

  const detailOpen = usePlaceDetailStore((s) => s.isOpen);
  const selectedPlaceId = usePlaceDetailStore((s) => s.selectedPlaceId);
  const closeDetail = usePlaceDetailStore((s) => s.closeDetail);
  const memberChipApplied = selectedMemberIds.length > 0;
  const dateChipApplied = selectedDate !== null;
  const allChipActive = !memberChipApplied && !dateChipApplied;
  const overlayMapOpen = Boolean(selectedCourse) || detailOpen;
  const filterChromeRef = useRef<HTMLDivElement>(null);
  const courseListScrollRef = useRef<HTMLDivElement>(null);
  const loadMoreCoursesRef = useInfiniteScrollTrigger({
    enabled:
      !overlayMapOpen &&
      roomDateCoursesQuery.hasNextPage &&
      !roomDateCoursesQuery.isFetching &&
      !roomDateCoursesQuery.isFetchingNextPage,
    rootRef: courseListScrollRef,
    onLoadMore: () => {
      void roomDateCoursesQuery.fetchNextPage();
    },
  });

  const closeFilterPopups = useCallback(() => {
    setOpenPopup(null);
    setSelectedFilter((prev) => {
      if (prev === "date" && selectedDate === null) return "all";
      if (prev === "member" && selectedMemberIds.length === 0) return "all";
      return prev;
    });
  }, [selectedDate, selectedMemberIds.length]);

  usePointerDownOutside(filterChromeRef, openPopup !== null && !overlayMapOpen, closeFilterPopups);

  const apiCourses = useMemo(
    () =>
      (roomDateCoursesQuery.data?.pages ?? []).flatMap((page) =>
        page.items.map((course) => mapRoomSavedDateCourseToSavedCourse(course, roomId)),
      ),
    [roomDateCoursesQuery.data?.pages, roomId],
  );

  const savedCourses = useMemo(
    () => apiCourses.map((course) => courseOverrides[course.id] ?? course),
    [apiCourses, courseOverrides],
  );

  const memberOptions = useMemo((): MemberFilterOption[] => {
    const byId = new Map<string, MemberFilterOption>();

    for (const course of savedCourses) {
      if (course.savedByUserId == null) {
        continue;
      }

      const nickname = course.savedByNickname?.trim();
      if (!nickname) {
        continue;
      }

      const id = String(course.savedByUserId);
      if (!byId.has(id)) {
        byId.set(id, {
          id,
          nickname,
          profileImageUrl: course.savedByProfileImageUrl ?? null,
        });
      }
    }

    return [...byId.values()];
  }, [savedCourses]);

  const selectedCourseWithDetail = useMemo(() => {
    if (!selectedCourse) {
      return null;
    }

    const detailCourse = dateCourseDetailQuery.data
      ? mapRoomSavedDateCourseToSavedCourse(dateCourseDetailQuery.data, roomId)
      : selectedCourse;

    return courseOverrides[detailCourse.id] ?? detailCourse;
  }, [courseOverrides, dateCourseDetailQuery.data, roomId, selectedCourse]);

  const visibleCourses = useMemo(() => {
    return savedCourses.filter((course) => {
      const matchesMember =
        selectedMemberIds.length === 0 ||
        (course.savedByUserId != null && selectedMemberIds.includes(String(course.savedByUserId)));
      const matchesDate = selectedDate == null || course.courseDateKey === selectedDate;

      return matchesMember && matchesDate;
    });
  }, [savedCourses, selectedDate, selectedMemberIds]);
  const totalCourseCount = roomDateCoursesQuery.data?.pages[0]?.totalCount ?? savedCourses.length;

  const mapPins = useMemo(() => {
    return selectedCourseWithDetail
      ? mapPlacesFromSavedCourses([selectedCourseWithDetail], savedPlaces)
      : mapPlacesFromSavedCourses(visibleCourses, savedPlaces);
  }, [savedPlaces, selectedCourseWithDetail, visibleCourses]);
  const selectedCourseRouteMapData = useMemo(
    () =>
      selectedCourseWithDetail
        ? getSavedCourseRouteMapData(selectedCourseWithDetail, savedPlaces)
        : { places: [], routeCoordinates: [], markerLabelByPlaceId: {} },
    [savedPlaces, selectedCourseWithDetail],
  );

  const mapCenter = useMemo(() => {
    if (detailOpen && selectedPlaceId) {
      const pin = mapPins.find((place) => place.id === selectedPlaceId);
      if (pin) {
        return { latitude: pin.latitude, longitude: pin.longitude };
      }
    }

    if (selectedCourseWithDetail) {
      const focusedPins = mapPlacesFromSavedCourses([selectedCourseWithDetail], savedPlaces);
      if (focusedPins.length > 0) {
        return weightedMapCenter(focusedPins);
      }
    }

    return weightedMapCenter(mapPins);
  }, [detailOpen, mapPins, savedPlaces, selectedCourseWithDetail, selectedPlaceId]);

  const handleSelectAll = () => {
    setSelectedFilter("all");
    setOpenPopup(null);
    setSelectedMemberIds([]);
    setSelectedDate(null);
  };

  const handleToggleMember = (memberId: string) => {
    setSelectedMemberIds((current) => {
      const nextIds = current.includes(memberId)
        ? current.filter((item) => item !== memberId)
        : [...current, memberId];
      setSelectedFilter(nextIds.length === 0 && selectedDate == null ? "all" : "member");
      return nextIds;
    });
  };

  const handlePickCalendarDate = (date: string) => {
    if (selectedDate === date) {
      setSelectedDate(null);
      setSelectedFilter("all");
      setOpenPopup(null);
      return;
    }

    setSelectedFilter("date");
    setSelectedDate(date);
    setOpenPopup(null);
  };

  const handleSelectCourse = (course: SavedCourse) => {
    setIsCourseSheetExpanded(false);
    setRouteViewportKey((current) => current + 1);
    setSelectedCourse(course);
  };

  const handleShowRoute = () => {
    setIsCourseSheetExpanded(false);
    setRouteViewportKey((current) => current + 1);
  };

  const handlePersistCourse = async (prevCourseId: string, payload: CourseSavePayload) => {
    if (payload.kind !== "edit") {
      return;
    }

    const source = savedCourses.find((course) => course.id === prevCourseId) ?? selectedCourse;
    if (!source || !roomId) {
      onShowToast?.("코스 수정에 필요한 방 정보를 찾지 못했어요.", COURSE_TOAST_DURATION_MS);
      throw new Error("roomId is required to update date course");
    }

    const roomPlaceIds = payload.stops.map((stop) => stop.roomPlaceId);
    if (roomPlaceIds.length === 0) {
      onShowToast?.("코스에는 장소가 1개 이상 필요해요.", COURSE_TOAST_DURATION_MS);
      throw new Error("roomPlaceIds is required to update date course");
    }

    try {
      const updatedDetail = await updateDateCourseMutation.mutateAsync({
        roomId,
        dateCourseId: prevCourseId,
        courseName: payload.title,
        roomPlaceIds,
      });

      const updatedCourse = mapRoomSavedDateCourseToSavedCourse(updatedDetail, roomId);
      const nextCourse: SavedCourse = {
        ...source,
        ...updatedCourse,
        savedFromRoomName: source.savedFromRoomName,
      };

      setCourseOverrides((current) => ({ ...current, [prevCourseId]: nextCourse }));
      setSelectedCourse(nextCourse);
      onShowToast?.("코스가 수정되었습니다.", COURSE_TOAST_DURATION_MS);
    } catch (error) {
      if (isDateCourseConflictError(error)) {
        throw error;
      }
      onShowToast?.(resolveGeneralApiErrorMessage(error), COURSE_TOAST_DURATION_MS);
      throw error;
    }
  };

  return (
    <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {overlayMapOpen ? (
        <MapBackdropLayer>
          <Suspense fallback={<div className="bg-muted h-full w-full" aria-hidden />}>
            <KakaoMapView
              appKey={KAKAO_MAP_APP_KEY}
              places={mapPins}
              center={mapPins.length > 0 ? mapCenter : MAP_INITIAL_CENTER}
              fitBoundsCoordinates={
                selectedCourseWithDetail ? selectedCourseRouteMapData.routeCoordinates : []
              }
              fitBoundsPadding={
                selectedCourseWithDetail ? COURSE_ROUTE_FIT_BOUNDS_PADDING : undefined
              }
              routeCoordinates={
                selectedCourseWithDetail ? selectedCourseRouteMapData.routeCoordinates : []
              }
              markerLabelByPlaceId={
                selectedCourseWithDetail ? selectedCourseRouteMapData.markerLabelByPlaceId : {}
              }
              viewportKey={
                selectedCourseWithDetail
                  ? `room-course-route-${selectedCourseWithDetail.id}-${routeViewportKey}`
                  : "room-courses"
              }
              className="h-full w-full"
            />
          </Suspense>
        </MapBackdropLayer>
      ) : null}

      <ListTopBar
        title={roomName}
        trailing={
          selectedCourseWithDetail
            ? `${selectedCourseRouteMapData.places.length}개 장소`
            : `${formatCount(totalCourseCount)}개`
        }
        variant={overlayMapOpen ? "overlay" : "sticky"}
        backLabel={
          detailOpen ? "장소 상세 닫기" : selectedCourse ? "코스 상세 닫기" : "지도로 이동"
        }
        onBack={() => {
          if (detailOpen) {
            closeDetail();
            return;
          }
          if (selectedCourse) {
            setSelectedCourse(null);
            return;
          }
          onBackToMap();
        }}
      >
        {!overlayMapOpen ? (
          <div className={cn(LIST_TOP_BAR_AFTER_TITLE_CLASS, "space-y-3")}>
            <div className="grid grid-cols-2 border-b border-[#ececec]">
              <button
                type="button"
                onClick={() => onSwitchTab("places")}
                className="border-r border-[#ececec] pb-2 text-center text-sm font-medium text-[#b3b3b3]"
              >
                장소 목록
              </button>
              <button
                type="button"
                className="border-b-2 border-[#f38c86] pb-2 text-center text-sm font-semibold text-[#f38c86]"
              >
                저장된 데이트 코스
              </button>
            </div>

            <div
              ref={filterChromeRef}
              className="relative flex flex-wrap items-center gap-2 overflow-visible"
            >
              <button
                type="button"
                onClick={handleSelectAll}
                className={cn(filterChipClass(allChipActive), "shrink-0 px-3")}
                aria-pressed={allChipActive}
              >
                전체
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFilter("member");
                    setOpenPopup((current) => (current === "member" ? null : "member"));
                  }}
                  className={cn(filterChipClass(memberChipApplied), "shrink-0 gap-1 px-3")}
                  aria-expanded={openPopup === "member"}
                  aria-haspopup="listbox"
                  aria-pressed={memberChipApplied}
                >
                  멤버
                  <ChevronDown
                    className={cn(
                      "size-3.5 shrink-0 opacity-80 transition-transform duration-150",
                      openPopup === "member" && "-rotate-180",
                      memberChipApplied ? "text-primary-foreground/90" : "text-muted-foreground",
                    )}
                    aria-hidden
                  />
                </button>

                {openPopup === "member" ? (
                  <div
                    role="listbox"
                    aria-label="멤버 필터"
                    className={cn(
                      MAP_FILTER_PANEL_BASE_CLASS,
                      "absolute left-0 z-40 mt-1! flex max-h-[min(18.5rem,calc(100vh-12rem))] w-[min(16.5rem,calc(100vw-4rem))] min-w-36 flex-col rounded-lg! backdrop-saturate-150",
                    )}
                  >
                    {roomDateCoursesQuery.isLoading ? (
                      <div className="divide-border/35 divide-y px-1.5 py-0.5">
                        {Array.from({ length: 3 }, (_, index) => (
                          <div
                            key={`member-skel-${index}`}
                            className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 py-2"
                          >
                            <div className="bg-muted/70 size-9 shrink-0 animate-pulse rounded-full" />
                            <div className="bg-muted/60 h-3 w-[55%] animate-pulse rounded-sm" />
                            <div className="bg-muted/50 size-4.5 shrink-0 animate-pulse rounded-full" />
                          </div>
                        ))}
                      </div>
                    ) : memberOptions.length === 0 ? (
                      <div className="text-muted-foreground px-3 py-3 text-left text-xs font-medium">
                        저장한 멤버가 없습니다
                      </div>
                    ) : (
                      <ul
                        className="scrollbar-hide flex min-h-0 w-full flex-1 flex-col overflow-y-auto pb-px"
                        role="presentation"
                      >
                        {memberOptions.map((member) => {
                          const checked = selectedMemberIds.includes(member.id);
                          return (
                            <li
                              key={member.id}
                              className="group hover:bg-muted/35 focus-within:bg-muted/30 active:bg-muted/45 flex w-full min-w-0 transition-colors"
                            >
                              <label className="grid w-full min-w-0 cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 px-3 py-2.5 transition-colors focus-visible:outline-none">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => handleToggleMember(member.id)}
                                  className="sr-only"
                                  aria-checked={checked}
                                />
                                <MemberAvatar
                                  imageUrl={member.profileImageUrl}
                                  className="size-9"
                                />
                                <span className="text-foreground min-w-0 truncate text-xs leading-tight font-semibold">
                                  {member.nickname}
                                </span>
                                <span
                                  className={cn(
                                    "flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
                                    checked
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-muted-foreground/35 bg-background group-hover:border-muted-foreground/55",
                                  )}
                                  aria-hidden
                                >
                                  <Check
                                    className={cn(
                                      "size-2.5 shrink-0",
                                      checked ? "opacity-100" : "opacity-0",
                                    )}
                                    strokeWidth={3}
                                  />
                                </span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFilter("date");
                    setOpenPopup((current) => (current === "date" ? null : "date"));
                  }}
                  className={cn(
                    filterChipClass(dateChipApplied),
                    "max-w-[min(11rem,calc(100vw-8rem))] shrink-0 gap-1 truncate px-3",
                  )}
                  aria-expanded={openPopup === "date"}
                  aria-haspopup="dialog"
                  aria-pressed={dateChipApplied}
                >
                  <span className="min-w-0 truncate">{formatDateLabel(selectedDate)}</span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 shrink-0 opacity-80 transition-transform duration-150",
                      openPopup === "date" && "-rotate-180",
                      dateChipApplied && "text-primary-foreground/90",
                      !dateChipApplied && "text-muted-foreground",
                    )}
                    aria-hidden
                  />
                </button>

                {openPopup === "date" ? (
                  <div className="absolute top-full left-0 z-40 mt-1 w-[min(20rem,calc(100vw-2rem))]">
                    <DateCalendarPanel
                      className="rounded-lg border-0 shadow-[0_6px_20px_rgb(0_0_0/0.08)]"
                      selectedDate={selectedDate}
                      onSelectDate={handlePickCalendarDate}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </ListTopBar>

      {selectedCourseWithDetail ? (
        <div className="pointer-events-none absolute top-[max(4.5rem,calc(env(safe-area-inset-top)+4rem))] left-[max(1rem,env(safe-area-inset-left))] z-40 flex items-center">
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

      {!overlayMapOpen ? (
        <div
          ref={courseListScrollRef}
          className="scrollbar-hide relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-3 pb-[max(1rem,calc(env(safe-area-inset-bottom)+5.75rem))]"
        >
          {roomDateCoursesQuery.isLoading ? (
            <EmptyState
              icon={<AlertCircle className="size-5" aria-hidden />}
              message="저장된 데이트 코스를 불러오는 중이에요."
            />
          ) : visibleCourses.length > 0 ? (
            <div className="space-y-2 pb-2">
              {visibleCourses.map((course) => (
                <SavedCourseCard key={course.id} course={course} onSelect={handleSelectCourse} />
              ))}
              <div ref={loadMoreCoursesRef} className="h-1" aria-hidden />
              {roomDateCoursesQuery.isFetchingNextPage ? (
                <div className="flex justify-center px-5 py-6">
                  <BrandMarkerLoader />
                </div>
              ) : null}
            </div>
          ) : (
            <EmptyState
              icon={<AlertCircle className="size-5" aria-hidden />}
              message={
                roomDateCoursesQuery.isError
                  ? "저장된 데이트 코스를 불러오지 못했어요."
                  : "해당하는 데이트 코스가 없습니다."
              }
            />
          )}
        </div>
      ) : null}

      <CoursePlannerBottomSheet
        open={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
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
        {selectedCourseWithDetail ? (
          <CoursePlaceInfoPanel
            courseTitle={selectedCourseWithDetail.title}
            roomId={roomId}
            stops={savedCourseToPlannerStops(selectedCourseWithDetail, savedPlaces)}
            onBack={() => setSelectedCourse(null)}
            onSave={(payload) => handlePersistCourse(selectedCourseWithDetail.id, payload)}
            hideNewCourseSaveButton
            collapsed={!isCourseSheetExpanded}
            onExpand={() => setIsCourseSheetExpanded(true)}
          />
        ) : null}
      </CoursePlannerBottomSheet>

      {!selectedCourse ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 *:pointer-events-auto">
          <BottomNavToast message={toastMessage} placement={toastPlacement} />
          <BottomNavigationBar activeId="map" onSelect={onSelectBottomNav} />
        </div>
      ) : null}

      <PlaceDetailSheet roomId={roomId} savedPlaces={savedPlaces} />
    </div>
  );
}

function MemberAvatar({ imageUrl, className }: { imageUrl?: string | null; className?: string }) {
  const url = imageUrl?.trim() ?? "";
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(url) && failedUrl !== url;

  const handleImageError = useCallback(() => {
    setFailedUrl(url);
  }, [url]);

  if (showImage) {
    return (
      <img
        src={url}
        alt=""
        className={cn("shrink-0 rounded-full object-cover", className)}
        referrerPolicy="no-referrer"
        onError={handleImageError}
      />
    );
  }

  return (
    <span
      className={cn(
        "bg-muted text-muted-foreground flex shrink-0 items-center justify-center rounded-full",
        className,
      )}
      aria-hidden
    >
      <User className="size-4.5" strokeWidth={2} />
    </span>
  );
}
