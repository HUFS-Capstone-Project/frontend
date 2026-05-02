import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type TwoButtonFooterProps = {
  left: ReactNode;
  right: ReactNode;
  className?: string;
};

export function TwoButtonFooter({ left, right, className }: TwoButtonFooterProps) {
  return (
    <div
      className={cn(
        "shrink-0 bg-white px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+28px)]",
        className,
      )}
    >
      <div className="grid grid-cols-2 gap-2.5">
        {left}
        {right}
      </div>
    </div>
  );
}
