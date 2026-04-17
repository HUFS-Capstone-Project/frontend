import { BrandMarkerLoader } from "@/components/ui/BrandMarkerLoader";
import { PillButton } from "@/components/ui/PillButton";

export type LinkProcessingScreenProps = {
  roomName: string;
  url: string;
  onCancel: () => void;
};

export function LinkProcessingScreen({ roomName, url, onCancel }: LinkProcessingScreenProps) {
  return (
    <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-16 pb-8">
      <div className="space-y-1">
        <h2 className="text-foreground text-xl leading-tight font-bold">{roomName}</h2>
        <p className="text-foreground text-xl leading-tight font-bold">링크로 릴스 추가</p>
      </div>

      <div className="mt-6 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700">
        <p className="truncate">{url}</p>
      </div>

      <div className="mt-10 flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-10 text-center">
        <BrandMarkerLoader className="h-12 w-12 -translate-y-3" showShadow={false} />
        <div className="space-y-1">
          <p className="text-foreground text-sm font-semibold">링크를 처리 중입니다</p>
          <p className="text-muted-foreground text-xs">
            2~3초 간격으로 처리 상태를 확인하고 있어요.
          </p>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <PillButton type="button" variant="outline" onClick={onCancel}>
          취소
        </PillButton>
      </div>
    </div>
  );
}
