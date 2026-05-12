import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MobileFixedPageShellProps = {
  children: ReactNode;
  className?: string;
};

export function MobileFixedPageShell({ children, className }: MobileFixedPageShellProps) {
  return (
    <main
      className={cn(
        "bg-background mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden",
        className,
      )}
    >
      {children}
    </main>
  );
}
