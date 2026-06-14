import { useEffect, useId, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  AgreementList,
  getFirstUnmappedOnboardingFieldError,
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
import { type ApiError, isApiError, resolveGeneralApiErrorMessage } from "@/shared/api/error";
import { APP_ROUTES } from "@/shared/config/routes";
import { AUTH_TEXT } from "@/shared/config/text";
import { useAuthStore } from "@/store/auth-store";

type TermsLocationState = {
  nickname?: string;
};

/**
 * 온보딩 2단계: 약관 동의 및 제출
 */
export default function TermsAgreementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const idPrefix = useId();
  const logout = useAuthStore((s) => s.logout);

  const nicknameFromPrev = (location.state as TermsLocationState | null)?.nickname?.trim() ?? "";

  const nicknameOk = nicknameFromPrev.length > 0 && nicknameFromPrev.length <= NICKNAME_MAX_LENGTH;

  useEffect(() => {
    if (!nicknameOk) {
      void navigate(APP_ROUTES.onboardingNickname, { replace: true });
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
        void navigate(APP_ROUTES.onboardingNickname, {
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
      setSubmitError(firstClientMessage ?? "입력값을 다시 확인해 주세요");
      return;
    }

    setSubmitError(null);

    onboardingMutation.mutate(request, {
      onSuccess: () => {
        void navigate(APP_ROUTES.root, { replace: true });
      },
      onError: (error) => {
        if (isApiError(error)) {
          logOnboardingSubmitError(error);

          if (error.status === 401 || error.code === "E401_UNAUTHORIZED") {
            logout();
            void navigate(APP_ROUTES.login, { replace: true });
            return;
          }

          const mappedFieldErrors = mapOnboardingFieldErrors(error.fieldErrors);
          if (mappedFieldErrors.nickname) {
            void navigate(APP_ROUTES.onboardingNickname, {
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

          const unmappedFieldError = getFirstUnmappedOnboardingFieldError(error.fieldErrors);
          if (unmappedFieldError) {
            setSubmitError(formatOnboardingStatusPrefix(error, unmappedFieldError));
            return;
          }

          setSubmitError(resolveOnboardingSubmitErrorMessage(error));
          return;
        }

        setSubmitError("온보딩 처리 중 오류가 발생했습니다");
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

const ONBOARDING_SUBMIT_ERROR_FALLBACK = AUTH_TEXT.onboardingError;

function resolveOnboardingSubmitErrorMessage(error: ApiError): string {
  switch (error.status) {
    case 400:
      return "온보딩 요청 실패 (400): 요청 본문의 필드명 또는 약관 동의 값을 확인해 주세요";
    case 403:
      return "온보딩 요청 실패 (403): CSRF 인증 정보를 확인해 주세요";
    case 409:
      return formatOnboardingStatusPrefix(
        error,
        resolveGeneralApiErrorMessage(error, {
          fallback: "온보딩 요청 실패 (409): 이미 온보딩이 완료된 계정입니다",
        }),
      );
    default:
      return formatOnboardingStatusPrefix(
        error,
        resolveGeneralApiErrorMessage(error, { fallback: ONBOARDING_SUBMIT_ERROR_FALLBACK }),
      );
  }
}

function formatOnboardingStatusPrefix(error: ApiError, message: string): string {
  if (error.status === 400 || error.status === 403 || error.status === 409) {
    return `온보딩 요청 실패 (${error.status}): ${message}`;
  }
  return message;
}

function logOnboardingSubmitError(error: ApiError) {
  console.error("[udidura] onboarding request failed", {
    status: error.status ?? null,
    code: error.code ?? null,
    fieldErrors: error.fieldErrors ?? null,
    message: error.message,
  });
}
