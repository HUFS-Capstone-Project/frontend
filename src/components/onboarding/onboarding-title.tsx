import * as React from "react";

import { appHeadlineClassName } from "@/lib/app-typography";
import { cn } from "@/lib/utils";

const DEFAULT_SERVICE_NAME = "어디더라";

type OnboardingTitleProps = {
  /** 브랜드명 (기본: 어디더라) — `text-brand-gradient` 적용 */
  serviceName?: string;
  /** 첫 줄에서 서비스명 뒤에 붙는 문구 */
  firstLineRest: React.ReactNode;
  /** 둘째 줄 전체 */
  secondLine: string;
  className?: string;
};

/**
 * 2줄 헤드라인: 첫 줄 `serviceName` + `firstLineRest`, 둘째 줄 `secondLine`.
 */
export function OnboardingTitle({
  serviceName = DEFAULT_SERVICE_NAME,
  firstLineRest,
  secondLine,
  className,
}: OnboardingTitleProps) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <h1 className={appHeadlineClassName}>
        <span className="text-brand-gradient">{serviceName}</span>
        {firstLineRest}
      </h1>
      <p className={appHeadlineClassName}>{secondLine}</p>
    </div>
  );
}
