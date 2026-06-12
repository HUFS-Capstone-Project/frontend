import type { ReactNode } from "react";

import { BottomSheet } from "@/components/ui/BottomSheet";

type CoursePlannerBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  panelClassName?: string;
  contentClassName?: string;
  onHandleClick?: () => void;
  onDragDismiss?: () => void;
};

export function CoursePlannerBottomSheet({
  open,
  onClose,
  children,
  className,
  overlayClassName,
  panelClassName,
  contentClassName,
  onHandleClick,
  onDragDismiss,
}: CoursePlannerBottomSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      className={className}
      overlayClassName={overlayClassName}
      panelClassName={panelClassName}
      contentClassName={contentClassName}
      onHandleClick={onHandleClick}
      onDragDismiss={onDragDismiss}
      intrinsicPanelHeight
      enableHistory={false}
    >
      {children}
    </BottomSheet>
  );
}
