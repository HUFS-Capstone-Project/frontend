import { PillButton } from "@/components/ui/PillButton";
import { cn } from "@/lib/utils";

import { RoomModalShell } from "./RoomModalShell";

type RoomConfirmModalProps = {
  open: boolean;
  message: string;
  cancelLabel?: string;
  confirmLabel: string;
  onCancel?: () => void;
  onConfirm: () => void;
};

export function RoomConfirmModal({
  open,
  message,
  cancelLabel,
  confirmLabel,
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
      className="z-60"
    >
      {isSingleAction ? (
        <div className="px-5 pt-4 pb-4">
          <p className="text-foreground text-center text-base leading-snug font-bold whitespace-pre-line">
            {message}
          </p>
          <PillButton
            type="button"
            variant="modal"
            className="mt-4"
            aria-label={confirmLabel}
            onClick={onConfirm}
          >
            {confirmLabel}
          </PillButton>
        </div>
      ) : (
        <>
          <div className="px-6 pt-8 pb-5 text-center">
            <p className="text-foreground text-base leading-snug font-bold whitespace-pre-line">
              {message}
            </p>
          </div>

          <div className="border-border/50 flex border-t">
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
            <button
              type="button"
              className="text-foreground hover:bg-muted/25 active:bg-muted/35 flex-1 py-4 text-sm font-medium transition-colors"
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </>
      )}
    </RoomModalShell>
  );
}
