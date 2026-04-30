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
    <BottomSheet open={open} onClose={onClose} intrinsicPanelHeight enableHistory={false}>
      {children}
    </BottomSheet>
  );
}
