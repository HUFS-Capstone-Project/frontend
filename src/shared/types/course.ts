export type CourseOption = {
  id: string;
  title: string;
  description: string;
};

export type CourseStop = {
  id: string;
  /** 지도 저장 장소 ID (`SAVED_PLACE_MOCKS`) — 핀 탭과 동일한 장소 정보 시트 연동 */
  placeId: string;
  name: string;
  address: string;
  category: string;
  walkingTime: string;
  hours: string;
};

export type SavedCourseStop = {
  id: string;
  name: string;
  address: string;
  walkingTime?: string;
  hours?: string;
};

export type SavedCourse = {
  id: string;
  title: string;
  executedAtLabel: string;
  badgeLabel: string;
  stops: SavedCourseStop[];
  /** 이 코스를 저장했을 때의 방 ID(API). 없으면 방 필터는 목록 데이터가 생길 때까지 전체 표시만 적용 */
  savedFromRoomId?: string | null;
};
