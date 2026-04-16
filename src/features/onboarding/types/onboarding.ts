export type OnboardingRequest = {
  nickname: string;
  serviceTermsAgreed: boolean;
  privacyPolicyAgreed: boolean;
  marketingNotificationAgreed: boolean;
};

export type OnboardingFieldName =
  | "nickname"
  | "serviceTermsAgreed"
  | "privacyPolicyAgreed"
  | "marketingNotificationAgreed";

export type OnboardingFieldErrorMap = Partial<Record<OnboardingFieldName, string>>;
