import type { ReactNode } from "react";

import { PillButton } from "@/components/ui/PillButton";
import { PROMPT_FLOW_OUTLINE_PILL_CLASS } from "@/features/place-flow/prompt-flow-layout";

type PlaceFlowCancelPillButtonProps = {
  children: ReactNode;
  onClick: () => void;
};

export function PlaceFlowCancelPillButton({ children, onClick }: PlaceFlowCancelPillButtonProps) {
  return (
    <PillButton
      type="button"
      variant="outline"
      className={PROMPT_FLOW_OUTLINE_PILL_CLASS}
      onClick={onClick}
    >
      {children}
    </PillButton>
  );
}
