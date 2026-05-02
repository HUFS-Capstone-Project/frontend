import { useCallback, useEffect, useState } from "react";

import {
  type DateTimeSelection,
  getDateTimeDisplayValue,
  isEndAfterStart,
  isHmString,
} from "@/components/course-planner/course-date-time";
import {
  COURSE_DEFAULT_REGION,
  COURSE_FALLBACK_TITLE,
  COURSE_GENERATION_DELAY_MS,
  COURSE_TOAST_DURATION_MS,
  COURSE_TOAST_TEXT,
  type CoursePlannerMode,
} from "@/features/course-planner/constants";
import type { CourseOption, CourseSavePayload, CourseStop } from "@/shared/types/course";

type UseCoursePlannerStateParams = {
  courses: CourseOption[];
  defaultCourseId: string | null;
  getCourseStops: (courseId: string | null) => CourseStop[];
  closeTagPanel: () => void;
  resetCategorySelection: () => void;
  showToast: (message: string, durationMs?: number) => void;
};

export function useCoursePlannerState({
  courses,
  defaultCourseId,
  getCourseStops,
  closeTagPanel,
  resetCategorySelection,
  showToast,
}: UseCoursePlannerStateParams) {
  const [mode, setMode] = useState<CoursePlannerMode>("form");
  const [regionValue, setRegionValue] = useState("");
  const [draftCity, setDraftCity] = useState<string>(COURSE_DEFAULT_REGION.city);
  const [draftDistrict, setDraftDistrict] = useState<string>(COURSE_DEFAULT_REGION.district);
  const [dateTimeValue, setDateTimeValue] = useState<DateTimeSelection | null>(null);
  const [draftDate, setDraftDate] = useState<string | null>(null);
  const [draftStartTime, setDraftStartTime] = useState<string | null>(null);
  const [draftEndTime, setDraftEndTime] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseTitle, setCourseTitle] = useState(courses[0]?.title ?? COURSE_FALLBACK_TITLE);
  const [courseStops, setCourseStops] = useState<CourseStop[]>(() =>
    getCourseStops(defaultCourseId),
  );

  useEffect(() => {
    if (mode !== "loading") return;

    const timerId = window.setTimeout(() => {
      showToast(COURSE_TOAST_TEXT.generated, COURSE_TOAST_DURATION_MS);
      setSelectedCourseId("");
      setMode("result");
    }, COURSE_GENERATION_DELAY_MS);

    return () => window.clearTimeout(timerId);
  }, [mode, showToast]);

  const applyDateTimeFromDrafts = useCallback(() => {
    if (!draftDate) {
      setDateTimeValue(null);
      return;
    }

    const weekday = new Date(draftDate.replaceAll(".", "/"))
      .toLocaleDateString("ko-KR", { weekday: "short" })
      .replace("요일", "");

    setDateTimeValue({
      date: draftDate,
      weekday,
      startTime: draftStartTime,
      endTime: draftEndTime,
    });
  }, [draftDate, draftEndTime, draftStartTime]);

  const handleOpenDateTimeSelect = useCallback(() => {
    closeTagPanel();
    setMode("datetime");
  }, [closeTagPanel]);

  const handleCloseDateTimeScreen = useCallback(() => {
    setMode("form");
  }, []);

  const handleConfirmDateTime = useCallback(() => {
    if (
      !draftDate ||
      !isHmString(draftStartTime) ||
      !isHmString(draftEndTime) ||
      !isEndAfterStart(draftStartTime, draftEndTime)
    ) {
      return;
    }

    applyDateTimeFromDrafts();
    setMode("form");
  }, [applyDateTimeFromDrafts, draftDate, draftEndTime, draftStartTime]);

  const handleSelectCity = useCallback((city: string) => {
    setDraftCity(city);
    setDraftDistrict(COURSE_DEFAULT_REGION.allDistrict);
  }, []);

  const handleConfirmRegion = useCallback(() => {
    setRegionValue(
      draftDistrict === COURSE_DEFAULT_REGION.allDistrict
        ? draftCity
        : `${draftCity} ${draftDistrict}`,
    );
    setMode("form");
  }, [draftCity, draftDistrict]);

  const handleResetPlanner = useCallback(() => {
    setRegionValue("");
    setDraftCity(COURSE_DEFAULT_REGION.city);
    setDraftDistrict(COURSE_DEFAULT_REGION.district);
    setDateTimeValue(null);
    setDraftDate(null);
    setDraftStartTime(null);
    setDraftEndTime(null);
    resetCategorySelection();
    setSelectedCourseId("");
    setCourseTitle(courses[0]?.title ?? COURSE_FALLBACK_TITLE);
    setCourseStops(getCourseStops(defaultCourseId));
    setMode("form");
  }, [courses, defaultCourseId, getCourseStops, resetCategorySelection]);

  const canGenerate = regionValue.trim().length > 0;

  const handleGenerateCourse = useCallback(() => {
    if (!canGenerate) return;
    setMode("loading");
  }, [canGenerate]);

  const handleSelectCourse = useCallback(
    (courseId: string) => {
      const selectedCourse = courses.find((course) => course.id === courseId);
      setSelectedCourseId(courseId);
      setCourseTitle(selectedCourse?.title ?? COURSE_FALLBACK_TITLE);
      setCourseStops(getCourseStops(courseId));
      setMode("detail");
    },
    [courses, getCourseStops],
  );

  const handleBackToCourseResults = useCallback(() => {
    setSelectedCourseId("");
    setMode("result");
  }, []);

  const handleSaveCourse = useCallback(
    (payload: CourseSavePayload) => {
      showToast(COURSE_TOAST_TEXT.saved, COURSE_TOAST_DURATION_MS);
      if (payload.kind === "edit") {
        setCourseTitle(payload.title);
        setCourseStops(payload.stops);
        return;
      }
      handleResetPlanner();
    },
    [handleResetPlanner, showToast],
  );

  return {
    mode,
    regionValue,
    draftCity,
    draftDistrict,
    draftDate,
    draftStartTime,
    draftEndTime,
    selectedCourseId,
    courseTitle,
    courseStops,
    dateTimeDisplayValue: getDateTimeDisplayValue(dateTimeValue),
    canGenerate,
    setMode,
    setDraftDistrict,
    setDraftDate,
    setDraftStartTime,
    setDraftEndTime,
    handleOpenDateTimeSelect,
    handleCloseDateTimeScreen,
    handleConfirmDateTime,
    handleSelectCity,
    handleConfirmRegion,
    handleResetPlanner,
    handleGenerateCourse,
    handleSelectCourse,
    handleBackToCourseResults,
    handleSaveCourse,
  };
}
