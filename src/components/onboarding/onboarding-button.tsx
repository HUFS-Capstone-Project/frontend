import * as React from "react";

import { PillButton } from "@/components/ui/pill-button";
import { cn } from "@/lib/utils";

type OnboardingButtonProps = Omit<
  React.ComponentProps<typeof PillButton>,
  "variant"
> & {
  children?: React.ReactNode;
  /** false면 연한 스타일(비활성 느낌) */
  active?: boolean;
};

/**
 * 온보딩 하단 pill 확인 — `PillButton`과 동일 높이(h-12).
 */
export function OnboardingButton({
  className,
  active = true,
  disabled,
  children = "확인",
  type = "button",
  ...props
}: OnboardingButtonProps) {
  const isMuted = Boolean(disabled || !active);

  return (
    <PillButton
      type={type}
      variant={isMuted ? "onboardingMuted" : "onboarding"}
      disabled={disabled}
      className={cn(className)}
      {...props}
    >
      {children}
    </PillButton>
  );
}
