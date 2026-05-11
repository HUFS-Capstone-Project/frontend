import { cn } from "@/lib/utils";

export type PlaceFlowOriginalLinkChipRowProps = {
  linkUrl: string;
  className?: string;
};

export const PLACE_FLOW_LINK_CHIP_CLASS =
  "bg-muted text-muted-foreground hover:bg-muted-foreground/14 active:bg-muted-foreground/22 inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs leading-none font-normal transition-colors focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:outline-none focus-visible:ring-2";

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

/** 공유 링크 원본 열기 — 장소 수동 검색 시트·후보 선택 성공 화면 등에서 동일 칩 UI로 사용 */
export function PlaceFlowOriginalLinkChipRow({
  linkUrl,
  className,
}: PlaceFlowOriginalLinkChipRowProps) {
  const handleOpenLink = () => {
    window.open(linkUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <button
        type="button"
        className={PLACE_FLOW_LINK_CHIP_CLASS}
        aria-label="Instagram 원본 보기"
        title="Instagram 원본 보기"
        onClick={handleOpenLink}
      >
        <InstagramGlyph className="size-3 shrink-0" />
        <span>원본 보기</span>
      </button>
    </div>
  );
}
