import { RoomConfirmModal } from "@/components/room/RoomConfirmModal";
import { PLACE_TEXT } from "@/shared/config/text";

type PlaceUsedInDateCourseAlertModalProps = {
  open: boolean;
  onClose: () => void;
  className?: string;
  historyStateKey?: string;
};

export function PlaceUsedInDateCourseAlertModal({
  open,
  onClose,
  className,
  historyStateKey,
}: PlaceUsedInDateCourseAlertModalProps) {
  return (
    <RoomConfirmModal
      open={open}
      message={PLACE_TEXT.deleteBlocked.title}
      description={PLACE_TEXT.deleteBlocked.description}
      confirmLabel="확인"
      className={className}
      historyStateKey={historyStateKey}
      onConfirm={onClose}
    />
  );
}
