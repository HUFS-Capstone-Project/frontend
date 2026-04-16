import { useEffect, useId, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  AgreementList,
  hasClientValidationErrors,
  mapOnboardingFieldErrors,
  NICKNAME_MAX_LENGTH,
  OnboardingButton,
  OnboardingContent,
  onboardingContentClassName,
  OnboardingFooter,
  OnboardingLayout,
  type OnboardingRequest,
  OnboardingTitle,
  pickFirstOnboardingFieldError,
  useSubmitOnboardingMutation,
  useTermsAgreement,
  validateOnboardingRequest,
} from "@/features/onboarding";
import { isApiError } from "@/shared/api/axios";
import { useAuthStore } from "@/store/auth-store";

type TermsLocationState = {
  nickname?: string;
};

/**
 * 온보딩 2단계: 약관 동의 및 제출
 */
export function TermsAgreementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const idPrefix = useId();
  const logout = useAuthStore((s) => s.logout);

  const nicknameFromPrev = (location.state as TermsLocationState | null)?.nickname?.trim() ?? "";

  const nicknameOk = nicknameFromPrev.length > 0 && nicknameFromPrev.length <= NICKNAME_MAX_LENGTH;

  useEffect(() => {
    if (!nicknameOk) {
      void navigate("/onboarding/nickname", { replace: true });
    }
  }, [nicknameOk, navigate]);

  const { agreed, allChecked, requiredAgreed, handleToggleAll, handleToggleItem } =
    useTermsAgreement();

  const onboardingMutation = useSubmitOnboardingMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!nicknameOk) {
    return null;
  }

  const handleSubmit = () => {
    if (onboardingMutation.isPending) {
      return;
    }

    const request: OnboardingRequest = {
      nickname: nicknameFromPrev,
      serviceTermsAgreed: agreed.serviceTerms,
      privacyPolicyAgreed: agreed.privacyTerms,
      marketingNotificationAgreed: agreed.marketingEmail,
    };

    const clientValidationErrors = validateOnboardingRequest(request);

    if (hasClientValidationErrors(clientValidationErrors)) {
      if (clientValidationErrors.nickname) {
        void navigate("/onboarding/nickname", {
          replace: true,
          state: {
            nickname: nicknameFromPrev,
            nicknameError: clientValidationErrors.nickname,
          },
        });
        return;
      }

      const firstClientMessage =
        clientValidationErrors.serviceTermsAgreed ??
        clientValidationErrors.privacyPolicyAgreed ??
        null;
      setSubmitError(firstClientMessage ?? "입력값을 다시 확인해 주세요.");
      return;
    }

    setSubmitError(null);

    onboardingMutation.mutate(request, {
      onSuccess: () => {
        void navigate("/", { replace: true });
      },
      onError: (error) => {
        if (isApiError(error)) {
          if (error.status === 401 || error.code === "E401_UNAUTHORIZED") {
            logout();
            void navigate("/login", { replace: true });
            return;
          }

          const mappedFieldErrors = mapOnboardingFieldErrors(error.fieldErrors);
          if (mappedFieldErrors.nickname) {
            void navigate("/onboarding/nickname", {
              replace: true,
              state: {
                nickname: nicknameFromPrev,
                nicknameError: mappedFieldErrors.nickname,
              },
            });
            return;
          }

          const firstFieldErrorMessage = pickFirstOnboardingFieldError(mappedFieldErrors);
          if (firstFieldErrorMessage) {
            setSubmitError(firstFieldErrorMessage);
            return;
          }

          setSubmitError(error.message);
          return;
        }

        setSubmitError("온보딩 처리 중 오류가 발생했습니다.");
      },
    });
  };

  const submitDisabled = !requiredAgreed || onboardingMutation.isPending;

  return (
    <OnboardingLayout>
      <OnboardingContent className={onboardingContentClassName.terms}>
        <OnboardingTitle firstLineRest="에 필요한" secondLine="약관에 동의해 주세요" />
        <AgreementList
          idPrefix={idPrefix}
          agreed={agreed}
          allChecked={allChecked}
          onToggleAll={() => {
            handleToggleAll();
            if (submitError) {
              setSubmitError(null);
            }
          }}
          onToggleItem={(key) => {
            handleToggleItem(key);
            if (submitError) {
              setSubmitError(null);
            }
          }}
        />

        <div className="min-h-5">
          {submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}
        </div>

        <OnboardingFooter>
          <OnboardingButton
            active={!submitDisabled}
            disabled={submitDisabled}
            onClick={handleSubmit}
          />
        </OnboardingFooter>
      </OnboardingContent>
    </OnboardingLayout>
  );
}
