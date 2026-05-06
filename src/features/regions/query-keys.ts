export const regionQueryKeys = {
  all: ["regions"] as const,
  sidos: () => [...regionQueryKeys.all, "sidos"] as const,
  sigungus: (sidoCode: string) => [...regionQueryKeys.all, "sidos", sidoCode, "sigungus"] as const,
};
