import { PlaceFlowCancelPillButton } from "@/components/place-flow/PlaceFlowCancelPillButton";
import { PillButton } from "@/components/ui/PillButton";
import {
  LINK_FLOW_AFTER_HEADLINES_CLASS,
  LINK_FLOW_DUAL_CTA_ROW_CLASS,
  LINK_FLOW_DUAL_CTA_SLOT_CLASS,
  LINK_FLOW_HEADLINE_STACK_CLASS,
  LINK_FLOW_PAGE_CLASS,
} from "@/features/place-flow/link-flow-layout";
import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";
import { PROMPT_FLOW_ALERT_BELOW_INPUT_CLASS } from "@/features/place-flow/prompt-flow-layout";

export type LinkInputScreenProps = {
  url: string;
  urlError?: string | null;
  onChangeUrl: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitEnabled: boolean;
};

export function LinkInputScreen({
  url,
  urlError,
  onChangeUrl,
  onCancel,
  onSubmit,
  isSubmitEnabled,
}: LinkInputScreenProps) {
  const { titleLine1, titleLine2, inputPlaceholder } = PLACE_FLOW_COPY.linkFromUrl;

  return (
    <div className={LINK_FLOW_PAGE_CLASS}>
      <div className={LINK_FLOW_HEADLINE_STACK_CLASS}>
        <h2 className="text-foreground text-xl leading-tight font-bold">{titleLine1}</h2>
        <p className="text-foreground text-xl leading-tight font-bold">{titleLine2}</p>
      </div>

      <div className={LINK_FLOW_AFTER_HEADLINES_CLASS}>
        <label htmlFor="room-link-input" className="sr-only">
          링크 입력
        </label>
        <input
          id="room-link-input"
          value={url}
          onChange={(event) => onChangeUrl(event.target.value)}
          placeholder={inputPlaceholder}
          autoComplete="off"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="none"
          className="border-input placeholder:text-muted-foreground bg-background h-11 w-full rounded-full border px-4 text-sm outline-none"
        />
        {urlError ? (
          <p className={PROMPT_FLOW_ALERT_BELOW_INPUT_CLASS} role="alert">
            {urlError}
          </p>
        ) : null}
      </div>

      <div className={LINK_FLOW_DUAL_CTA_ROW_CLASS}>
        <div className={LINK_FLOW_DUAL_CTA_SLOT_CLASS}>
          <PlaceFlowCancelPillButton onClick={onCancel}>
            {PLACE_FLOW_COPY.cancel}
          </PlaceFlowCancelPillButton>
        </div>
        <div className={LINK_FLOW_DUAL_CTA_SLOT_CLASS}>
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
    </div>
  );
}
