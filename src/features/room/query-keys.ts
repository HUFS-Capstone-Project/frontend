export const roomQueryKeys = {
  all: ["room"] as const,
  rooms: () => [...roomQueryKeys.all, "rooms"] as const,
  roomDetail: (roomId: string) => [...roomQueryKeys.all, "detail", roomId] as const,
};
