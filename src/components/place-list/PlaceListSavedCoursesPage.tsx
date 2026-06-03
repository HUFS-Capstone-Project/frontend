import { AlertCircle, Check, ChevronDown, User } from "lucide-react";
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
  mapPlacesFromSavedCourses,
  savedCourseToPlannerStops,
} from "@/components/mypage/saved-course-planner-map";
import { SavedCourseCard } from "@/components/mypage/SavedCourseCard";
import { PlaceDetailSheet } from "@/components/place/PlaceDetailSheet";
import { useDateCourseDetailQuery } from "@/features/course-planner/hooks/use-date-course-detail-query";
import { useRoomDateCoursesQuery } from "@/features/course-planner/hooks/use-room-date-courses-query";
import { mapRoomSavedDateCourseToSavedCourse } from "@/features/course-planner/lib/map-room-saved-date-course";
import type { BottomNavToastPlacement } from "@/hooks/use-bottom-nav-controller";
import { usePointerDownOutside } from "@/hooks/use-pointer-down-outside";
import { cn } from "@/lib/utils";
import { MAP_INITIAL_CENTER } from "@/shared/config/map";
import type { CourseSavePayload, SavedCourse } from "@/shared/types/course";
import type { SavedPlace } from "@/shared/types/my-page";
import { usePlaceDetailStore } from "@/store/place-detail-store";

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
const KakaoMapView = lazy(() =>
  import("@/components/map/KakaoMapView").then((module) => ({ default: module.KakaoMapView })),
);

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
  onSelectBottomNav,
  onBackToMap,
  onSwitchTab,
}: PlaceListSavedCoursesPageProps) {
  const [selectedCourse, setSelectedCourse] = useState<SavedCourse | null>(null);
  const [courseOverrides, setCourseOverrides] = useState<Record<string, SavedCourse>>({});
  const [, setSelectedFilter] = useState<CourseFilter>("all");
  const [openPopup, setOpenPopup] = useState<FilterPopup>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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
  const filterChromeRef = useRef<HTMLDivElement>(null);

  const memberChipApplied = selectedMemberIds.length > 0;
  const dateChipApplied = selectedDate !== null;
  const allChipActive = !memberChipApplied && !dateChipApplied;
  const overlayMapOpen = Boolean(selectedCourse) || detailOpen;

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
      (roomDateCoursesQuery.data?.items ?? []).map((course) =>
        mapRoomSavedDateCourseToSavedCourse(course, roomId),
      ),
    [roomDateCoursesQuery.data?.items, roomId],
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

  const mapPins = useMemo(() => {
    return selectedCourseWithDetail
      ? mapPlacesFromSavedCourses([selectedCourseWithDetail], savedPlaces)
      : mapPlacesFromSavedCourses(visibleCourses, savedPlaces);
  }, [savedPlaces, selectedCourseWithDetail, visibleCourses]);

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

  const handlePersistCourse = (prevCourseId: string, payload: CourseSavePayload) => {
    if (payload.kind !== "edit") {
      return;
    }

    const source = savedCourses.find((course) => course.id === prevCourseId) ?? selectedCourse;
    if (!source) {
      return;
    }

    const nextCourse: SavedCourse = {
      ...source,
      title: payload.title,
      stops: payload.stops.map((stop) => ({
        id: stop.id,
        roomPlaceId: stop.roomPlaceId,
        name: stop.name,
        address: stop.address,
        category: stop.category,
        categoryName: stop.categoryName,
        tagCode: stop.tagCode,
        tagName: stop.tagName,
        latitude: stop.latitude,
        longitude: stop.longitude,
        walkingTime: stop.walkingTime,
        hours: stop.hours,
      })),
    };

    setCourseOverrides((current) => ({ ...current, [prevCourseId]: nextCourse }));
    setSelectedCourse(nextCourse);
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
              className="h-full w-full"
            />
          </Suspense>
        </MapBackdropLayer>
      ) : null}

      <ListTopBar
        title={roomName}
        trailing={`${formatCount(visibleCourses.length)}개`}
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

      {!overlayMapOpen ? (
        <div className="scrollbar-hide relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-3 pb-[max(1rem,calc(env(safe-area-inset-bottom)+5.75rem))]">
          {roomDateCoursesQuery.isLoading ? (
            <EmptyState
              icon={<AlertCircle className="size-5" aria-hidden />}
              message="저장된 데이트 코스를 불러오는 중이에요."
            />
          ) : visibleCourses.length > 0 ? (
            <div className="space-y-2 pb-2">
              {visibleCourses.map((course) => (
                <SavedCourseCard key={course.id} course={course} onSelect={setSelectedCourse} />
              ))}
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
      >
        {selectedCourseWithDetail ? (
          <CoursePlaceInfoPanel
            courseTitle={selectedCourseWithDetail.title}
            stops={savedCourseToPlannerStops(selectedCourseWithDetail, savedPlaces)}
            onBack={() => setSelectedCourse(null)}
            onSave={(payload) => handlePersistCourse(selectedCourseWithDetail.id, payload)}
            hideNewCourseSaveButton
          />
        ) : null}
      </CoursePlannerBottomSheet>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 *:pointer-events-auto">
        <BottomNavToast message={toastMessage} placement={toastPlacement} />
        <BottomNavigationBar activeId="map" onSelect={onSelectBottomNav} />
      </div>

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
