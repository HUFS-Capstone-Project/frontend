import { useState } from "react";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { MyAccountActions } from "@/components/mypage/MyAccountActions";
import { MyPlaceSummaryCard } from "@/components/mypage/MyPlaceSummaryCard";
import { MyProfileHeader } from "@/components/mypage/MyProfileHeader";
import { MySavedCoursesPage } from "@/components/mypage/MySavedCoursesPage";
import { MySavedPlacesPage } from "@/components/mypage/MySavedPlacesPage";
import { SavedCourseSection } from "@/components/mypage/SavedCourseSection";
import { PlaceDetailSheet } from "@/components/place/PlaceDetailSheet";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useUserMeQuery } from "@/features/users";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { usePlaceDetailOpenEvent } from "@/hooks/use-place-detail-open-event";
import { savedCourses as seedSavedCourses } from "@/shared/mocks/course-mocks";
import { savedPlaces as initialSavedPlaces } from "@/shared/mocks/my-page-mocks";
import type { CourseSavePayload, SavedCourse } from "@/shared/types/course";
import type { SavedPlace } from "@/shared/types/my-page";
import { useAuthStore } from "@/store/auth-store";
import { usePlaceDetailStore } from "@/store/place-detail-store";

type MyPageView = "main" | "places" | "courses";

type SavedCourseSheetState = { kind: "closed" } | { kind: "detail"; course: SavedCourse };

export default function MyPage() {
  const { toastMessage, toastPlacement, handleSelectBottomNav, showToast } =
    useBottomNavController();
  const { handleLogout } = useLogout();
  const nicknameFromAuth = useAuthStore((s) => s.nickname);
  const { data: me } = useUserMeQuery();
  const profileNickname =
    me?.nickname?.trim() ?? (nicknameFromAuth?.trim().length ? nicknameFromAuth.trim() : "");
  const displayNickname = profileNickname.length > 0 ? profileNickname : "회원";
  const profileImageUrl = me?.profileImageUrl ?? null;

  const [view, setView] = useState<MyPageView>("main");
  const [savedCourseSheet, setSavedCourseSheet] = useState<SavedCourseSheetState>({
    kind: "closed",
  });
  const [coursesList, setCoursesList] = useState<SavedCourse[]>(() => [...seedSavedCourses]);
  const [places, setPlaces] = useState<SavedPlace[]>(initialSavedPlaces);

  const openPlaceDetail = usePlaceDetailStore((s) => s.openDetail);
  const closePlaceDetail = usePlaceDetailStore((s) => s.closeDetail);

  usePlaceDetailOpenEvent(view === "places" || view === "courses");

  const handleSavePlaceMemo = (placeId: string, memo: string) => {
    const nextMemo = memo.trim();
    setPlaces((currentPlaces) =>
      currentPlaces.map((place) =>
        place.id === placeId ? { ...place, memo: nextMemo || undefined } : place,
      ),
    );
  };

  const handleDeletePlace = (placeId: string) => {
    setPlaces((currentPlaces) => currentPlaces.filter((place) => place.id !== placeId));
    closePlaceDetail();
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

  if (view === "places") {
    return (
      <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <MySavedPlacesPage
          places={places}
          onBack={() => {
            closePlaceDetail();
            setView("main");
          }}
          onChangePlaces={setPlaces}
          onSelectPlace={(place) => openPlaceDetail(place.id)}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 [&>*]:pointer-events-auto">
          <BottomNavToast message={toastMessage} placement={toastPlacement} />
          <BottomNavigationBar activeId="mypage" onSelect={handleSelectBottomNav} />
        </div>
        <PlaceDetailSheet
          savedPlaces={places}
          onSaveMemo={handleSavePlaceMemo}
          onDeletePlace={handleDeletePlace}
        />
      </div>
    );
  }

  if (view === "courses") {
    return (
      <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
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
          <BottomNavigationBar activeId="mypage" onSelect={handleSelectBottomNav} />
        </div>
        <PlaceDetailSheet
          savedPlaces={places}
          onSaveMemo={handleSavePlaceMemo}
          onDeletePlace={handleDeletePlace}
        />
      </div>
    );
  }

  return (
    <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <main className="scrollbar-hide bg-background min-h-0 flex-1 overflow-y-auto pb-[max(1rem,calc(env(safe-area-inset-bottom)+5.75rem))]">
        <MyProfileHeader nickname={displayNickname} profileImageUrl={profileImageUrl} />

        <div className="px-5 pt-5">
          <MyPlaceSummaryCard
            totalCount={places.length}
            recentPlaces={places.slice(0, 2).map((place) => ({ id: place.id, name: place.name }))}
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
      </main>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 [&>*]:pointer-events-auto">
        <BottomNavToast message={toastMessage} placement={toastPlacement} />
        <BottomNavigationBar activeId="mypage" onSelect={handleSelectBottomNav} />
      </div>

      <PlaceDetailSheet
        savedPlaces={places}
        onSaveMemo={handleSavePlaceMemo}
        onDeletePlace={handleDeletePlace}
      />
    </div>
  );
}
