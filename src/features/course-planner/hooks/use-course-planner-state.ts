import { useCallback, useMemo, useState } from "react";

import {
  type DateTimeSelection,
  getDateTimeDisplayValue,
  isEndAfterStart,
  isHmString,
} from "@/components/course-planner/course-date-time";
import {
  COURSE_DEFAULT_REGION,
  COURSE_FALLBACK_TITLE,
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

const COURSE_DEFAULT_START_TIME = "13:00";
const COURSE_DEFAULT_END_TIME = "18:00";

type CourseDraftOverride = {
  title: string;
  stops: CourseStop[];
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
  const [draftStartTime, setDraftStartTime] = useState<string | null>(COURSE_DEFAULT_START_TIME);
  const [draftEndTime, setDraftEndTime] = useState<string | null>(COURSE_DEFAULT_END_TIME);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseOverrides, setCourseOverrides] = useState<Record<string, CourseDraftOverride>>({});

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  );
  const courseTitle = useMemo(
    () =>
      selectedCourseId
        ? (courseOverrides[selectedCourseId]?.title ??
          selectedCourse?.title ??
          COURSE_FALLBACK_TITLE)
        : (courses[0]?.title ?? COURSE_FALLBACK_TITLE),
    [courseOverrides, courses, selectedCourse, selectedCourseId],
  );
  const courseStops = useMemo(
    () =>
      selectedCourseId
        ? (courseOverrides[selectedCourseId]?.stops ?? getCourseStops(selectedCourseId))
        : getCourseStops(defaultCourseId),
    [courseOverrides, defaultCourseId, getCourseStops, selectedCourseId],
  );

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
    setDraftStartTime((current) => current ?? COURSE_DEFAULT_START_TIME);
    setDraftEndTime((current) => current ?? COURSE_DEFAULT_END_TIME);
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

  const handleConfirmRegion = useCallback(
    (displayLabel?: string) => {
      setRegionValue(
        displayLabel ??
          (draftDistrict === COURSE_DEFAULT_REGION.allDistrict
            ? draftCity
            : `${draftCity} ${draftDistrict}`.trim()),
      );
      setMode("form");
    },
    [draftCity, draftDistrict],
  );

  const handleResetPlanner = useCallback(() => {
    setRegionValue("");
    setDraftCity(COURSE_DEFAULT_REGION.city);
    setDraftDistrict(COURSE_DEFAULT_REGION.district);
    setDateTimeValue(null);
    setDraftDate(null);
    setDraftStartTime(COURSE_DEFAULT_START_TIME);
    setDraftEndTime(COURSE_DEFAULT_END_TIME);
    resetCategorySelection();
    setSelectedCourseId("");
    setCourseOverrides({});
    setMode("form");
  }, [resetCategorySelection]);

  const canGenerate = regionValue.trim().length > 0;

  const handleGenerateCourse = useCallback(() => {
    if (!canGenerate) return;
    setMode("loading");
  }, [canGenerate]);

  const handleSelectCourse = useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
    setMode("detail");
  }, []);

  const handleBackToCourseResults = useCallback(() => {
    setSelectedCourseId("");
    setMode("result");
  }, []);

  const handleSaveCourse = useCallback(
    (payload: CourseSavePayload) => {
      showToast(COURSE_TOAST_TEXT.saved, COURSE_TOAST_DURATION_MS);
      if (payload.kind === "edit") {
        if (selectedCourseId) {
          setCourseOverrides((current) => ({
            ...current,
            [selectedCourseId]: {
              title: payload.title,
              stops: payload.stops,
            },
          }));
        }
        return;
      }
      handleResetPlanner();
    },
    [handleResetPlanner, selectedCourseId, showToast],
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
    dateTimeValue,
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
