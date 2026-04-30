import type { ReactNode } from "react";

import { BottomSheet } from "@/components/ui/BottomSheet";

type CoursePlannerBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function CoursePlannerBottomSheet({
  open,
  onClose,
  children,
}: CoursePlannerBottomSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      panelClassName="max-h-[calc(100dvh-2rem)]"
      contentClassName="pb-[max(2rem,env(safe-area-inset-bottom))]"
      enableHistory={false}
    >
      {children}
    </BottomSheet>
  );
}
