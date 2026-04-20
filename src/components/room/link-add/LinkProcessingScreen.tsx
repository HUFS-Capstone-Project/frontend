import { useEffect, useMemo, useState } from "react";

import { BrandMarkerLoader } from "@/components/ui/BrandMarkerLoader";
import { PillButton } from "@/components/ui/PillButton";

export type LinkProcessingScreenProps = {
  roomName: string;
  url: string;
  onCancel: () => void;
};

export function LinkProcessingScreen({ roomName, url, onCancel }: LinkProcessingScreenProps) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 200);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const processingMessage = useMemo(() => {
    const elapsedSeconds = Math.floor(elapsedMs / 1000);

    if (elapsedSeconds >= 4) {
      return "거의 다 됐어요! 곧 결과를 보여드릴게요.";
    }

    if (elapsedSeconds >= 2) {
      return "게시물 정보를 가져오고 있어요.";
    }

    return "링크를 분석 중이에요 👀 잠깐만 기다려 주세요!";
  }, [elapsedMs]);

  return (
    <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-16 pb-8">
      <div className="space-y-1">
        <h2 className="text-foreground text-xl leading-tight font-bold">{roomName}</h2>
        <p className="text-foreground text-xl leading-tight font-bold">링크로 릴스 추가</p>
      </div>

      <div className="border-border bg-muted/50 text-foreground mt-6 rounded-full border px-4 py-2 text-sm">
        <p className="truncate">{url}</p>
      </div>

      <div className="border-border bg-muted/40 mt-10 flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-6 py-10 text-center">
        <BrandMarkerLoader className="h-12 w-12 -translate-y-3" showShadow={false} />
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">{processingMessage}</p>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <PillButton
          type="button"
          variant="outline"
          className="text-muted-foreground hover:text-muted-foreground"
          onClick={onCancel}
        >
          취소
        </PillButton>
      </div>
    </div>
  );
}
