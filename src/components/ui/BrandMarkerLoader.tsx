import { type HTMLAttributes, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const RAF_DURATION_MS = 400;

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

type BrandMarkerLoaderProps = {
  className?: string;
  announce?: boolean;
  /** false면 마커 아래 타원 그림자 비표시 */
  showShadow?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export function BrandMarkerLoader({
  className,
  announce = true,
  showShadow = true,
  ...rest
}: BrandMarkerLoaderProps) {
  const markerRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const heartWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;
    const rad = Math.PI / 4;

    function animate(ts: number) {
      const marker = markerRef.current;
      const shadow = shadowRef.current;
      const heartWrap = heartWrapRef.current;
      if (!marker || !heartWrap) return;

      const cycle = ts % (RAF_DURATION_MS * 2);
      const t =
        cycle < RAF_DURATION_MS
          ? cycle / RAF_DURATION_MS
          : (RAF_DURATION_MS * 2 - cycle) / RAF_DURATION_MS;
      const e = easeInOut(t);

      const offset = -5 + e * 10;
      marker.style.transform = `rotate(45deg) translate(${-offset}px, ${-offset}px)`;

      const dy = -offset * Math.sin(rad) + -offset * Math.cos(rad);
      heartWrap.style.transform = `translateY(${dy}px)`;

      if (shadow) {
        const shadowScale = 0.5 + e * 0.5;
        shadow.style.transform = `scale(${shadowScale})`;
      }

      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [showShadow]);

  return (
    <div
      className={cn("brand-marker-loader", className)}
      {...(announce
        ? { role: "status" as const, "aria-busy": true as const }
        : { "aria-hidden": true as const })}
      {...rest}
    >
      {showShadow ? (
        <div ref={shadowRef} className="brand-marker-loader__shadow" aria-hidden />
      ) : null}
      <div ref={markerRef} className="brand-marker-loader__marker" aria-hidden />
      <div ref={heartWrapRef} className="brand-marker-loader__heart-wrap">
        <svg
          className="brand-marker-loader__heart-icon"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
}

type GlobalBrandLoaderOverlayProps = {
  className?: string;
  /** 반투명 배경·블러 비활성화 */
  plain?: boolean;
} & HTMLAttributes<HTMLDivElement>;

/** 전역 로딩: 뷰포트 전체 덮고 마커 중앙 정렬 */
export function GlobalBrandLoaderOverlay({
  className,
  plain,
  ...rest
}: GlobalBrandLoaderOverlayProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-100 flex items-center justify-center",
        !plain && "bg-background/85 backdrop-blur-[2px]",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      {...rest}
    >
      <BrandMarkerLoader announce={false} className="pointer-events-none" />
    </div>
  );
}
