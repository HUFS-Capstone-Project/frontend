import { useCallback, useMemo, useState } from "react";

import type { SavedCourse } from "@/shared/types/course";

type CourseFilter = "all" | "member" | "date";
type FilterPopup = Exclude<CourseFilter, "all"> | null;

export type MemberFilterOption = {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
};

function getMemberOptions(courses: SavedCourse[]): MemberFilterOption[] {
  const byId = new Map<string, MemberFilterOption>();

  for (const course of courses) {
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
}

function filterCourses({
  courses,
  selectedMemberIds,
  selectedDate,
}: {
  courses: SavedCourse[];
  selectedMemberIds: string[];
  selectedDate: string | null;
}) {
  return courses.filter((course) => {
    const matchesMember =
      selectedMemberIds.length === 0 ||
      (course.savedByUserId != null && selectedMemberIds.includes(String(course.savedByUserId)));
    const matchesDate = selectedDate == null || course.courseDateKey === selectedDate;

    return matchesMember && matchesDate;
  });
}

export function useRoomSavedCourseFilters(courses: SavedCourse[]) {
  const [, setSelectedFilter] = useState<CourseFilter>("all");
  const [openPopup, setOpenPopup] = useState<FilterPopup>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const memberChipApplied = selectedMemberIds.length > 0;
  const dateChipApplied = selectedDate !== null;
  const allChipActive = !memberChipApplied && !dateChipApplied;

  const closeFilterPopups = useCallback(() => {
    setOpenPopup(null);
    setSelectedFilter((prev) => {
      if (prev === "date" && selectedDate === null) return "all";
      if (prev === "member" && selectedMemberIds.length === 0) return "all";
      return prev;
    });
  }, [selectedDate, selectedMemberIds.length]);

  const memberOptions = useMemo(() => getMemberOptions(courses), [courses]);

  const visibleCourses = useMemo(
    () =>
      filterCourses({
        courses,
        selectedMemberIds,
        selectedDate,
      }),
    [courses, selectedDate, selectedMemberIds],
  );

  const handleSelectAll = useCallback(() => {
    setSelectedFilter("all");
    setOpenPopup(null);
    setSelectedMemberIds([]);
    setSelectedDate(null);
  }, []);

  const toggleMemberFilterPopup = useCallback(() => {
    setSelectedFilter("member");
    setOpenPopup((current) => (current === "member" ? null : "member"));
  }, []);

  const toggleDateFilterPopup = useCallback(() => {
    setSelectedFilter("date");
    setOpenPopup((current) => (current === "date" ? null : "date"));
  }, []);

  const handleToggleMember = useCallback(
    (memberId: string) => {
      setSelectedMemberIds((current) => {
        const nextIds = current.includes(memberId)
          ? current.filter((item) => item !== memberId)
          : [...current, memberId];
        setSelectedFilter(nextIds.length === 0 && selectedDate == null ? "all" : "member");
        return nextIds;
      });
    },
    [selectedDate],
  );

  const handlePickCalendarDate = useCallback(
    (date: string) => {
      if (selectedDate === date) {
        setSelectedDate(null);
        setSelectedFilter("all");
        setOpenPopup(null);
        return;
      }

      setSelectedFilter("date");
      setSelectedDate(date);
      setOpenPopup(null);
    },
    [selectedDate],
  );

  return {
    openPopup,
    selectedMemberIds,
    selectedDate,
    memberOptions,
    memberChipApplied,
    dateChipApplied,
    allChipActive,
    visibleCourses,
    closeFilterPopups,
    handleSelectAll,
    handleToggleMember,
    handlePickCalendarDate,
    toggleMemberFilterPopup,
    toggleDateFilterPopup,
  };
}
