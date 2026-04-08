import type { AgreementKey } from "@/features/onboarding/lib/termsAgreement";
import { TERMS_AGREEMENT_ITEMS } from "@/features/onboarding/lib/termsAgreement";

import { AgreementItem } from "./agreement-item";

type AgreementListProps = {
  idPrefix: string;
  agreed: Record<AgreementKey, boolean>;
  allChecked: boolean;
  onToggleAll: () => void;
  onToggleItem: (key: AgreementKey) => void;
};

/**
 * 전체동의 + 약관 항목 목록 (`TERMS_AGREEMENT_ITEMS` 기준).
 */
export function AgreementList({
  idPrefix,
  agreed,
  allChecked,
  onToggleAll,
  onToggleItem,
}: AgreementListProps) {
  return (
    <div className="flex w-full flex-col gap-0.5 pt-0.5">
      <div className="mb-3 border-b border-zinc-200/90 pb-4">
        <AgreementItem
          id={`${idPrefix}-all`}
          label="전체동의"
          required={false}
          showBadge={false}
          checked={allChecked}
          onToggle={onToggleAll}
        />
      </div>
      {TERMS_AGREEMENT_ITEMS.map((item) => (
        <AgreementItem
          key={item.key}
          id={`${idPrefix}-${item.key}`}
          label={item.label}
          required={item.required}
          checked={agreed[item.key]}
          onToggle={() => {
            onToggleItem(item.key);
          }}
        />
      ))}
    </div>
  );
}
