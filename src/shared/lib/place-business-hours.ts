import { useEffect, useState } from "react";

import type {
  PlaceBusinessHourRow,
  PlaceBusinessHours,
  ResolvedPlaceBusinessHours,
  ResolvedSavedPlace,
  SavedPlace,
} from "@/shared/types/map-home";

const KOREA_TIME_ZONE = "Asia/Seoul";
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const DEFAULT_CLOSING_SOON_MINUTES = 60;

type KoreaNowParts = {
  year: number;
  month: number;
  day: number;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  minutesOfDay: number;
};

function getKoreanNowParts(now: Date): KoreaNowParts {
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: KOREA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const timeParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: KOREA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const weekdayText = new Intl.DateTimeFormat("en-US", {
    timeZone: KOREA_TIME_ZONE,
    weekday: "short",
  }).format(now);

  const year = Number(dateParts.find((part) => part.type === "year")?.value ?? "0");
  const month = Number(dateParts.find((part) => part.type === "month")?.value ?? "0");
  const day = Number(dateParts.find((part) => part.type === "day")?.value ?? "0");
  const hour = Number(timeParts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(timeParts.find((part) => part.type === "minute")?.value ?? "0");

  return {
    year,
    month,
    day,
    dayOfWeek: weekdayToIndex(weekdayText),
    minutesOfDay: hour * 60 + minute,
  };
}

function weekdayToIndex(weekday: string): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  switch (weekday) {
    case "Sun":
      return 0;
    case "Mon":
      return 1;
    case "Tue":
      return 2;
    case "Wed":
      return 3;
    case "Thu":
      return 4;
    case "Fri":
      return 5;
    case "Sat":
      return 6;
    default:
      return 0;
  }
}

function parseTimeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function buildTodayLabel(parts: KoreaNowParts): string {
  return `${DAY_LABELS[parts.dayOfWeek]}(${parts.month}/${parts.day})`;
}

function buildWeeklyHours(
  businessHours: PlaceBusinessHours,
  parts: KoreaNowParts,
): PlaceBusinessHourRow[] {
  return businessHours.weeklySchedule.map((row) => {
    const isToday = row.dayOfWeek === parts.dayOfWeek;
    const label = isToday ? buildTodayLabel(parts) : DAY_LABELS[row.dayOfWeek];
    const hours = row.openTime && row.closeTime ? `${row.openTime} ~ ${row.closeTime}` : "휴무";

    return {
      label,
      hours,
      isToday,
    };
  });
}

function isPlaceBusinessHoursSource(
  businessHours: PlaceBusinessHours | ResolvedPlaceBusinessHours | null | undefined,
): businessHours is PlaceBusinessHours {
  return Array.isArray((businessHours as PlaceBusinessHours | undefined)?.weeklySchedule);
}

export function resolvePlaceBusinessHours(
  businessHours: PlaceBusinessHours | ResolvedPlaceBusinessHours | null | undefined,
  now: Date,
): ResolvedPlaceBusinessHours | null {
  if (!businessHours) {
    return null;
  }

  if (!isPlaceBusinessHoursSource(businessHours)) {
    return businessHours;
  }

  const parts = getKoreanNowParts(now);
  const todaySchedule = businessHours.weeklySchedule.find(
    (row) => row.dayOfWeek === parts.dayOfWeek,
  );
  const weeklyHours = buildWeeklyHours(businessHours, parts);

  if (!todaySchedule || !todaySchedule.openTime || !todaySchedule.closeTime) {
    return {
      status: "휴무",
      openTime: null,
      holidayNotice: businessHours.holidayNotice,
      weeklyHours,
    };
  }

  const openingMinutes = parseTimeToMinutes(todaySchedule.openTime);
  const closingMinutes = parseTimeToMinutes(todaySchedule.closeTime);
  const closingSoonMinutes = businessHours.closingSoonMinutes ?? DEFAULT_CLOSING_SOON_MINUTES;

  if (parts.minutesOfDay < openingMinutes) {
    return {
      status: "영업 전",
      openTime: todaySchedule.openTime,
      holidayNotice: businessHours.holidayNotice,
      weeklyHours,
    };
  }

  if (parts.minutesOfDay >= closingMinutes) {
    return {
      status: "영업 종료",
      openTime: null,
      holidayNotice: businessHours.holidayNotice,
      weeklyHours,
    };
  }

  if (closingMinutes - parts.minutesOfDay <= closingSoonMinutes) {
    return {
      status: "곧 마감",
      openTime: null,
      holidayNotice: businessHours.holidayNotice,
      weeklyHours,
    };
  }

  return {
    status: "영업 중",
    openTime: null,
    holidayNotice: businessHours.holidayNotice,
    weeklyHours,
  };
}

export function resolveSavedPlacesBusinessHours(
  places: SavedPlace[],
  now: Date,
): ResolvedSavedPlace[] {
  return places.map((place) => ({
    ...place,
    businessHours: resolvePlaceBusinessHours(place.businessHours, now),
  }));
}

export function useKoreanNow(tickMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, tickMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [tickMs]);

  return now;
}
