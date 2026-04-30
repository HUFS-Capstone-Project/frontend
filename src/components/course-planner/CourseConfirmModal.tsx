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

  return (
    <RoomModalShell visible={isVisible} onOverlayClick={requestClose} className="z-90">
      <div className="px-5 py-6 text-center">
        <p className="text-foreground text-sm font-semibold">{title}</p>
        <p className="text-muted-foreground mt-1 text-xs leading-5">{description}</p>
      </div>
      <div className="border-border/70 grid grid-cols-2 border-t">
        <button
          type="button"
          onClick={requestClose}
          className="border-border/70 text-muted-foreground hover:bg-muted/30 h-11 border-r text-sm font-medium transition-colors"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={cn(
            "hover:bg-muted/30 h-11 text-sm font-semibold transition-colors",
            variant === "danger" ? "text-destructive" : "text-primary",
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </RoomModalShell>
  );
}
