import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { MyAccountActions } from "@/components/mypage/MyAccountActions";
import { MyPlaceSummaryCard } from "@/components/mypage/MyPlaceSummaryCard";
import { MyProfileHeader } from "@/components/mypage/MyProfileHeader";
import { MyProfileInfoPage } from "@/components/mypage/MyProfileInfoPage";
import { MySavedCoursesPage } from "@/components/mypage/MySavedCoursesPage";
import { MySavedPlacesPage } from "@/components/mypage/MySavedPlacesPage";
import { SavedCourseSection } from "@/components/mypage/SavedCourseSection";
import { useSavedPlaceActions } from "@/components/mypage/use-saved-place-actions";
import { PlaceDetailSheet } from "@/components/place/PlaceDetailSheet";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { COURSE_TOAST_DURATION_MS } from "@/features/course-planner/constants";
import { useMyDateCoursesQuery } from "@/features/course-planner/hooks/use-my-date-courses-query";
import { useUpdateDateCourseMutation } from "@/features/course-planner/hooks/use-update-date-course-mutation";
import { isDateCourseConflictError } from "@/features/course-planner/lib/date-course-errors";
import { mapMySavedDateCourseToSavedCourse } from "@/features/course-planner/lib/map-my-saved-date-course";
import { mapRoomSavedDateCourseToSavedCourse } from "@/features/course-planner/lib/map-room-saved-date-course";
import { useRoomsQuery } from "@/features/room";
import {
  useMyPlacesQuery,
  userPlaceToSavedPlace,
  useUpdateNicknameMutation,
  useUserMeQuery,
} from "@/features/users";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { usePlaceDetailOpenEvent } from "@/hooks/use-place-detail-open-event";
import { resolveGeneralApiErrorMessage } from "@/shared/api/error";
import { SHELL_CONTENT_FADE_SECONDS } from "@/shared/config/ui-timing";
import type { CourseSavePayload, SavedCourse } from "@/shared/types/course";
import type { SavedPlace } from "@/shared/types/my-page";
import { useAuthStore } from "@/store/auth-store";
import { usePlaceDetailStore } from "@/store/place-detail-store";

type MyPageView = "main" | "profile" | "places" | "courses";

type SavedCourseSheetState = { kind: "closed" } | { kind: "detail"; course: SavedCourse };

const MY_PAGE_FADE_VARIANT = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

const MY_PAGE_FADE_TRANSITION = {
  duration: SHELL_CONTENT_FADE_SECONDS,
  ease: "easeOut" as const,
};

const MY_PAGE_PLACES_QUERY_PARAMS = {
  limit: 20,
} as const;

export default function MyPage() {
  const { toastMessage, toastPlacement, handleSelectBottomNav, showToast } =
    useBottomNavController();
  const { handleLogout } = useLogout();
  const updateNicknameMutation = useUpdateNicknameMutation();
  const updateDateCourseMutation = useUpdateDateCourseMutation();
  const nicknameFromAuth = useAuthStore((s) => s.nickname);
  const { data: me } = useUserMeQuery();
  const profileNickname =
    me?.nickname?.trim() ?? (nicknameFromAuth?.trim().length ? nicknameFromAuth.trim() : "");
  const displayNickname = profileNickname.length > 0 ? profileNickname : "회원";
  const profileImageUrl = me?.profileImageUrl ?? null;
  const email = me?.email ?? null;

  const [view, setView] = useState<MyPageView>("main");
  const [savedCourseSheet, setSavedCourseSheet] = useState<SavedCourseSheetState>({
    kind: "closed",
  });
  const [courseOverrides, setCourseOverrides] = useState<Record<string, SavedCourse>>({});
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const { resolveMutationTarget, updateMemoMutation, deletePlaceMutation } =
    useSavedPlaceActions(places);
  const myPlacesQuery = useMyPlacesQuery({ params: MY_PAGE_PLACES_QUERY_PARAMS });
  const myDateCoursesQuery = useMyDateCoursesQuery({
    enabled: view === "main" || view === "courses",
  });
  const roomsQuery = useRoomsQuery({
    enabled: view === "main" || view === "courses",
  });
  const apiCourses = useMemo(
    () =>
      (myDateCoursesQuery.data?.pages ?? []).flatMap((page) =>
        page.items.map(mapMySavedDateCourseToSavedCourse),
      ),
    [myDateCoursesQuery.data?.pages],
  );
  const coursesList = useMemo(() => {
    const roomById = new Map((roomsQuery.data ?? []).map((room) => [room.roomId, room]));

    return apiCourses.map((course) => {
      const overridden = courseOverrides[course.id] ?? course;
      const room = overridden.savedFromRoomId
        ? roomById.get(overridden.savedFromRoomId)
        : undefined;

      return {
        ...overridden,
        savedFromRoomName: overridden.savedFromRoomName ?? room?.roomName ?? null,
        savedFromRoomAvatarSeed: room?.avatarSeed ?? overridden.savedFromRoomAvatarSeed ?? null,
      };
    });
  }, [apiCourses, courseOverrides, roomsQuery.data]);
  const apiPlaces = useMemo(
    () =>
      (myPlacesQuery.data?.pages ?? []).flatMap((page) => page.items.map(userPlaceToSavedPlace)),
    [myPlacesQuery.data?.pages],
  );
  const summaryPlaces = myPlacesQuery.data ? apiPlaces : places;
  const summaryPlaceCount = myPlacesQuery.data?.pages[0]?.totalCount ?? summaryPlaces.length;
  const totalDateCourseCount = myDateCoursesQuery.data?.pages[0]?.totalCount ?? coursesList.length;

  const openPlaceDetail = usePlaceDetailStore((s) => s.openDetail);
  const closePlaceDetail = usePlaceDetailStore((s) => s.closeDetail);

  usePlaceDetailOpenEvent(view === "places" || view === "courses");

  useEffect(() => {
    if (myPlacesQuery.data) {
      queueMicrotask(() => setPlaces(apiPlaces));
    }
  }, [apiPlaces, myPlacesQuery.data]);

  const handleSavePlaceMemo = async (placeId: string, memo: string) => {
    const nextMemo = memo.trim();
    const target = resolveMutationTarget(placeId);

    if (target) {
      try {
        await updateMemoMutation.mutateAsync({ ...target, memo: nextMemo });
      } catch (error) {
        console.error("Failed to update saved place memo", error);
        return;
      }
    }

    setPlaces((currentPlaces) =>
      currentPlaces.map((place) =>
        place.id === placeId ? { ...place, memo: nextMemo || undefined } : place,
      ),
    );
  };

  const handleDeletePlace = async (placeId: string) => {
    const target = resolveMutationTarget(placeId);

    if (target) {
      try {
        await deletePlaceMutation.mutateAsync(target);
      } catch (error) {
        console.error("Failed to delete saved place", error);
        return;
      }
    }

    setPlaces((currentPlaces) => currentPlaces.filter((place) => place.id !== placeId));
    closePlaceDetail();
  };

  const handleUpdateNickname = async (nickname: string) => {
    await updateNicknameMutation.mutateAsync({ nickname });
  };

  const handleSavedCoursePersist = async (prevCourseId: string, payload: CourseSavePayload) => {
    if (payload.kind !== "edit") {
      setSavedCourseSheet({ kind: "closed" });
      return;
    }

    const source = coursesList.find((c) => c.id === prevCourseId);
    const roomId = source?.savedFromRoomId;
    if (!source || !roomId) {
      showToast("코스 수정에 필요한 방 정보를 찾지 못했어요.", COURSE_TOAST_DURATION_MS);
      throw new Error("roomId is required to update date course");
    }

    const roomPlaceIds = payload.stops.map((stop) => stop.roomPlaceId);
    if (roomPlaceIds.length === 0) {
      showToast("코스에는 장소가 1개 이상 필요해요.", COURSE_TOAST_DURATION_MS);
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
      const merged: SavedCourse = {
        ...source,
        ...updatedCourse,
        savedFromRoomName: source.savedFromRoomName,
        savedFromRoomAvatarSeed: source.savedFromRoomAvatarSeed,
      };
      setCourseOverrides((current) => ({ ...current, [prevCourseId]: merged }));
      setSavedCourseSheet({ kind: "detail", course: merged });
      showToast("코스가 수정되었습니다.", COURSE_TOAST_DURATION_MS);
    } catch (error) {
      if (isDateCourseConflictError(error)) {
        throw error;
      }
      showToast(resolveGeneralApiErrorMessage(error), COURSE_TOAST_DURATION_MS);
      throw error;
    }
  };

  const activeCourseRoomId =
    savedCourseSheet.kind === "detail" ? savedCourseSheet.course.savedFromRoomId : null;

  return (
    <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {view === "places" ? (
          <motion.div
            key="places"
            className="relative flex min-h-0 flex-1 flex-col"
            {...MY_PAGE_FADE_VARIANT}
            transition={MY_PAGE_FADE_TRANSITION}
          >
            <MySavedPlacesPage
              onBack={() => {
                closePlaceDetail();
                setView("main");
              }}
              onSelectPlace={(place) => {
                setPlaces((currentPlaces) =>
                  currentPlaces.some((item) => item.id === place.id)
                    ? currentPlaces
                    : [place, ...currentPlaces],
                );
                openPlaceDetail(place.id);
              }}
            />
            {savedCourseSheet.kind !== "detail" ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 [&>*]:pointer-events-auto">
                <BottomNavToast message={toastMessage} placement={toastPlacement} />
                <BottomNavigationBar
                  activeId="mypage"
                  onSelect={handleSelectBottomNav}
                  className="border-border/40 bg-card"
                />
              </div>
            ) : null}
            <PlaceDetailSheet
              savedPlaces={places}
              onSaveMemo={handleSavePlaceMemo}
              onDeletePlace={handleDeletePlace}
            />
          </motion.div>
        ) : view === "courses" ? (
          <motion.div
            key="courses"
            className="relative flex min-h-0 flex-1 flex-col"
            {...MY_PAGE_FADE_VARIANT}
            transition={MY_PAGE_FADE_TRANSITION}
          >
            <MySavedCoursesPage
              courses={coursesList}
              totalCount={totalDateCourseCount}
              savedPlaces={places}
              hasNextPage={myDateCoursesQuery.hasNextPage}
              isFetchingNextPage={myDateCoursesQuery.isFetchingNextPage}
              onLoadMore={() => {
                void myDateCoursesQuery.fetchNextPage();
              }}
              selectedCourse={savedCourseSheet.kind === "detail" ? savedCourseSheet.course : null}
              onSelectCourse={(course) => setSavedCourseSheet({ kind: "detail", course })}
              onCloseCourseSheet={() => setSavedCourseSheet({ kind: "closed" })}
              onBack={() => {
                closePlaceDetail();
                setSavedCourseSheet({ kind: "closed" });
                setView("main");
              }}
              onPersistCourse={handleSavedCoursePersist}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 [&>*]:pointer-events-auto">
              <BottomNavToast message={toastMessage} placement={toastPlacement} />
              <BottomNavigationBar
                activeId="mypage"
                onSelect={handleSelectBottomNav}
                className="border-border/40 bg-card"
              />
            </div>
            <PlaceDetailSheet roomId={activeCourseRoomId} />
          </motion.div>
        ) : view === "profile" ? (
          <motion.div
            key="profile"
            className="flex min-h-0 flex-1 flex-col"
            {...MY_PAGE_FADE_VARIANT}
            transition={MY_PAGE_FADE_TRANSITION}
          >
            <MyProfileInfoPage
              nickname={displayNickname}
              email={email}
              profileImageUrl={profileImageUrl}
              isUpdatingNickname={updateNicknameMutation.isPending}
              onBack={() => setView("main")}
              onUpdateNickname={handleUpdateNickname}
            />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            className="relative flex min-h-0 flex-1 flex-col"
            {...MY_PAGE_FADE_VARIANT}
            transition={MY_PAGE_FADE_TRANSITION}
          >
            <main className="scrollbar-hide bg-background min-h-0 flex-1 overflow-y-auto px-4 pt-[max(1rem,calc(env(safe-area-inset-top)+0.75rem))] pb-[max(1rem,calc(env(safe-area-inset-bottom)+5.75rem))]">
              <div className="mx-auto max-w-md">
                <MyProfileHeader
                  nickname={displayNickname}
                  profileImageUrl={profileImageUrl}
                  onOpenProfile={() => setView("profile")}
                />

                <div className="pt-3">
                  <MyPlaceSummaryCard
                    totalCount={summaryPlaceCount}
                    recentPlaces={summaryPlaces.slice(0, 2).map((place) => ({
                      id: place.id,
                      name: place.name,
                      category: place.category,
                      categoryName: place.categoryName,
                    }))}
                    isLoading={myPlacesQuery.isLoading && myPlacesQuery.data == null}
                    onOpenPlaces={() => {
                      closePlaceDetail();
                      setView("places");
                    }}
                  />

                  <SavedCourseSection
                    courses={coursesList}
                    onOpenFullList={() => {
                      setSavedCourseSheet({ kind: "closed" });
                      setView("courses");
                    }}
                    onSelectCourse={(course) => {
                      setSavedCourseSheet({ kind: "detail", course });
                      setView("courses");
                    }}
                  />

                  <MyAccountActions onLogout={() => void handleLogout()} />
                </div>
              </div>
            </main>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 [&>*]:pointer-events-auto">
              <BottomNavToast message={toastMessage} placement={toastPlacement} />
              <BottomNavigationBar
                activeId="mypage"
                onSelect={handleSelectBottomNav}
                className="border-border/40 bg-card"
              />
            </div>

            <PlaceDetailSheet
              savedPlaces={places}
              onSaveMemo={handleSavePlaceMemo}
              onDeletePlace={handleDeletePlace}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
