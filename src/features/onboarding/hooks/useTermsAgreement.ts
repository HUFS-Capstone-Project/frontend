import { useCallback, useMemo, useState } from "react";

import {
  type AgreementKey,
  type AgreementState,
  initialAgreementState,
  isAllChecked,
  isRequiredAgreed,
} from "@/features/onboarding/lib/termsAgreement";

export function useTermsAgreement() {
  const [agreed, setAgreed] = useState<AgreementState>(initialAgreementState);

  const allChecked = useMemo(() => isAllChecked(agreed), [agreed]);
  const requiredAgreed = useMemo(() => isRequiredAgreed(agreed), [agreed]);

  const handleToggleAll = useCallback(() => {
    setAgreed((prev) => {
      const next = !isAllChecked(prev);
      return {
        serviceTerms: next,
        privacyTerms: next,
        marketingEmail: next,
      };
    });
  }, []);

  const handleToggleItem = useCallback((key: AgreementKey) => {
    setAgreed((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return {
    agreed,
    allChecked,
    requiredAgreed,
    handleToggleAll,
    handleToggleItem,
  };
}
