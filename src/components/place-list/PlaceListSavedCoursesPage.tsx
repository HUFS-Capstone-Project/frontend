import { AlertCircle, Check, ChevronDown, ChevronRight } from "lucide-react";
import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";

import { BottomNavigationBar, type BottomNavId } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { EmptyState } from "@/components/common/EmptyState";
import {
  LIST_TOP_BAR_AFTER_TITLE_CLASS,
  ListTopBar,
} from "@/components/common/ListTopBar";
import { MapBackdropLayer } from "@/components/common/MapBackdropLayer";
import { CoursePlaceInfoPanel } from "@/components/course-planner/CoursePlaceInfoPanel";
import { DateCalendarPanel } from "@/components/course-planner/DateTimeSelectionPanel";
import {
  MAP_CHIP_BASE_CLASS,
  MAP_CHIP_SELECTED_CLASS,
  MAP_CHIP_UNSELECTED_CLASS,
  MAP_FILTER_PANEL_BASE_CLASS,
} from "@/components/map/chip-style";
import { weightedMapCenter } from "@/components/mypage/map-places-from-my-saved";
import {
  mapPlacesFromSavedCourses,
  savedCourseToPlannerStops,
} from "@/components/mypage/saved-course-planner-map";
import { SavedCourseCard } from "@/components/mypage/SavedCourseCard";
import { PlaceDetailSheet } from "@/components/place/PlaceDetailSheet";
import { useRoomsQuery } from "@/features/room";
import { usePointerDownOutside } from "@/hooks/use-pointer-down-outside";
import type { BottomNavToastPlacement } from "@/hooks/use-bottom-nav-controller";
import { cn } from "@/lib/utils";
import { MAP_INITIAL_CENTER } from "@/shared/mocks/place-mocks";
import type { CourseSavePayload, SavedCourse } from "@/shared/types/course";
import type { SavedPlace } from "@/shared/types/my-page";
import { usePlaceDetailStore } from "@/store/place-detail-store";

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
const KakaoMapView = lazy(() =>
  import("@/components/map/KakaoMapView").then((module) => ({ default: module.KakaoMapView })),
);

type CourseFilter = "all" | "room" | "date";
type FilterPopup = Exclude<CourseFilter, "all"> | null;

type PlaceListSavedCoursesPageProps = {
  roomId?: string | null;
  roomName: string;
  courses: SavedCourse[];
  savedPlaces: SavedPlace[];
  toastMessage: string;
  toastPlacement?: BottomNavToastPlacement;
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

export function PlaceListSavedCoursesPage({
  roomId = null,
  roomName,
  courses,
  savedPlaces,
  toastMessage,
  toastPlacement = "bottom",
  onSelectBottomNav,
  onBackToMap,
  onSwitchTab,
}: PlaceListSavedCoursesPageProps) {
  const { data: roomsFromApi, isLoading: isRoomsLoading } = useRoomsQuery();
  const [savedCourses, setSavedCourses] = useState(courses);
  const [selectedCourse, setSelectedCourse] = useState<SavedCourse | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<CourseFilter>("all");
  const [openPopup, setOpenPopup] = useState<FilterPopup>(null);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const detailOpen = usePlaceDetailStore((s) => s.isOpen);
  const selectedPlaceId = usePlaceDetailStore((s) => s.selectedPlaceId);
  const closeDetail = usePlaceDetailStore((s) => s.closeDetail);
  const filterChromeRef = useRef<HTMLDivElement>(null);

  const roomChipApplied = selectedRoomIds.length > 0;
  const dateChipApplied = selectedDate !== null;
  const allChipActive = !roomChipApplied && !dateChipApplied;
  const overlayMapOpen = Boolean(selectedCourse) || detailOpen;

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

  const visibleCourses = useMemo(() => {
    if (selectedFilter === "date" && selectedDate === "2025.04.26") {
      return [];
    }

    if (selectedFilter === "date" && selectedDate) {
      return savedCourses.filter((course) => course.executedAtLabel.includes("04.20")).slice(0, 8);
    }

    if (selectedFilter === "room" && selectedRoomIds.length > 0) {
      return savedCourses.filter(
        (course) =>
          course.savedFromRoomId != null && selectedRoomIds.includes(course.savedFromRoomId),
      );
    }

    return savedCourses;
  }, [savedCourses, selectedDate, selectedFilter, selectedRoomIds]);

  const mapPins = useMemo(() => {
    return selectedCourse
      ? mapPlacesFromSavedCourses([selectedCourse], savedPlaces)
      : mapPlacesFromSavedCourses(visibleCourses, savedPlaces);
  }, [savedPlaces, selectedCourse, visibleCourses]);

  const mapCenter = useMemo(() => {
    if (detailOpen && selectedPlaceId) {
      const pin = mapPins.find((place) => place.id === selectedPlaceId);
      if (pin) {
        return { latitude: pin.latitude, longitude: pin.longitude };
      }
    }

    if (selectedCourse) {
      const focusedPins = mapPlacesFromSavedCourses([selectedCourse], savedPlaces);
      if (focusedPins.length > 0) {
        return weightedMapCenter(focusedPins);
      }
    }

    return weightedMapCenter(mapPins);
  }, [detailOpen, mapPins, savedPlaces, selectedCourse, selectedPlaceId]);

  const handleSelectAll = () => {
    setSelectedFilter("all");
    setOpenPopup(null);
    setSelectedRoomIds([]);
    setSelectedDate(null);
  };

  const handleToggleRoom = (nextRoomId: string) => {
    const nextIds = selectedRoomIds.includes(nextRoomId)
      ? selectedRoomIds.filter((item) => item !== nextRoomId)
      : [...selectedRoomIds, nextRoomId];
    setSelectedRoomIds(nextIds);
    setSelectedFilter(nextIds.length === 0 ? "all" : "room");
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

  const handlePersistCourse = (prevCourseId: string, payload: CourseSavePayload) => {
    if (payload.kind !== "edit") {
      return;
    }

    setSavedCourses((current) =>
      current.map((course) =>
        course.id === prevCourseId
          ? {
              ...course,
              title: payload.title,
              stops: payload.stops.map((stop) => ({
                id: stop.placeId,
                name: stop.name,
                address: stop.address,
                walkingTime: stop.walkingTime,
                hours: stop.hours,
              })),
            }
          : course,
      ),
    );

    setSelectedCourse((current) =>
      current?.id === prevCourseId
        ? {
            ...current,
            title: payload.title,
            stops: payload.stops.map((stop) => ({
              id: stop.placeId,
              name: stop.name,
              address: stop.address,
              walkingTime: stop.walkingTime,
              hours: stop.hours,
            })),
          }
        : current,
    );
  };

  const titleNode = (
    <button
      type="button"
      onClick={onBackToMap}
      className="inline-flex max-w-full items-center gap-1"
      aria-label="방 지도 화면으로 이동"
    >
      <span className="truncate">{roomName}</span>
      <ChevronRight className="size-4 shrink-0" aria-hidden />
    </button>
  );

  return (
    <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {overlayMapOpen ? (
        <MapBackdropLayer>
          <Suspense fallback={<div className="bg-muted h-full w-full" aria-hidden />}>
            <KakaoMapView
              appKey={KAKAO_MAP_APP_KEY}
              places={mapPins}
              center={mapPins.length > 0 ? mapCenter : MAP_INITIAL_CENTER}
              className="h-full w-full"
            />
          </Suspense>
        </MapBackdropLayer>
      ) : null}

      <ListTopBar
        title={titleNode}
        trailing={`총 ${formatCount(visibleCourses.length)}개`}
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

            <div ref={filterChromeRef} className="relative flex flex-wrap items-center gap-2 overflow-visible">
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
                >
                  방
                  <ChevronDown
                    className={cn(
                      "size-3.5 shrink-0 opacity-80 transition-transform duration-150",
                      openPopup === "room" && "-rotate-180",
                    )}
                    aria-hidden
                  />
                </button>

                {openPopup === "room" ? (
                  <div
                    className={cn(
                      MAP_FILTER_PANEL_BASE_CLASS,
                      "absolute left-0 z-40 mt-1! flex min-w-40 flex-col rounded-lg! p-1.5",
                    )}
                  >
                    {isRoomsLoading ? (
                      <div className="px-3 py-4 text-xs text-[#8b8b8b]">방 목록 불러오는 중...</div>
                    ) : roomsList.length === 0 ? (
                      <div className="px-3 py-4 text-xs text-[#8b8b8b]">참여 중인 방이 없습니다.</div>
                    ) : (
                      roomsList.map((room) => {
                        const checked = selectedRoomIds.includes(room.roomId);
                        return (
                          <button
                            key={room.roomId}
                            type="button"
                            onClick={() => handleToggleRoom(room.roomId)}
                            className="flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-[#f6f6f6]"
                          >
                            <span
                              className={cn(
                                "flex size-4 items-center justify-center rounded border",
                                checked
                                  ? "border-[#303030] bg-[#303030] text-white"
                                  : "border-[#d6d6d6] bg-white text-transparent",
                              )}
                            >
                              <Check className="size-3" aria-hidden />
                            </span>
                            <span className="truncate">{room.roomName}</span>
                          </button>
                        );
                      })
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
                  className={cn(filterChipClass(dateChipApplied), "shrink-0 gap-1 px-3")}
                  aria-expanded={openPopup === "date"}
                >
                  {selectedDate ?? "날짜"}
                  <ChevronDown
                    className={cn(
                      "size-3.5 shrink-0 opacity-80 transition-transform duration-150",
                      openPopup === "date" && "-rotate-180",
                    )}
                    aria-hidden
                  />
                </button>

                {openPopup === "date" ? (
                  <div
                    className={cn(
                      MAP_FILTER_PANEL_BASE_CLASS,
                      "absolute right-0 z-40 mt-1! w-[16rem] rounded-lg! p-2",
                    )}
                  >
                    <DateCalendarPanel selectedDate={selectedDate} onSelectDate={handlePickCalendarDate} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </ListTopBar>

      {!overlayMapOpen ? (
        <div className="scrollbar-hide relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-3 pb-[max(1rem,calc(env(safe-area-inset-bottom)+5.75rem))]">
          {visibleCourses.length > 0 ? (
            <div className="space-y-2 pb-2">
              {visibleCourses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-xl border border-[#ededed] bg-white px-1 py-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                >
                  <SavedCourseCard course={course} onSelect={setSelectedCourse} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<AlertCircle className="size-5" aria-hidden />}
              message="해당하는 데이트 코스가 없습니다."
            />
          )}
        </div>
      ) : null}

      {selectedCourse ? (
        <div className="relative z-10 mt-auto">
          <CoursePlaceInfoPanel
            courseTitle={selectedCourse.title}
            stops={savedCourseToPlannerStops(selectedCourse, savedPlaces)}
            onBack={() => setSelectedCourse(null)}
            onSave={(payload) => handlePersistCourse(selectedCourse.id, payload)}
            hideNewCourseSaveButton
          />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 *:pointer-events-auto">
        <BottomNavToast message={toastMessage} placement={toastPlacement} />
        <BottomNavigationBar activeId="map" onSelect={onSelectBottomNav} />
      </div>

      <PlaceDetailSheet roomId={roomId} savedPlaces={savedPlaces} />
    </div>
  );
}
