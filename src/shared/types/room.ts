/** 방 메인 친구(방) 목록 한 행 — UI·API 경계에서 공통 사용 */
export type FriendRoomRow = {
  id: string;
  displayName: string;
  /** 방 멤버 수 */
  memberCount: number;
  placeCount: number;
  /** 즐겨찾기 초기값 */
  liked: boolean;
};
