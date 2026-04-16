import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  NICKNAME_MAX_LENGTH,
  NicknameInputSection,
  normalizeNickname,
  OnboardingButton,
  OnboardingContent,
  onboardingContentClassName,
  OnboardingFooter,
  OnboardingLayout,
  OnboardingTitle,
} from "@/features/onboarding";

type NicknamePageLocationState = {
  nickname?: string;
  nicknameError?: string;
};

/**
 * 온보딩 1단계: 닉네임 입력
 */
export function NicknamePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = (location.state as NicknamePageLocationState | null) ?? null;
  const initialNickname = locationState?.nickname?.trim() ?? "";
  const initialNicknameError = locationState?.nicknameError ?? null;

  const [nickname, setNickname] = useState(() => initialNickname);
  const [nicknameError, setNicknameError] = useState<string | null>(() => initialNicknameError);

  const trimmed = normalizeNickname(nickname);

  const canSubmit =
    trimmed.length > 0 &&
    trimmed.length <= NICKNAME_MAX_LENGTH &&
    nickname.length <= NICKNAME_MAX_LENGTH;

  return (
    <OnboardingLayout>
      <OnboardingContent className={onboardingContentClassName.nickname}>
        <OnboardingTitle firstLineRest="에서 사용할" secondLine="닉네임을 등록해 주세요" />
        <NicknameInputSection
          label="닉네임"
          value={nickname}
          onChange={(nextValue) => {
            setNickname(nextValue);
            if (nicknameError) {
              setNicknameError(null);
            }
          }}
          maxLength={NICKNAME_MAX_LENGTH}
        />

        <div className="min-h-5">
          {nicknameError ? <p className="text-destructive text-sm">{nicknameError}</p> : null}
        </div>

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
