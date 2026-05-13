export const roomQueryKeys = {
  all: ["room"] as const,
  rooms: (keyword?: string) => {
    const trimmedKeyword = keyword?.trim();
    return trimmedKeyword && trimmedKeyword.length > 0
      ? ([...roomQueryKeys.all, "rooms", { keyword: trimmedKeyword }] as const)
      : ([...roomQueryKeys.all, "rooms"] as const);
  },
  roomDetail: (roomId: string) => [...roomQueryKeys.all, "detail", roomId] as const,
};
