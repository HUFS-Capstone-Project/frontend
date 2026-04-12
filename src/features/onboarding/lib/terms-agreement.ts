/** 약관 체크박스에 대응하는 키 (전체동의는 별도 UI) */
export type AgreementKey = "serviceTerms" | "privacyTerms" | "marketingEmail";

export type AgreementState = Record<AgreementKey, boolean>;

export const initialAgreementState: AgreementState = {
  serviceTerms: false,
  privacyTerms: false,
  marketingEmail: false,
};

export const TERMS_AGREEMENT_ITEMS = [
  {
    key: "serviceTerms",
    label: "서비스 이용약관 동의",
    required: true,
  },
  {
    key: "privacyTerms",
    label: "개인정보 수집 및 이용 동의",
    required: true,
  },
  {
    key: "marketingEmail",
    label: "마케팅 이메일 수신 동의",
    required: false,
  },
] as const satisfies ReadonlyArray<{
  key: AgreementKey;
  label: string;
  required: boolean;
}>;

export function isAllChecked(state: AgreementState): boolean {
  return state.serviceTerms && state.privacyTerms && state.marketingEmail;
}

export function isRequiredAgreed(state: AgreementState): boolean {
  return state.serviceTerms && state.privacyTerms;
}
