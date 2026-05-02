export type DateTimeSelection = {
  date: string;
  weekday: string;
  startTime: string | null;
  endTime: string | null;
};

/** 30분 단위 HH:mm (00:00 ~ 23:30). 숫자 `0`(자정)은 falsy로 오인되므로 여기서만 인정합니다. */
const HM_REGEX = /^([01]\d|2[0-3]):[03]0$/;

export function isHmString(value: unknown): value is string {
  return typeof value === "string" && HM_REGEX.test(value.trim());
}

export function hmToMinutes(value: string): number {
  const [h, m] = value.trim().split(":").map(Number);
  return h * 60 + m;
}

/** 같은 날 기준으로 종료 시각이 시작보다 뒤인지 (동일 시각은 불가). */
export function isEndAfterStart(start: string, end: string): boolean {
  if (!isHmString(start) || !isHmString(end)) return false;
  return hmToMinutes(end) > hmToMinutes(start);
}

export function getDateTimeDisplayValue(selection: DateTimeSelection | null) {
  if (!selection) return "";
  const startOk = isHmString(selection.startTime);
  const endOk = isHmString(selection.endTime);
  if (!startOk || !endOk) {
    return `${selection.date} ${selection.weekday}요일`;
  }
  return `${selection.date} ${selection.weekday}요일 ${selection.startTime} ~ ${selection.endTime}`;
}
