export type CourseOption = {
  id: string;
  title: string;
  description: string;
  mode?: string;
  startDateTime?: string;
  endDateTime?: string;
};

export type CourseStop = {
  /** React key; equals `String(roomPlaceId)` for API-backed stops */
  id: string;
  roomPlaceId: number;
  name: string;
  address: string;
  category: string;
  categoryName?: string | null;
  tagCode?: string | null;
  tagName?: string | null;
  sequenceOrder?: number;
  latitude?: number | null;
  longitude?: number | null;
  walkingTime?: string;
  hours?: string;
};

export type CourseSavePayload = {
  kind: "create" | "edit";
  title: string;
  stops: CourseStop[];
};

export type SavedCourseStop = {
  id: string;
  roomPlaceId?: number;
  name: string;
  address: string;
  category?: string;
  categoryName?: string | null;
  tagCode?: string | null;
  tagName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  walkingTime?: string;
  hours?: string;
};

export type SavedCourse = {
  id: string;
  title: string;
  executedAtLabel: string;
  badgeLabel: string;
  stops: SavedCourseStop[];
  savedByUserId?: number | string | null;
  savedByNickname?: string | null;
  savedByProfileImageUrl?: string | null;
  savedAt?: string | null;
  /** 이 코스를 저장했을 때의 방 public id — 방 필터용 */
  savedFromRoomId?: string | null;
  /** 코스 시작일 (`yyyy.MM.dd`) — 날짜 필터용 */
  courseDateKey?: string | null;
};
