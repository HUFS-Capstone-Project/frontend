import { BrandMarkerLoader } from "@/components/ui/BrandMarkerLoader";

/**
 * `ProtectedRoute` · 지연 로딩 탭 페이지용 Suspense 폴백.
 * 빈 화면(null) 대신 브랜드 마커를 보여 라우트 전환 시 깜박임을 줄인다.
 */
export function ProtectedShellSuspenseFallback() {
  return (
    <div className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col items-center justify-center overflow-visible">
      <BrandMarkerLoader announce className="pointer-events-none" />
    </div>
  );
}
