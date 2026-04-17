import { PillButton } from "@/components/ui/PillButton";

export type LinkInputScreenProps = {
  roomName: string;
  url: string;
  onChangeUrl: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitEnabled: boolean;
};

export function LinkInputScreen({
  roomName,
  url,
  onChangeUrl,
  onCancel,
  onSubmit,
  isSubmitEnabled,
}: LinkInputScreenProps) {
  return (
    <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-16 pb-8">
      <div className="space-y-1">
        <h2 className="text-foreground text-xl leading-tight font-bold">{roomName}</h2>
        <p className="text-foreground text-xl leading-tight font-bold">링크로 릴스 추가</p>
      </div>

      <div className="mt-6">
        <label htmlFor="room-link-input" className="sr-only">
          링크 입력
        </label>
        <input
          id="room-link-input"
          value={url}
          onChange={(event) => onChangeUrl(event.target.value)}
          placeholder="해당 릴스의 링크를 넣어주세요"
          autoComplete="off"
          className="border-input placeholder:text-muted-foreground h-11 w-full rounded-full border bg-white px-4 text-sm outline-none"
        />
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2.5">
        <PillButton type="button" variant="outline" onClick={onCancel}>
          취소
        </PillButton>
        <PillButton
          type="button"
          variant={isSubmitEnabled ? "onboarding" : "onboardingMuted"}
          disabled={!isSubmitEnabled}
          onClick={onSubmit}
        >
          확인
        </PillButton>
      </div>
    </div>
  );
}
