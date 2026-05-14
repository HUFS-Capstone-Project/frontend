import { useQueryClient } from "@tanstack/react-query";
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
import { PlaceDetailSheet } from "@/components/place/PlaceDetailSheet";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { roomPlaceApi, roomPlaceQueryKeys } from "@/features/room-places";
import {
  useMyPlacesQuery,
  userPlaceToSavedPlace,
  useUpdateNicknameMutation,
  useUserMeQuery,
} from "@/features/users";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { usePlaceDetailOpenEvent } from "@/hooks/use-place-detail-open-event";
import { SHELL_CONTENT_FADE_SECONDS } from "@/shared/config/ui-timing";
import { savedCourses as seedSavedCourses } from "@/shared/mocks/course-mocks";
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
  page: 0,
  size: 100,
} as const;

export default function MyPage() {
  const queryClient = useQueryClient();
  const { toastMessage, toastPlacement, handleSelectBottomNav, showToast } =
    useBottomNavController();
  const { handleLogout } = useLogout();
  const updateNicknameMutation = useUpdateNicknameMutation();
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
  const [coursesList, setCoursesList] = useState<SavedCourse[]>(() => [...seedSavedCourses]);
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const myPlacesQuery = useMyPlacesQuery({ params: MY_PAGE_PLACES_QUERY_PARAMS });
  const apiPlaces = useMemo(
    () => (myPlacesQuery.data?.items ?? []).map(userPlaceToSavedPlace),
    [myPlacesQuery.data?.items],
  );
  const summaryPlaces = myPlacesQuery.data ? apiPlaces : places;
  const summaryPlaceCount = myPlacesQuery.data?.totalElements ?? places.length;

  const openPlaceDetail = usePlaceDetailStore((s) => s.openDetail);
  const closePlaceDetail = usePlaceDetailStore((s) => s.closeDetail);

  usePlaceDetailOpenEvent(view === "places" || view === "courses");

  useEffect(() => {
    if (myPlacesQuery.data) {
      queueMicrotask(() => setPlaces(apiPlaces));
    }
  }, [apiPlaces, myPlacesQuery.data]);

  const invalidateMyPlaces = async (roomId?: string | null) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["user", "me", "places"] }),
      roomId
        ? queryClient.invalidateQueries({ queryKey: roomPlaceQueryKeys.room(roomId) })
        : Promise.resolve(),
    ]);
  };

  const handleSavePlaceMemo = async (placeId: string, memo: string) => {
    const nextMemo = memo.trim();
    const target = places.find((place) => place.id === placeId);

    if (target?.roomId && target.roomPlaceId != null) {
      try {
        await roomPlaceApi.updateMemo(target.roomId, target.roomPlaceId, { memo: nextMemo });
        await invalidateMyPlaces(target.roomId);
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
    const target = places.find((place) => place.id === placeId);

    if (target?.roomId && target.roomPlaceId != null) {
      try {
        await roomPlaceApi.deleteRoomPlace(target.roomId, target.roomPlaceId);
        await invalidateMyPlaces(target.roomId);
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

  const handleSavedCoursePersist = (prevCourseId: string, payload: CourseSavePayload) => {
    showToast("코스가 저장되었습니다", 3200);

    const nextStopsMinimal = payload.stops.map((s) => ({
      id: s.id,
      name: s.name,
      address: s.address,
      walkingTime: s.walkingTime === "—" ? undefined : s.walkingTime,
      hours: s.hours === "—" ? undefined : s.hours,
    }));

    if (payload.kind === "edit") {
      const updated: SavedCourse | undefined = coursesList.find((c) => c.id === prevCourseId);
      if (!updated) return;

      const merged: SavedCourse = { ...updated, title: payload.title, stops: nextStopsMinimal };
      setCoursesList((list) => list.map((c) => (c.id === prevCourseId ? merged : c)));
      setSavedCourseSheet({ kind: "detail", course: merged });
    } else {
      setSavedCourseSheet({ kind: "closed" });
    }
  };

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
        ) : view === "courses" ? (
          <motion.div
            key="courses"
            className="relative flex min-h-0 flex-1 flex-col"
            {...MY_PAGE_FADE_VARIANT}
            transition={MY_PAGE_FADE_TRANSITION}
          >
            <MySavedCoursesPage
              courses={coursesList}
              savedPlaces={places}
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
            <PlaceDetailSheet />
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
                    recentPlaces={summaryPlaces
                      .slice(0, 2)
                      .map((place) => ({ id: place.id, name: place.name }))}
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
