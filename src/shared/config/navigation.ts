import { APP_ROUTES } from "./routes";

export type BottomNavId = "list" | "room" | "map" | "course" | "mypage";

export const BOTTOM_NAV_ROUTE_BY_ID: Record<BottomNavId, string> = {
  list: APP_ROUTES.list,
  room: APP_ROUTES.room,
  map: APP_ROUTES.map,
  course: APP_ROUTES.course,
  mypage: APP_ROUTES.mypage,
};

export const ROOM_SCOPED_BOTTOM_NAV_IDS = [
  "list",
  "map",
  "course",
] as const satisfies readonly BottomNavId[];

export function isRoomScopedBottomNav(id: BottomNavId): boolean {
  return ROOM_SCOPED_BOTTOM_NAV_IDS.includes(id as (typeof ROOM_SCOPED_BOTTOM_NAV_IDS)[number]);
}
