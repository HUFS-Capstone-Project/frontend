import { useState } from "react";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { MyAccountActions } from "@/components/mypage/MyAccountActions";
import {
  myPageUser,
  type SavedCourse,
  savedCourses,
  type SavedPlace,
  savedPlaces as initialSavedPlaces,
} from "@/components/mypage/mypage-mock-data";
import { MyPageCourseDetail } from "@/components/mypage/MyPageCourseDetail";
import { MyPlaceSummaryCard } from "@/components/mypage/MyPlaceSummaryCard";
import { MyProfileHeader } from "@/components/mypage/MyProfileHeader";
import { MySavedPlacesPage } from "@/components/mypage/MySavedPlacesPage";
import { SavedCourseListPage } from "@/components/mypage/SavedCourseListPage";
import { SavedCourseSection } from "@/components/mypage/SavedCourseSection";
import { SavedPlaceDetailPage } from "@/components/mypage/SavedPlaceDetailPage";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";

type MyPageView = "main" | "places" | "courses";

export default function MyPage() {
  const { toastMessage, toastPlacement, handleSelectBottomNav } = useBottomNavController();
  const [view, setView] = useState<MyPageView>("main");
  const [visibleCourseCount, setVisibleCourseCount] = useState(5);
  const [selectedCourse, setSelectedCourse] = useState<SavedCourse | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SavedPlace | null>(null);
  const [places, setPlaces] = useState<SavedPlace[]>(initialSavedPlaces);

  const handleShowMoreCourses = () => {
    setVisibleCourseCount((count) => Math.min(count + 5, savedCourses.length));
  };

  if (selectedCourse) {
    return (
      <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <MyPageCourseDetail course={selectedCourse} onBack={() => setSelectedCourse(null)} />
        <BottomNavToast message={toastMessage} placement={toastPlacement} />
        <BottomNavigationBar activeId="mypage" onSelect={handleSelectBottomNav} />
      </div>
    );
  }

  if (selectedPlace) {
    return (
      <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <SavedPlaceDetailPage place={selectedPlace} onBack={() => setSelectedPlace(null)} />
        <BottomNavToast message={toastMessage} placement={toastPlacement} />
        <BottomNavigationBar activeId="mypage" onSelect={handleSelectBottomNav} />
      </div>
    );
  }

  if (view === "places") {
    return (
      <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <MySavedPlacesPage places={places} onBack={() => setView("main")} onChangePlaces={setPlaces} onSelectPlace={setSelectedPlace} />
        <BottomNavToast message={toastMessage} placement={toastPlacement} />
        <BottomNavigationBar activeId="mypage" onSelect={handleSelectBottomNav} />
      </div>
    );
  }

  if (view === "courses") {
    return (
      <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <SavedCourseListPage courses={savedCourses} onBack={() => setView("main")} onSelectCourse={setSelectedCourse} />
        <BottomNavToast message={toastMessage} placement={toastPlacement} />
        <BottomNavigationBar activeId="mypage" onSelect={handleSelectBottomNav} />
      </div>
    );
  }

  return (
    <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <main className="bg-background min-h-0 flex-1 overflow-y-auto pb-28">
        <MyProfileHeader nickname={myPageUser.nickname} />

        <div className="px-5 pt-5">
          <MyPlaceSummaryCard
            totalCount={places.length}
            recentPlaces={places.slice(0, 2).map((place) => ({ id: place.id, name: place.name }))}
            onOpenPlaces={() => setView("places")}
          />

          <SavedCourseSection
            courses={savedCourses}
            visibleCount={visibleCourseCount}
            onShowMore={handleShowMoreCourses}
            onShowAll={() => setView("courses")}
            onSelectCourse={setSelectedCourse}
          />

          <MyAccountActions />
        </div>
      </main>

      <BottomNavToast message={toastMessage} placement={toastPlacement} />
      <BottomNavigationBar activeId="mypage" onSelect={handleSelectBottomNav} />
    </div>
  );
}
