import type { PlaceBusinessHourRow, ResolvedPlaceBusinessHours } from "@/shared/types/map-home";

import type { RoomPlace, RoomPlaceBusinessHoursDailyHour } from "../types/room-place.types";

const BUSINESS_HOURS_SUCCESS_STATUSES = new Set(["SUCCEEDED", "SUCCESS"]);
const KOREA_TIME_ZONE = "Asia/Seoul";
const KOREAN_DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const WEEKDAY_LABELS: Record<string, string> = {
  일: "일요일",
  월: "월요일",
  화: "화요일",
  수: "수요일",
  목: "목요일",
  금: "금요일",
  토: "토요일",
};
const DEFAULT_CLOSING_SOON_MINUTES = 60;

export function getBusinessHoursText(place: RoomPlace): string | null {
  if (!BUSINESS_HOURS_SUCCESS_STATUSES.has(place.businessHoursStatus ?? "")) {
    return null;
  }

  const [firstDailyHour] = getDisplayableDailyHours(place);
  return firstDailyHour ? formatDailyHourText(firstDailyHour) : null;
}

export function getResolvedRoomPlaceBusinessHours(
  place: RoomPlace,
): ResolvedPlaceBusinessHours | null {
  const text = getBusinessHoursText(place);
  if (!text) {
    return null;
  }

  const dailyHours = getDisplayableDailyHours(place);
  if (dailyHours.length > 0) {
    return resolveDailyHours(dailyHours);
  }

  return {
    status: text,
    openTime: null,
    holidayNotice: null,
    weeklyHours: [],
  };
}

function getDisplayableDailyHours(place: RoomPlace): RoomPlaceBusinessHoursDailyHour[] {
  const dailyHours = place.businessHours?.daily_hours;
  if (!Array.isArray(dailyHours)) {
    return [];
  }

  return dailyHours.filter((row) => formatDailyHourText(row) != null);
}

function toBusinessHourRow(row: RoomPlaceBusinessHoursDailyHour): PlaceBusinessHourRow {
  const label = formatDailyHourLabel(row);

  return {
    label,
    hours: formatDailyHourHours(row) ?? "",
    isToday: isTodayDailyHour(row),
  };
}

function formatDailyHourText(row: RoomPlaceBusinessHoursDailyHour): string | null {
  const label = formatDailyHourLabel(row);
  const hours = formatDailyHourHours(row);

  if (!hours) {
    return null;
  }

  return label ? `${label} ${hours}` : hours;
}

function formatDailyHourLabel(row: RoomPlaceBusinessHoursDailyHour): string {
  const day = normalizeText(row.day);
  const date = normalizeText(row.date);

  if (day && date) {
    return `${day}(${date})`;
  }

  return day ?? date ?? "";
}

function formatDailyHourHours(row: RoomPlaceBusinessHoursDailyHour): string | null {
  const raw = normalizeText(row.raw);
  if (raw) {
    return raw;
  }

  const open = normalizeText(row.open);
  const close = normalizeText(row.close);
  if (open && close) {
    return `${open} ~ ${close}`;
  }

  return open ?? close ?? null;
}

function normalizeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function resolveDailyHours(
  dailyHours: RoomPlaceBusinessHoursDailyHour[],
): ResolvedPlaceBusinessHours {
  const weeklyHours = dailyHours.map(toBusinessHourRow);
  const todayRow =
    dailyHours.find((row) => isTodayDailyHour(row)) ?? dailyHours.find((row) => hasOpenClose(row));
  const holidayNotice = formatHolidayNotice(dailyHours);

  if (!todayRow || !hasOpenClose(todayRow)) {
    return {
      status: "휴무",
      openTime: null,
      holidayNotice,
      weeklyHours,
    };
  }

  return {
    ...resolveOpenStatus(todayRow),
    holidayNotice,
    weeklyHours,
  };
}

function resolveOpenStatus(
  row: RoomPlaceBusinessHoursDailyHour,
): Pick<ResolvedPlaceBusinessHours, "status" | "openTime"> {
  const open = normalizeText(row.open);
  const close = normalizeText(row.close);
  if (!open || !close) {
    return { status: "휴무", openTime: null };
  }

  const nowMinutes = getKoreanMinutesOfDay(new Date());
  const openingMinutes = parseTimeToMinutes(open);
  const closingMinutes = parseTimeToMinutes(close);

  if (nowMinutes < openingMinutes) {
    return { status: "영업 전", openTime: open };
  }

  if (nowMinutes >= closingMinutes) {
    return { status: "영업 종료", openTime: null };
  }

  if (closingMinutes - nowMinutes <= DEFAULT_CLOSING_SOON_MINUTES) {
    return { status: "곧 마감", openTime: null };
  }

  return { status: "영업 중", openTime: null };
}

function formatHolidayNotice(dailyHours: RoomPlaceBusinessHoursDailyHour[]): string | null {
  const holiday = dailyHours.find((row) => !hasOpenClose(row) && formatDailyHourHours(row));
  if (!holiday) {
    return null;
  }

  const day = normalizeText(holiday.day);
  const hours = formatDailyHourHours(holiday);
  if (!hours) {
    return null;
  }

  return day ? `${WEEKDAY_LABELS[day] ?? day} ${hours}` : hours;
}

function hasOpenClose(row: RoomPlaceBusinessHoursDailyHour): boolean {
  return normalizeText(row.open) != null && normalizeText(row.close) != null;
}

function isTodayDailyHour(row: RoomPlaceBusinessHoursDailyHour): boolean {
  const parts = getKoreanDateParts(new Date());
  const todayDate = `${parts.month}/${parts.day}`;
  const date = normalizeText(row.date);
  if (date === todayDate) {
    return true;
  }

  return normalizeText(row.day) === KOREAN_DAY_LABELS[parts.dayOfWeek];
}

function getKoreanDateParts(now: Date): {
  month: number;
  day: number;
  dayOfWeek: number;
} {
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: KOREA_TIME_ZONE,
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const weekdayText = new Intl.DateTimeFormat("en-US", {
    timeZone: KOREA_TIME_ZONE,
    weekday: "short",
  }).format(now);

  return {
    month: Number(dateParts.find((part) => part.type === "month")?.value ?? "0"),
    day: Number(dateParts.find((part) => part.type === "day")?.value ?? "0"),
    dayOfWeek: weekdayToIndex(weekdayText),
  };
}

function getKoreanMinutesOfDay(now: Date): number {
  const timeParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: KOREA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const hour = Number(timeParts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(timeParts.find((part) => part.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

function weekdayToIndex(weekday: string): number {
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
