import { type ReactNode } from "react";

import { AnimatedText } from "@/components/ui/AnimatedText";
import { appHeadlineClassName } from "@/lib/app-typography";

/** 라벨 + 슬롯 UI (한 소스) */
const MARKETING_ANIMATED_LINES: { label: string; slot: ReactNode }[] = [
  {
    label: "어디더라?",
    slot: <span className="text-brand-gradient">어디더라?</span>,
  },
  {
    label: "저장해두고",
    slot: (
      <>
        <span className="text-brand-gradient">저장</span>
        해두고
      </>
    ),
  },
  {
    label: "코스로 만들어요",
    slot: (
      <>
        <span className="text-brand-gradient">코스</span>로 만들어요
      </>
    ),
  },
];

/** 모듈 스코프로 참조 고정 */
const MARKETING_TEXTS = MARKETING_ANIMATED_LINES.map((line) => line.label);
const MARKETING_SLOTS = MARKETING_ANIMATED_LINES.map((line) => line.slot);

export type LoginCopyVariant = "greeting" | "marketing";

type LoginCopyProps = {
  variant: LoginCopyVariant;
};

export function LoginCopy({ variant }: LoginCopyProps) {
  if (variant === "greeting") {
    return (
      <div className="w-full max-w-sm text-left">
        <p className={appHeadlineClassName}>
          안녕하세요
          <br />
          <span className="text-brand-gradient">어디더라</span>
          <span> 입니다</span>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm text-left leading-relaxed">
      <AnimatedText
        id="login-marketing-heading"
        prefix="SNS에서 본 맛집과 카페,"
        texts={MARKETING_TEXTS}
        interval={2800}
        durationMs={650}
        slotChildren={MARKETING_SLOTS}
      />
    </div>
  );
}
