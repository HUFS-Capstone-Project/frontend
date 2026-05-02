import { cn } from "@/lib/utils";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-8">
      <section
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[332px] rounded-3xl bg-white px-6 py-6 shadow-xl"
      >
        <p className="text-foreground whitespace-pre-line py-5 text-center text-xl leading-7 font-semibold">
          {message}
        </p>

        <div className={cn("mt-2 grid gap-3", isSingleAction ? "grid-cols-1" : "grid-cols-2")}>
          {cancelLabel ? (
            <button
              type="button"
              className="bg-muted text-foreground h-13 rounded-2xl text-base font-semibold transition-colors active:bg-muted/80"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            className="h-13 rounded-2xl bg-[#ffd2d0] text-base font-semibold text-[#241918] transition-colors active:bg-[#ffc4c1]"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
