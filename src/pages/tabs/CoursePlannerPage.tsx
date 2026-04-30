import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { CourseEditPanel } from "@/components/course-planner/CourseEditPanel";
import { CourseGenerationLoadingPanel } from "@/components/course-planner/CourseGenerationLoadingPanel";
import {
  CoursePlaceInfoPanel,
  type CourseStop,
} from "@/components/course-planner/CoursePlaceInfoPanel";
import { CoursePlannerMapPreview } from "@/components/course-planner/CoursePlannerMapPreview";
import {
  CoursePlannerPanel,
  type PlaceTypeId,
} from "@/components/course-planner/CoursePlannerPanel";
import {
  type CourseOption,
  CourseResultPanel,
} from "@/components/course-planner/CourseResultPanel";
import {
  type DateTimeSelection,
  DateTimeSelectionPanel,
  getDateTimeDisplayValue,
} from "@/components/course-planner/DateTimeSelectionPanel";
import { RegionSelectionPanel } from "@/components/course-planner/RegionSelectionPanel";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { useRoomSelectionStore } from "@/store/room-selection-store";

type CoursePlannerMode = "form" | "region" | "datetime" | "loading" | "result" | "detail" | "edit";

const mockCourses: CourseOption[] = [
  { id: "course-1", title: "코스 1", description: "캠퍼스 산책부터 감동까지" },
  { id: "course-2", title: "코스 2", description: "카페와 전시를 가볍게" },
  { id: "course-3", title: "코스 3", description: "저녁까지 이어지는 여유 코스" },
];

const mockStops: CourseStop[] = [
  {
    id: "hufs-seoul",
    name: "한국외국어대학교 서울캠퍼스",
    address: "서울 동대문구 이문로 107",
    category: "대학 · 캠퍼스",
    walkingTime: "도보 10분",
    hours: "10:40 ~ 19:30",
  },
  {
    id: "gangneung",
    name: "감동",
    address: "회기로 25길 10-13 1층",
    category: "맛집",
    walkingTime: "도보 8분",
    hours: "11:30 ~ 21:00",
  },
  {
    id: "oegwan-street",
    name: "사르스트 외대점",
    address: "회기로 23길 2",
    category: "카페",
    walkingTime: "도보 7분",
    hours: "12:00 ~ 22:00",
  },
];

type CoursePlannerPageProps = {
  skipRoomGuard?: boolean;
};

export default function CoursePlannerPage({ skipRoomGuard = false }: CoursePlannerPageProps) {
  const selectedRoom = useRoomSelectionStore((s) => s.selectedRoom);
  const { toastMessage, handleSelectBottomNav } = useBottomNavController();
  const [mode, setMode] = useState<CoursePlannerMode>("form");
  const [regionValue, setRegionValue] = useState("");
  const [draftCity, setDraftCity] = useState("서울");
  const [draftDistrict, setDraftDistrict] = useState("강남구");
  const [dateTimeValue, setDateTimeValue] = useState<DateTimeSelection | null>(null);
  const [draftDate, setDraftDate] = useState("2026.04.20");
  const [draftStartTime, setDraftStartTime] = useState<string | null>("13:00");
  const [draftEndTime, setDraftEndTime] = useState<string | null>("21:00");
  const [selectedPlaceTypeIds, setSelectedPlaceTypeIds] = useState<PlaceTypeId[]>(["restaurant"]);
  const [selectedCourseId, setSelectedCourseId] = useState(mockCourses[0]?.id ?? "");
  const [courseTitle, setCourseTitle] = useState(mockCourses[0]?.title ?? "코스 1");
  const [courseStops, setCourseStops] = useState<CourseStop[]>(mockStops);
  const [completionNoticeVisible, setCompletionNoticeVisible] = useState(false);

  useEffect(() => {
    if (mode !== "loading") return;

    const timerId = window.setTimeout(() => {
      setCompletionNoticeVisible(true);
      setMode("result");
    }, 900);

    return () => window.clearTimeout(timerId);
  }, [mode]);

  useEffect(() => {
    if (!completionNoticeVisible) return;

    const timerId = window.setTimeout(() => {
      setCompletionNoticeVisible(false);
    }, 5000);

    return () => window.clearTimeout(timerId);
  }, [completionNoticeVisible]);

  if (!skipRoomGuard && !selectedRoom) {
    return <Navigate to="/room" replace />;
  }

  const canGenerate = regionValue.trim().length > 0 && selectedPlaceTypeIds.length > 0;

  const handleSelectCity = (city: string) => {
    setDraftCity(city);
    setDraftDistrict("전체");
  };

  const handleConfirmRegion = () => {
    setRegionValue(draftDistrict === "전체" ? draftCity : `${draftCity} ${draftDistrict}`);
    setMode("form");
  };

  const handleConfirmDateTime = () => {
    const weekday = new Date(draftDate.replaceAll(".", "/"))
      .toLocaleDateString("ko-KR", { weekday: "short" })
      .replace("요일", "");

    setDateTimeValue({
      date: draftDate,
      weekday,
      startTime: draftStartTime,
      endTime: draftEndTime,
    });
    setMode("form");
  };

  const handleTogglePlaceType = (placeTypeId: PlaceTypeId) => {
    setSelectedPlaceTypeIds((current) => {
      if (current.includes(placeTypeId)) {
        return current.filter((id) => id !== placeTypeId);
      }
      return [...current, placeTypeId];
    });
  };

  const handleResetPlanner = () => {
    setRegionValue("");
    setDraftCity("서울");
    setDraftDistrict("강남구");
    setDateTimeValue(null);
    setDraftDate("2026.04.20");
    setDraftStartTime("13:00");
    setDraftEndTime("21:00");
    setSelectedPlaceTypeIds(["restaurant"]);
    setCompletionNoticeVisible(false);
    setMode("form");
  };

  const handleGenerateCourse = () => {
    if (!canGenerate) return;
    setMode("loading");
  };

  const handleSelectCourse = (courseId: string) => {
    const selectedCourse = mockCourses.find((course) => course.id === courseId);
    setSelectedCourseId(courseId);
    setCourseTitle(selectedCourse?.title ?? "코스 1");
    setCourseStops(mockStops);
    setMode("detail");
  };

  const handleSaveCourseEdit = (nextTitle: string, nextStops: CourseStop[]) => {
    setCourseTitle(nextTitle);
    setCourseStops(nextStops);
    setCompletionNoticeVisible(true);
    setMode("detail");
  };

  const handleMapClick = () => {
    if (mode === "detail" || mode === "edit") {
      setMode("detail");
    }
  };

  const statusMessage = completionNoticeVisible ? "데이트코스가 완성되었습니다" : undefined;

  return (
    <div className="-m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <main className="bg-background min-h-0 flex-1 overflow-y-auto pb-24">
        <CoursePlannerMapPreview statusMessage={statusMessage} onMapClick={handleMapClick} />

        {mode === "region" ? (
          <RegionSelectionPanel
            selectedCity={draftCity}
            selectedDistrict={draftDistrict}
            onSelectCity={handleSelectCity}
            onSelectDistrict={setDraftDistrict}
            onClose={() => setMode("form")}
            onConfirm={handleConfirmRegion}
          />
        ) : null}

        {mode === "datetime" ? (
          <DateTimeSelectionPanel
            selectedDate={draftDate}
            selectedStartTime={draftStartTime}
            selectedEndTime={draftEndTime}
            onSelectDate={setDraftDate}
            onSelectStartTime={setDraftStartTime}
            onSelectEndTime={setDraftEndTime}
            onClose={() => setMode("form")}
            onConfirm={handleConfirmDateTime}
          />
        ) : null}

        {mode === "form" ? (
          <CoursePlannerPanel
            regionValue={regionValue}
            dateTimeValue={getDateTimeDisplayValue(dateTimeValue)}
            selectedPlaceTypeIds={selectedPlaceTypeIds}
            canGenerate={canGenerate}
            onOpenRegionSelect={() => setMode("region")}
            onOpenDateTimeSelect={() => setMode("datetime")}
            onTogglePlaceType={handleTogglePlaceType}
            onGenerate={handleGenerateCourse}
            onReset={handleResetPlanner}
          />
        ) : null}

        {mode === "loading" ? <CourseGenerationLoadingPanel /> : null}

        {mode === "result" ? (
          <CourseResultPanel
            courses={mockCourses}
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
          />
        ) : null}

        {mode === "detail" ? (
          <CoursePlaceInfoPanel
            courseTitle={courseTitle}
            stops={courseStops}
            onBack={() => setMode("result")}
            onEdit={() => setMode("edit")}
          />
        ) : null}

        {mode === "edit" ? (
          <CourseEditPanel
            title={courseTitle}
            stops={courseStops}
            onBack={() => setMode("detail")}
            onSave={handleSaveCourseEdit}
          />
        ) : null}
      </main>

      <BottomNavToast message={toastMessage} />
      <BottomNavigationBar activeId="course" onSelect={handleSelectBottomNav} />
    </div>
  );
}
