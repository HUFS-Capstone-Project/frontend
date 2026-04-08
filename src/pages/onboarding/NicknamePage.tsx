import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  OnboardingButton,
  OnboardingContent,
  OnboardingFooter,
  OnboardingLayout,
  OnboardingTitle,
  NicknameInputSection,
  onboardingContentClassName,
} from "@/components/onboarding";

/**
 * 온보딩 1단계: 닉네임 등록.
 */
export function NicknamePage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");

  const trimmed = nickname.trim();
  const canSubmit = trimmed.length > 0;

  return (
    <OnboardingLayout>
      <OnboardingContent className={onboardingContentClassName.nickname}>
        <OnboardingTitle
          firstLineRest=" 에서 사용할"
          secondLine="닉네임을 등록하세요"
        />
        <NicknameInputSection
          label="닉네임"
          value={nickname}
          onChange={setNickname}
        />
        <OnboardingFooter>
          <OnboardingButton
            active={canSubmit}
            disabled={!canSubmit}
            onClick={() => {
              if (!canSubmit) return;
              void navigate("/onboarding/terms", {
                state: { nickname: trimmed },
              });
            }}
          />
        </OnboardingFooter>
      </OnboardingContent>
    </OnboardingLayout>
  );
}
