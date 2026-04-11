/** 방 메인 친구(방) 목록 한 행 — UI·API 경계에서 공통 사용 */
export type FriendRoomRow = {
  id: string;
  displayName: string;
  /** 방 멤버 수 */
  memberCount: number;
  placeCount: number;
  /** 상단 고정 여부 (서버 필드와 동일 의미로 유지) */
  isPinned?: boolean;
  /** 고정 시각 (ms). 고정 그룹 내 정렬에 사용 */
  pinnedAt?: number;
  /** 초대코드 (숫자 5자리 등). API 연동 시 서버 값 사용 */
  inviteCode?: string;
};
