import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { appQueryClient } from "@/shared/lib/query-client";

type QueryProviderProps = {
  children: ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  return <QueryClientProvider client={appQueryClient}>{children}</QueryClientProvider>;
}
