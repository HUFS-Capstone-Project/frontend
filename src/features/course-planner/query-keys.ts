export const dateCourseQueryKeys = {
  all: ["date-courses"] as const,
  sidos: (roomId: string) => [...dateCourseQueryKeys.all, "sidos", roomId] as const,
  sigungus: (roomId: string, sidoCode: string) =>
    [...dateCourseQueryKeys.all, "sidos", roomId, "sigungus", sidoCode] as const,
  roomList: (roomId: string, page: number, limit: number) =>
    [...dateCourseQueryKeys.all, "room-list", roomId, page, limit] as const,
  detail: (roomId: string, dateCourseId: string) =>
    [...dateCourseQueryKeys.all, "detail", roomId, dateCourseId] as const,
  myList: (page: number, limit: number) =>
    [...dateCourseQueryKeys.all, "my-list", page, limit] as const,
};
