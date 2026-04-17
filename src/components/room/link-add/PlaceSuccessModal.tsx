import { PillButton } from "@/components/ui/PillButton";

import { RoomModalShell } from "../RoomModalShell";

export type PlaceSuccessModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function PlaceSuccessModal({ visible, onClose }: PlaceSuccessModalProps) {
  return (
    <RoomModalShell visible={visible} onOverlayClick={onClose} className="z-90">
      <div className="px-6 pt-10 pb-6 text-center">
        <h3 className="text-foreground text-lg font-bold">
          (Mock) 장소 후보 선택이 완료되었습니다
        </h3>
        <p className="text-muted-foreground mt-2 text-sm">
          실제 장소 등록 API는 아직 연결되지 않았습니다.
        </p>
      </div>
      <div className="px-6 pb-6">
        <PillButton type="button" variant="onboarding" onClick={onClose}>
          확인
        </PillButton>
      </div>
    </RoomModalShell>
  );
}
