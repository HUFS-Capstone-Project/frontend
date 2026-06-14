import { Check, ChevronDown, Pin, Route } from "lucide-react";
import { lazy, Suspense, useMemo, useRef, useState } from "react";

import { LIST_TOP_BAR_AFTER_TITLE_CLASS, ListTopBar } from "@/components/common/ListTopBar";
import { MapBackdropLayer } from "@/components/common/MapBackdropLayer";
import {
  COURSE_ROUTE_COLLAPSED_SHEET_CONTENT_CLASS,
  COURSE_ROUTE_COLLAPSED_SHEET_PANEL_CLASS,
  COURSE_ROUTE_FIT_BOUNDS_PADDING,
} from "@/components/course-planner/course-map-constants";
import { CoursePlaceInfoPanel } from "@/components/course-planner/CoursePlaceInfoPanel";
import { CoursePlannerBottomSheet } from "@/components/course-planner/CoursePlannerBottomSheet";
import { DateCalendarPanel } from "@/components/course-planner/DateTimeSelectionPanel";
import {
  MAP_CHIP_BASE_CLASS,
  MAP_CHIP_SELECTED_CLASS,
  MAP_CHIP_UNSELECTED_CLASS,
  MAP_FILTER_PANEL_BASE_CLASS,
} from "@/components/map/chip-style";
import { savedCourseToPlannerStops } from "@/components/mypage/saved-course-planner-map";
import { SavedCourseCard } from "@/components/mypage/SavedCourseCard";
import { RoomAvatar } from "@/components/room/RoomAvatar";
import { useRoomsQuery } from "@/features/room";
import { useInfiniteScrollTrigger } from "@/hooks/use-infinite-scroll-trigger";
import { usePointerDownOutside } from "@/hooks/use-pointer-down-outside";
import { cn } from "@/lib/utils";
import { MAP_INITIAL_CENTER } from "@/shared/config/map";
import type { CourseSavePayload, SavedCourse } from "@/shared/types/course";
import type { SavedPlace } from "@/shared/types/my-page";
import { usePlaceDetailStore } from "@/store/place-detail-store";

import { useSavedCourseFilters } from "./use-saved-course-filters";
import { useSavedCourseMapData } from "./use-saved-course-map-data";

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
const KakaoMapView = lazy(() =>
  import("@/components/map/KakaoMapView").then((module) => ({ default: module.KakaoMapView })),
);

function formatCount(count: number) {
  return count > 999 ? "999+" : String(count);
}

function formatDateLabel(date: string | null) {
  return date ?? "날짜";
}

function filterChipClass(active: boolean) {
  return cn(MAP_CHIP_BASE_CLASS, active ? MAP_CHIP_SELECTED_CLASS : MAP_CHIP_UNSELECTED_CLASS);
}

type MySavedCoursesPageProps = {
  courses: SavedCourse[];
  totalCount?: number;
  savedPlaces: SavedPlace[];
  selectedCourse: SavedCourse | null;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onLoadMore?: () => void;
  onSelectCourse: (course: SavedCourse) => void;
  onCloseCourseSheet: () => void;
  onBack: () => void;
  onPersistCourse: (prevCourseId: string, payload: CourseSavePayload) => void | Promise<void>;
};

export function MySavedCoursesPage({
  courses,
  totalCount,
  savedPlaces,
  selectedCourse,
  hasNextPage = false,
  isFetchingNextPage = false,
  isLoading = false,
  isError = false,
  onLoadMore,
  onSelectCourse,
  onCloseCourseSheet,
  onBack,
  onPersistCourse,
}: MySavedCoursesPageProps) {
  const { data: roomsFromApi, isLoading: isRoomsLoading } = useRoomsQuery();
  const [isCourseSheetExpanded, setIsCourseSheetExpanded] = useState(false);
  const [routeViewportKey, setRouteViewportKey] = useState(0);
  const {
    openPopup,
    selectedRoomIds,
    selectedDate,
    roomChipApplied,
    dateChipApplied,
    allChipActive,
    visibleCourses,
    closeFilterPopups,
    handleSelectAll,
    handleToggleRoom,
    handlePickCalendarDate,
    toggleRoomFilterPopup,
    toggleDateFilterPopup,
  } = useSavedCourseFilters(courses);

  const detailOpen = usePlaceDetailStore((s) => s.isOpen);
  const selectedPlaceId = usePlaceDetailStore((s) => s.selectedPlaceId);
  const closeDetail = usePlaceDetailStore((s) => s.closeDetail);

  /** 나의 장소와 동일: 목록에서는 지도 미표시, 코스 바텀시트·장소 상세 때만 지도 */
  const overlayMapOpen = Boolean(selectedCourse) || detailOpen;

  const filterChromeRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const loadMoreCoursesRef = useInfiniteScrollTrigger({
    enabled: !overlayMapOpen && hasNextPage && !isFetchingNextPage,
    rootRef: listScrollRef,
    onLoadMore: () => {
      onLoadMore?.();
    },
  });

  usePointerDownOutside(filterChromeRef, openPopup !== null && !overlayMapOpen, closeFilterPopups);

  const roomsList = useMemo(() => {
    const list = roomsFromApi ?? [];
    return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [roomsFromApi]);

  const totalCourseCount = totalCount ?? courses.length;
  const isInitialCoursesLoading = isLoading && courses.length === 0;
  const emptyTitle =
    courses.length === 0 ? "아직 저장한 데이트코스가 없어요" : "조건에 맞는 데이트코스가 없어요";
  const emptyDescription =
    courses.length === 0
      ? "코스를 만들면 이곳에 차곡차곡 모아둘게요"
      : "필터를 바꾸면 저장해둔 다른 코스를 볼 수 있어요";

  const { mapPins, selectedCourseRouteMapData, mapCenter } = useSavedCourseMapData({
    courses: visibleCourses,
    selectedCourse,
    savedPlaces,
    detailOpen,
    selectedPlaceId,
  });

  const handleSelectCourse = (course: SavedCourse) => {
    setIsCourseSheetExpanded(false);
    setRouteViewportKey((current) => current + 1);
    onSelectCourse(course);
  };

  const handleHeaderBack = () => {
    if (detailOpen) {
      closeDetail();
      return;
    }
    if (selectedCourse) {
      onCloseCourseSheet();
      return;
    }
    onBack();
  };

  const handleShowRoute = () => {
    setIsCourseSheetExpanded(false);
    setRouteViewportKey((current) => current + 1);
  };

  return (
    <div
      className={cn(
        "relative flex min-h-0 w-full flex-1 flex-col overflow-hidden",
        overlayMapOpen ? "bg-muted" : "bg-background",
      )}
    >
      {overlayMapOpen ? (
        <MapBackdropLayer>
          <Suspense fallback={<div className="bg-muted h-full w-full" aria-hidden />}>
            <KakaoMapView
              appKey={KAKAO_MAP_APP_KEY}
              places={mapPins}
              center={mapPins.length > 0 ? mapCenter : MAP_INITIAL_CENTER}
              fitBoundsCoordinates={
                selectedCourse ? selectedCourseRouteMapData.routeCoordinates : []
              }
              fitBoundsPadding={selectedCourse ? COURSE_ROUTE_FIT_BOUNDS_PADDING : undefined}
              routeCoordinates={selectedCourse ? selectedCourseRouteMapData.routeCoordinates : []}
              markerLabelByPlaceId={
                selectedCourse ? selectedCourseRouteMapData.markerLabelByPlaceId : {}
              }
              viewportKey={
                selectedCourse
                  ? `saved-course-route-${selectedCourse.id}-${routeViewportKey}`
                  : "my-courses"
              }
              className="h-full w-full"
            />
          </Suspense>
        </MapBackdropLayer>
      ) : null}

      <ListTopBar
        title={
          selectedCourse
            ? (selectedCourse.savedFromRoomName ?? "저장된 데이트 코스")
            : "저장된 데이트 코스"
        }
        trailing={
          isInitialCoursesLoading && !selectedCourse ? (
            <span
              className="bg-muted/70 inline-block h-3.5 w-8 animate-pulse rounded-md align-middle"
              aria-label="저장된 데이트 코스 개수 불러오는 중"
            />
          ) : selectedCourse ? (
            `${selectedCourseRouteMapData.places.length}개 장소`
          ) : (
            `${formatCount(totalCourseCount)}개`
          )
        }
        variant={overlayMapOpen ? "overlay" : "sticky"}
        backLabel={
          detailOpen
            ? "장소 상세 닫기"
            : selectedCourse
              ? "코스 상세 닫기"
              : "마이페이지로 돌아가기"
        }
        onBack={handleHeaderBack}
      >
        {!overlayMapOpen ? (
          <div
            ref={filterChromeRef}
            className={cn(
              LIST_TOP_BAR_AFTER_TITLE_CLASS,
              "relative flex flex-wrap gap-2 overflow-visible",
            )}
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
                onClick={toggleRoomFilterPopup}
                className={cn(filterChipClass(roomChipApplied), "shrink-0 gap-1 px-3")}
                aria-expanded={openPopup === "room"}
                aria-haspopup="listbox"
                aria-pressed={roomChipApplied}
              >
                방
                <ChevronDown
                  className={cn(
                    "size-3.5 shrink-0 opacity-80 transition-transform duration-150",
                    openPopup === "room" && "-rotate-180",
                    roomChipApplied ? "text-primary-foreground/90" : "text-muted-foreground",
                  )}
                  aria-hidden
                />
              </button>

              {openPopup === "room" ? (
                <div
                  role="listbox"
                  aria-label="방 목록 필터"
                  className={cn(
                    MAP_FILTER_PANEL_BASE_CLASS,
                    "absolute left-0 z-40 mt-1! flex max-h-[min(18.5rem,calc(100vh-12rem))] w-[min(16.5rem,calc(100vw-4rem))] min-w-36 flex-col rounded-lg! backdrop-saturate-150",
                  )}
                >
                  {isRoomsLoading ? (
                    <div className="divide-border/35 divide-y px-1.5 py-0.5">
                      {Array.from({ length: 4 }, (_, i) => (
                        <div
                          key={`room-skel-${i}`}
                          className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 py-2"
                        >
                          <div className="bg-muted/70 size-9 shrink-0 animate-pulse rounded-full" />
                          <div className="min-w-0 space-y-1.5">
                            <div className="bg-muted/60 h-3 w-[55%] animate-pulse rounded-sm" />
                            <div className="bg-muted/50 h-2.5 w-[40%] animate-pulse rounded-sm" />
                          </div>
                          <div className="bg-muted/50 size-4.5 shrink-0 animate-pulse rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : roomsList.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-foreground text-xs leading-snug font-semibold">
                        아직 참여 중인 방이 없어요
                      </p>
                      <p className="text-muted-foreground mt-1.5 max-w-52 text-[0.65rem] leading-relaxed font-medium">
                        방에 참여하면 저장한 코스를 방별로 모아볼 수 있어요
                      </p>
                    </div>
                  ) : (
                    <ul
                      className="scrollbar-hide flex min-h-0 w-full flex-1 flex-col overflow-y-auto pb-px"
                      role="presentation"
                    >
                      {roomsList.map((room) => {
                        const checked = selectedRoomIds.includes(room.roomId);
                        const members = Math.max(1, room.memberCount ?? 1);
                        return (
                          <li
                            key={room.roomId}
                            className="group hover:bg-muted/35 focus-within:bg-muted/30 active:bg-muted/45 flex w-full min-w-0 transition-colors"
                          >
                            <label
                              className={cn(
                                "grid w-full min-w-0 cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-2 gap-y-0 px-3 py-2.5 transition-colors focus-visible:outline-none",
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggleRoom(room.roomId)}
                                className="sr-only"
                                aria-checked={checked}
                              />
                              <span className="col-start-1 row-span-2 row-start-1 size-9 shrink-0 self-center overflow-hidden rounded-full">
                                <RoomAvatar avatarSeed={room.avatarSeed} size="100%" />
                              </span>

                              <div className="text-foreground col-start-2 row-start-1 min-w-0 text-xs leading-tight font-semibold">
                                <span className="inline-flex max-w-full min-w-0 items-center gap-0.5">
                                  <span className="min-w-0 truncate">{room.roomName}</span>
                                  {room.pinned ? (
                                    <span
                                      className="text-muted-foreground inline-flex shrink-0"
                                      title="상단 고정"
                                    >
                                      <Pin
                                        className="fill-muted-foreground stroke-muted-foreground size-3"
                                        strokeWidth={2}
                                        aria-hidden
                                      />
                                    </span>
                                  ) : null}
                                </span>
                              </div>
                              <p className="text-muted-foreground/80 col-start-2 row-start-2 min-w-0 truncate text-[0.65rem] leading-tight font-medium">
                                멤버 {members}명
                              </p>

                              <div
                                className="col-start-3 row-span-2 row-start-1 flex shrink-0 items-center justify-center self-center"
                                aria-hidden
                              >
                                <span
                                  className={cn(
                                    "flex size-4.5 items-center justify-center rounded-full border transition-colors duration-150",
                                    checked
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-muted-foreground/35 bg-background group-hover:border-muted-foreground/55",
                                  )}
                                >
                                  <Check
                                    className={cn(
                                      "size-2.5 shrink-0",
                                      checked ? "opacity-100" : "opacity-0",
                                    )}
                                    strokeWidth={3}
                                  />
                                </span>
                              </div>
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
                onClick={toggleDateFilterPopup}
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
        ) : null}
      </ListTopBar>

      {selectedCourse ? (
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

      {!overlayMapOpen ? (
        <div
          ref={listScrollRef}
          className="scrollbar-hide relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-3 pb-[max(1rem,calc(var(--inset-bottom)+5.75rem))]"
        >
          {isInitialCoursesLoading ? (
            <SavedCourseListSkeleton />
          ) : !isError && visibleCourses.length > 0 ? (
            <div className="space-y-2 pb-2">
              {visibleCourses.map((course) => (
                <SavedCourseCard key={course.id} course={course} onSelect={handleSelectCourse} />
              ))}
              <div ref={loadMoreCoursesRef} className="h-1" aria-hidden />
              {isFetchingNextPage ? (
                <div className="flex justify-center px-5 py-6">
                  <span className="bg-muted/70 h-8 w-8 animate-pulse rounded-full" />
                </div>
              ) : null}
            </div>
          ) : isError ? (
            <SavedCourseListState
              title="데이트코스를 불러오지 못했어요"
              description="잠시 뒤에 다시 확인해주세요"
            />
          ) : (
            <SavedCourseListState title={emptyTitle} description={emptyDescription} />
          )}
        </div>
      ) : null}

      <CoursePlannerBottomSheet
        open={Boolean(selectedCourse)}
        onClose={onCloseCourseSheet}
        className="pointer-events-none"
        overlayClassName="pointer-events-none bg-transparent"
        panelClassName={cn(
          "pointer-events-auto",
          !isCourseSheetExpanded && COURSE_ROUTE_COLLAPSED_SHEET_PANEL_CLASS,
        )}
        contentClassName={
          !isCourseSheetExpanded ? COURSE_ROUTE_COLLAPSED_SHEET_CONTENT_CLASS : undefined
        }
        onHandleClick={() => setIsCourseSheetExpanded((current) => !current)}
        onDragDismiss={() => setIsCourseSheetExpanded(false)}
      >
        {selectedCourse ? (
          <CoursePlaceInfoPanel
            hideNewCourseSaveButton
            courseTitle={selectedCourse.title}
            roomId={selectedCourse.savedFromRoomId}
            stops={savedCourseToPlannerStops(selectedCourse, savedPlaces)}
            onBack={onCloseCourseSheet}
            onSave={(payload) => onPersistCourse(selectedCourse.id, payload)}
            collapsed={!isCourseSheetExpanded}
            onExpand={() => setIsCourseSheetExpanded(true)}
          />
        ) : null}
      </CoursePlannerBottomSheet>
    </div>
  );
}

function SavedCourseListSkeleton() {
  return (
    <div className="space-y-2 pb-2" aria-label="저장한 데이트 코스를 불러오는 중">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={`saved-course-skeleton-${index}`}
          className="bg-card flex items-center gap-3 rounded-lg px-2.5 py-2.5"
        >
          <div className="bg-muted/65 size-9 shrink-0 animate-pulse rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="bg-muted/65 h-3.5 w-[48%] animate-pulse rounded-md" />
            <div className="bg-muted/45 h-3 w-[72%] animate-pulse rounded-md" />
          </div>
          <div className="bg-muted/45 size-4 shrink-0 animate-pulse rounded-full" />
        </div>
      ))}
    </div>
  );
}

function SavedCourseListState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-5 py-10 text-center">
      <p className="text-foreground text-sm font-semibold">{title}</p>
      <p className="text-muted-foreground mt-1.5 max-w-64 text-xs leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}
