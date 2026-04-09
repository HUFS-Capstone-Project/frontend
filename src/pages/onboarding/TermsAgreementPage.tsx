import { useEffect, useId } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  AgreementList,
  NICKNAME_MAX_LENGTH,
  OnboardingButton,
  OnboardingContent,
  onboardingContentClassName,
  OnboardingFooter,
  OnboardingLayout,
  OnboardingTitle,
} from "@/components/onboarding";
import { useTermsAgreement } from "@/features/onboarding/hooks/useTermsAgreement";
import { useAuthStore } from "@/store/authStore";

type TermsLocationState = {
  nickname?: string;
};

/**
 * 온보딩 2단계: 약관 동의.
 */
export function TermsAgreementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const idPrefix = useId();
  const completeOnboardingFlow = useAuthStore((s) => s.completeOnboardingFlow);

  const nicknameFromPrev =
    (location.state as TermsLocationState | null)?.nickname?.trim() ?? "";

  const nicknameOk =
    nicknameFromPrev.length > 0 &&
    nicknameFromPrev.length <= NICKNAME_MAX_LENGTH;

  useEffect(() => {
    if (!nicknameOk) {
      void navigate("/onboarding/nickname", { replace: true });
    }
  }, [nicknameOk, navigate]);

  const {
    agreed,
    allChecked,
    requiredAgreed,
    handleToggleAll,
    handleToggleItem,
  } = useTermsAgreement();

  if (!nicknameOk) {
    return null;
  }

  return (
    <OnboardingLayout>
      <OnboardingContent className={onboardingContentClassName.terms}>
        <OnboardingTitle
          firstLineRest="에 필요한"
          secondLine="약관에 동의해주세요"
        />
        <AgreementList
          idPrefix={idPrefix}
          agreed={agreed}
          allChecked={allChecked}
          onToggleAll={handleToggleAll}
          onToggleItem={handleToggleItem}
        />
        <OnboardingFooter>
          <OnboardingButton
            active={requiredAgreed}
            disabled={!requiredAgreed}
            onClick={() => {
              if (!requiredAgreed) return;
              completeOnboardingFlow(nicknameFromPrev);
              void navigate("/", { replace: true });
            }}
          />
        </OnboardingFooter>
      </OnboardingContent>
    </OnboardingLayout>
  );
}
