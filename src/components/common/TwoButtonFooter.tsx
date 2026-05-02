import type { ReactNode } from "react";

import {
  FLEX_DUAL_ACTION_ROW_CLASS,
  FLEX_DUAL_ACTION_SLOT_CLASS,
} from "@/components/common/action-footer-layout";
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
        "w-full min-w-0 shrink-0 bg-white px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+28px)]",
        className,
      )}
    >
      <div className={FLEX_DUAL_ACTION_ROW_CLASS}>
        <div className={FLEX_DUAL_ACTION_SLOT_CLASS}>{left}</div>
        <div className={FLEX_DUAL_ACTION_SLOT_CLASS}>{right}</div>
      </div>
    </div>
  );
}
