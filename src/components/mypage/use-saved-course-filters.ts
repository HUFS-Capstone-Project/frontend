import { useCallback, useMemo, useState } from "react";

import type { SavedCourse } from "@/shared/types/course";

type CourseFilter = "all" | "room" | "date";
type FilterPopup = Exclude<CourseFilter, "all"> | null;

function filterSavedCourses({
  courses,
  selectedFilter,
  selectedRoomIds,
  selectedDate,
}: {
  courses: SavedCourse[];
  selectedFilter: CourseFilter;
  selectedRoomIds: string[];
  selectedDate: string | null;
}) {
  if (selectedFilter === "date" && selectedDate) {
    return courses.filter((course) => course.courseDateKey === selectedDate);
  }

  if (selectedFilter === "room") {
    const coursesHaveRoomLink = courses.some((course) => Boolean(course.savedFromRoomId));
    if (!coursesHaveRoomLink || selectedRoomIds.length === 0) {
      return courses;
    }

    return courses.filter(
      (course) =>
        course.savedFromRoomId != null && selectedRoomIds.includes(course.savedFromRoomId),
    );
  }

  return courses;
}

export function useSavedCourseFilters(courses: SavedCourse[]) {
  const [selectedFilter, setSelectedFilter] = useState<CourseFilter>("all");
  const [openPopup, setOpenPopup] = useState<FilterPopup>(null);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const roomChipApplied = selectedRoomIds.length > 0;
  const dateChipApplied = selectedDate !== null;
  const allChipActive = !roomChipApplied && !dateChipApplied;

  const closeFilterPopups = useCallback(() => {
    setOpenPopup(null);
    setSelectedFilter((prev) => {
      if (prev === "date" && selectedDate === null) return "all";
      if (prev === "room" && selectedRoomIds.length === 0) return "all";
      return prev;
    });
  }, [selectedDate, selectedRoomIds.length]);

  const handleSelectAll = useCallback(() => {
    setSelectedFilter("all");
    setOpenPopup(null);
    setSelectedRoomIds([]);
    setSelectedDate(null);
  }, []);

  const toggleRoomFilterPopup = useCallback(() => {
    setSelectedFilter("room");
    setOpenPopup((current) => (current === "room" ? null : "room"));
  }, []);

  const toggleDateFilterPopup = useCallback(() => {
    setSelectedFilter("date");
    setOpenPopup((current) => (current === "date" ? null : "date"));
  }, []);

  const handleToggleRoom = useCallback(
    (roomId: string) => {
      const nextIds = selectedRoomIds.includes(roomId)
        ? selectedRoomIds.filter((item) => item !== roomId)
        : [...selectedRoomIds, roomId];
      setSelectedRoomIds(nextIds);
      setSelectedFilter(nextIds.length === 0 ? "all" : "room");
    },
    [selectedRoomIds],
  );

  const handlePickCalendarDate = useCallback(
    (dateStr: string) => {
      if (selectedDate === dateStr) {
        setSelectedDate(null);
        setSelectedFilter("all");
        setOpenPopup(null);
        return;
      }

      setSelectedFilter("date");
      setSelectedDate(dateStr);
      setOpenPopup(null);
    },
    [selectedDate],
  );

  const visibleCourses = useMemo(
    () =>
      filterSavedCourses({
        courses,
        selectedFilter,
        selectedRoomIds,
        selectedDate,
      }),
    [courses, selectedDate, selectedFilter, selectedRoomIds],
  );

  return {
    openPopup,
    selectedRoomIds,
    selectedDate,
    roomChipApplied,
    dateChipApplied,
    allChipActive,
    visibleCourses,
    closeFilterPopups,
    handleSelectAll,
    handleToggleRoom,
    handlePickCalendarDate,
    toggleRoomFilterPopup,
    toggleDateFilterPopup,
  };
}
