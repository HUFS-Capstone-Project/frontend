import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ListTopBar } from "@/components/common/ListTopBar";
import type { LegalDocument } from "@/features/legal/types";
import { APP_ROUTES } from "@/shared/config/routes";

type LegalDocumentPageProps = {
  legalDocument: LegalDocument;
};

export function LegalDocumentPage({ legalDocument }: LegalDocumentPageProps) {
  const navigate = useNavigate();
  const { title, effectiveDate, sections } = legalDocument;

  useEffect(() => {
    const previousTitle = window.document.title;
    window.document.title = `${title} | 어디더라`;
    return () => {
      window.document.title = previousTitle;
    };
  }, [title]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    void navigate(APP_ROUTES.login, { replace: true });
  };

  return (
    <div className="room-no-caret -m-page flex min-h-0 flex-1 flex-col overflow-hidden">
      <ListTopBar
        title={title}
        trailing={null}
        variant="sticky"
        backLabel="이전 화면으로 돌아가기"
        onBack={handleBack}
      />

      <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 pb-[max(1.5rem,var(--inset-bottom))]">
        <p className="text-muted-foreground pt-2 pb-6 text-xs">시행일: {effectiveDate}</p>

        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.title} aria-labelledby={section.title}>
              <h2
                id={section.title}
                className="text-foreground mb-3 text-sm leading-snug font-semibold"
              >
                {section.title}
              </h2>
              <div className="text-muted-foreground flex flex-col gap-2.5 text-sm leading-relaxed">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.listItems ? (
                  <ul className="list-disc space-y-1.5 pl-5">
                    {section.listItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
