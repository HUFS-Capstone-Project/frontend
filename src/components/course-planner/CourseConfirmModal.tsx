import { createPortal } from "react-dom";

import { RoomModalShell } from "@/components/room/RoomModalShell";
import { useOverlayFlowController } from "@/features/room/hooks";
import { cn } from "@/lib/utils";

type CourseConfirmModalVariant = "default" | "danger";

type CourseConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  historyStateKey: string;
  variant?: CourseConfirmModalVariant;
  onClose: () => void;
  onConfirm: () => void;
};

export function CourseConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  historyStateKey,
  variant = "default",
  onClose,
  onConfirm,
}: CourseConfirmModalProps) {
  const { isRendered, isVisible, requestClose } = useOverlayFlowController({
    open,
    onClose,
    historyStateKey,
  });

  if (!isRendered) {
    return null;
  }

  return createPortal(
    <RoomModalShell visible={isVisible} onOverlayClick={requestClose} className="z-90">
      <div className="px-6 pt-8 pb-5">
        <h2 className="text-foreground text-center text-base leading-snug font-bold">{title}</h2>
        <p className="text-foreground mt-3 text-center text-sm leading-relaxed">{description}</p>
      </div>
      <div className="border-border/50 flex border-t">
        <button
          type="button"
          onClick={requestClose}
          className={cn(
            "flex-1 py-4 text-sm font-medium transition-colors",
            "border-border/50 text-muted-foreground hover:bg-muted/25 active:bg-muted/35 border-r",
          )}
        >
          취소
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={cn(
            "hover:bg-muted/25 active:bg-muted/35 flex-1 py-4 text-sm font-medium transition-colors",
            variant === "danger" ? "text-destructive" : "text-foreground",
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </RoomModalShell>,
    document.body,
  );
}
