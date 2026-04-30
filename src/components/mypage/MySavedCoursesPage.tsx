import { AlertCircle, ArrowLeft, Check, ChevronDown, Pin, User } from "lucide-react";
import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";

import {
  CoursePlaceInfoPanel,
  type CourseStop as PlannerCourseStop,
} from "@/components/course-planner/CoursePlaceInfoPanel";
import { CoursePlannerBottomSheet } from "@/components/course-planner/CoursePlannerBottomSheet";
import { DateCalendarPanel } from "@/components/course-planner/DateTimeSelectionPanel";
import {
  MAP_CHIP_BASE_CLASS,
  MAP_CHIP_SELECTED_CLASS,
  MAP_CHIP_UNSELECTED_CLASS,
  MAP_FILTER_PANEL_BASE_CLASS,
} from "@/components/map/chip-style";
import { weightedMapCenter } from "@/components/mypage/map-places-from-my-saved";
import type { SavedCourse, SavedPlace } from "@/components/mypage/mypage-mock-data";
import {
  mapPlacesFromSavedCourses,
  savedCourseToPlannerStops,
} from "@/components/mypage/saved-course-planner-map";
import { SavedCourseCard } from "@/components/mypage/SavedCourseCard";
import { useRoomsQuery } from "@/features/room";
import { usePointerDownOutside } from "@/hooks/use-pointer-down-outside";
import { cn } from "@/lib/utils";
import { MAP_INITIAL_CENTER } from "@/pages/map/map-home-mock";
import { resolveSavedPlacesBusinessHours, useKoreanNow } from "@/shared/lib/place-business-hours";
import { usePlaceDetailStore } from "@/store/placeDetailStore";

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
const KakaoMapView = lazy(() =>
  import("@/components/map/KakaoMapView").then((module) => ({ default: module.KakaoMapView })),
);

type CourseFilter = "all" | "room" | "date";
type FilterPopup = Exclude<CourseFilter, "all"> | null;

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
  savedPlaces: SavedPlace[];
  selectedCourse: SavedCourse | null;
  onSelectCourse: (course: SavedCourse) => void;
  onCloseCourseSheet: () => void;
  onBack: () => void;
  onPersistCourse: (
    prevCourseId: string,
    nextTitle: string,
    nextStops: PlannerCourseStop[],
    fromEditMode: boolean,
  ) => void;
};

export function MySavedCoursesPage({
  courses,
  savedPlaces,
  selectedCourse,
  onSelectCourse,
  onCloseCourseSheet,
  onBack,
  onPersistCourse,
}: MySavedCoursesPageProps) {
  const now = useKoreanNow();
  const { data: roomsFromApi, isLoading: isRoomsLoading } = useRoomsQuery();
  const [selectedFilter, setSelectedFilter] = useState<CourseFilter>("all");
  const [openPopup, setOpenPopup] = useState<FilterPopup>(null);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const roomChipApplied = selectedRoomIds.length > 0;
  const dateChipApplied = selectedDate !== null;
  const allChipActive = !roomChipApplied && !dateChipApplied;

  const detailOpen = usePlaceDetailStore((s) => s.isOpen);
  const selectedPlaceId = usePlaceDetailStore((s) => s.selectedPlaceId);
  const closeDetail = usePlaceDetailStore((s) => s.closeDetail);

  /** 나의 장소와 동일: 목록에서는 지도 미표시, 코스 바텀시트·장소 상세 때만 지도 */
  const overlayMapOpen = Boolean(selectedCourse) || detailOpen;

  const filterChromeRef = useRef<HTMLDivElement>(null);

  const closeFilterPopups = useCallback(() => {
    setOpenPopup(null);
    setSelectedFilter((prev) => {
      if (prev === "date" && selectedDate === null) return "all";
      if (prev === "room" && selectedRoomIds.length === 0) return "all";
      return prev;
    });
  }, [selectedDate, selectedRoomIds]);

  usePointerDownOutside(filterChromeRef, openPopup !== null && !overlayMapOpen, closeFilterPopups);

  const roomsList = useMemo(() => {
    const list = roomsFromApi ?? [];
    return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [roomsFromApi]);

  const coursesHaveRoomLink = useMemo(
    () => courses.some((c) => Boolean(c.savedFromRoomId)),
    [courses],
  );

  const visibleCourses = useMemo(() => {
    if (selectedFilter === "date" && selectedDate === "2025.04.26") {
      return [];
    }

    if (selectedFilter === "date" && selectedDate) {
      return courses.slice(0, 4);
    }

    if (selectedFilter === "room") {
      if (!coursesHaveRoomLink) {
        return courses;
      }
      if (selectedRoomIds.length === 0) {
        return courses;
      }
      return courses.filter(
        (c) => c.savedFromRoomId != null && selectedRoomIds.includes(c.savedFromRoomId),
      );
    }

    return courses;
  }, [courses, coursesHaveRoomLink, selectedDate, selectedFilter, selectedRoomIds]);

  const mapPins = useMemo(() => {
    const raw = selectedCourse
      ? mapPlacesFromSavedCourses([selectedCourse], savedPlaces)
      : mapPlacesFromSavedCourses(visibleCourses, savedPlaces);
    return resolveSavedPlacesBusinessHours(raw, now);
  }, [now, savedPlaces, selectedCourse, visibleCourses]);

  const mapCenter = useMemo(() => {
    if (detailOpen && selectedPlaceId) {
      const pin = mapPins.find((p) => p.id === selectedPlaceId);
      if (pin) return { latitude: pin.latitude, longitude: pin.longitude };
    }
    if (selectedCourse) {
      const focused = mapPlacesFromSavedCourses([selectedCourse], savedPlaces);
      if (focused.length > 0) return weightedMapCenter(focused);
    }
    return weightedMapCenter(mapPins);
  }, [detailOpen, mapPins, savedPlaces, selectedCourse, selectedPlaceId]);

  const handleSelectAll = () => {
    setSelectedFilter("all");
    setOpenPopup(null);
    setSelectedRoomIds([]);
    setSelectedDate(null);
  };

  const handleToggleRoom = (roomId: string) => {
    const nextIds = selectedRoomIds.includes(roomId)
      ? selectedRoomIds.filter((item) => item !== roomId)
      : [...selectedRoomIds, roomId];
    setSelectedRoomIds(nextIds);
    setSelectedFilter(nextIds.length === 0 ? "all" : "room");
  };

  const handlePickCalendarDate = (dateStr: string) => {
    if (selectedDate === dateStr) {
      setSelectedDate(null);
      setSelectedFilter("all");
      setOpenPopup(null);
      return;
    }
    setSelectedFilter("date");
    setSelectedDate(dateStr);
    setOpenPopup(null);
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

  const headerBackdrop = overlayMapOpen
    ? "border-border/55 bg-background/93 supports-[backdrop-filter]:bg-background/82 border-b border-transparent shadow-[0_8px_24px_oklch(0_0_0/0.05)] backdrop-blur-md backdrop-saturate-150"
    : "bg-background sticky top-0";

  return (
    <div
      className={cn(
        "relative flex min-h-0 w-full flex-1 flex-col overflow-hidden",
        overlayMapOpen ? "bg-[var(--map-placeholder-bg,#ece8e5)]" : "bg-background",
      )}
    >
      {overlayMapOpen ? (
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div className="bg-map-placeholder-bg h-full w-full" aria-hidden />}>
            <KakaoMapView
              appKey={KAKAO_MAP_APP_KEY}
              places={mapPins}
              center={mapPins.length > 0 ? mapCenter : MAP_INITIAL_CENTER}
              className="h-full w-full"
            />
          </Suspense>
        </div>
      ) : null}

      <header
        className={cn(
          "relative z-20 shrink-0 pt-[max(1rem,env(safe-area-inset-top))]",
          headerBackdrop,
        )}
      >
        <div className="flex h-12 items-center px-5">
          <button
            type="button"
            onClick={handleHeaderBack}
            className="touch-target-min -ml-3 flex items-center justify-center rounded-full"
          >
            <ArrowLeft className="size-5 text-[#222222]" aria-hidden />
            <span className="sr-only">
              {detailOpen
                ? "장소 상세 닫기"
                : selectedCourse
                  ? "코스 상세 닫기"
                  : "마이페이지로 돌아가기"}
            </span>
          </button>
          <h1 className="flex-1 text-center text-base leading-tight font-semibold tracking-tight text-[#111111]">
            저장된 데이트 코스
          </h1>
          <span
            className={cn(
              "text-right text-xs font-semibold text-[#555555]",
              overlayMapOpen ? "w-14 shrink-0" : "max-w-[48%] truncate",
            )}
          >
            총 {formatCount(visibleCourses.length)}개
          </span>
        </div>

        {!overlayMapOpen ? (
          <div
            ref={filterChromeRef}
            className="relative flex flex-wrap gap-2 overflow-visible px-5 pb-2"
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
                  setSelectedFilter("room");
                  setOpenPopup((current) => (current === "room" ? null : "room"));
                }}
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
                    "absolute left-0 z-40 !mt-1 flex max-h-[min(18.5rem,calc(100vh-12rem))] w-[min(16.5rem,calc(100vw-4rem))] min-w-36 flex-col !rounded-lg backdrop-saturate-150",
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
                          <div className="bg-muted/50 size-[1.125rem] shrink-0 animate-pulse rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : roomsList.length === 0 ? (
                    <div className="text-muted-foreground flex flex-col items-center gap-1.5 px-4 py-6 text-center">
                      <div className="bg-muted/70 flex size-9 items-center justify-center rounded-lg shadow-inner">
                        <AlertCircle className="size-4 opacity-50" strokeWidth={1.75} aria-hidden />
                      </div>
                      <p className="text-xs leading-snug font-medium">참여 중인 방이 없습니다.</p>
                      <p className="text-muted-foreground/85 max-w-[13rem] text-[0.65rem] leading-relaxed">
                        방에 참여하면 여기서 코스를 방별로 모아볼 수 있어요.
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
                              <span
                                className="bg-muted text-muted-foreground col-start-1 row-span-2 row-start-1 flex size-9 shrink-0 items-center justify-center self-center rounded-full"
                                aria-hidden
                              >
                                <User className="size-[1.125rem]" strokeWidth={2} />
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
                                    "flex size-[1.125rem] items-center justify-center rounded-full border transition-colors duration-150",
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
        ) : null}
      </header>

      {!overlayMapOpen ? (
        <div className="scrollbar-hide relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-3 pb-[max(1rem,calc(env(safe-area-inset-bottom)+5.75rem))]">
          {visibleCourses.length > 0 ? (
            <div className="space-y-2 pb-2">
              {visibleCourses.map((course) => (
                <SavedCourseCard key={course.id} course={course} onSelect={onSelectCourse} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[12rem] flex-col items-center justify-center py-8 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-[#777777] text-white">
                <AlertCircle className="size-5" aria-hidden />
              </span>
              <p className="mt-4 text-sm font-medium text-[#8a8a8a]">
                해당하는 데이트 코스가 없습니다.
              </p>
            </div>
          )}
        </div>
      ) : null}

      <CoursePlannerBottomSheet open={Boolean(selectedCourse)} onClose={onCloseCourseSheet}>
        {selectedCourse ? (
          <CoursePlaceInfoPanel
            hideNewCourseSaveButton
            courseTitle={selectedCourse.title}
            stops={savedCourseToPlannerStops(selectedCourse, savedPlaces)}
            onBack={onCloseCourseSheet}
            onSave={(nextTitle, nextStops, fromEditMode) =>
              onPersistCourse(selectedCourse.id, nextTitle, nextStops, fromEditMode)
            }
          />
        ) : null}
      </CoursePlannerBottomSheet>
    </div>
  );
}
