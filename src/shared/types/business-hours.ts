export type BusinessHoursStatus =
  | "PENDING"
  | "FETCHING"
  | "SUCCEEDED"
  | "NOT_FOUND"
  | "FAILED"
  | null;

export type WeeklyBusinessHour = {
  day: string;
  date: string | null;
  isToday: boolean;
  displayText: string;
  subTexts: string[];
};

export type BusinessHoursDisplay = {
  businessStatus: string | null;
  statusDisplayText: string | null;
  todayDisplayText: string | null;
  nextOpenAt: string | null;
  nextCloseAt: string | null;
  today: unknown | null;
  weeklyHours: WeeklyBusinessHour[];
};
