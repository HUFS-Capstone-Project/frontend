export const roomQueryKeys = {
  all: ["room"] as const,
  rooms: () => [...roomQueryKeys.all, "rooms"] as const,
  roomDetail: (roomId: string) => [...roomQueryKeys.all, "detail", roomId] as const,
  links: () => [...roomQueryKeys.all, "links"] as const,
  linkStatus: (linkId: number) => [...roomQueryKeys.links(), "status", linkId] as const,
};
