import { cn } from "@/lib/utils";

import { RoomModalShell } from "./RoomModalShell";

type RoomConfirmModalProps = {
  open: boolean;
  message: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel: string;
  className?: string;
  confirmButtonClassName?: string;
  onCancel?: () => void;
  onConfirm: () => void;
};

export function RoomConfirmModal({
  open,
  message,
  description,
  cancelLabel,
  confirmLabel,
  className,
  confirmButtonClassName,
  onCancel,
  onConfirm,
}: RoomConfirmModalProps) {
  if (!open) {
    return null;
  }

  const isSingleAction = !cancelLabel;

  return (
    <RoomModalShell
      visible
      onOverlayClick={() => {
        if (!isSingleAction) {
          onCancel?.();
        }
      }}
      className={cn("z-60", className)}
    >
      <div className="px-6 pt-8 pb-5 text-center">
        <h2 className="text-foreground text-base leading-snug font-bold whitespace-pre-line">
          {message}
        </h2>
        {description ? (
          <p className="text-foreground mt-3 text-sm leading-relaxed whitespace-pre-line">
            {description}
          </p>
        ) : null}
      </div>

      <div className="border-border/50 flex border-t">
        {isSingleAction ? null : (
          <button
            type="button"
            className={cn(
              "flex-1 py-4 text-sm font-medium transition-colors",
              "border-border/50 text-muted-foreground hover:bg-muted/25 active:bg-muted/35 border-r",
            )}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="button"
          className={cn(
            "text-foreground hover:bg-muted/25 active:bg-muted/35 flex-1 py-4 text-sm font-medium transition-colors",
            confirmButtonClassName,
          )}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </RoomModalShell>
  );
}
