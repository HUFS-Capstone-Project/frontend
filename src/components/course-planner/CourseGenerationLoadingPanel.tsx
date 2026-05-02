import { Loader2 } from "lucide-react";

type CourseGenerationLoadingPanelProps = {
  /** 현재 컨텍스트 방 이름 (`useRoomSelectionStore`) */
  roomName: string;
};

export function CourseGenerationLoadingPanel({ roomName }: CourseGenerationLoadingPanelProps) {
  const label = roomName.trim() || "방";

  return (
    <section className="bg-background px-6 pt-8 pb-6">
      <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
        <p className="text-foreground text-base leading-7 font-semibold">
          <span className="block">{label}</span>
          <span className="mt-2 block">맞춤 데이트코스를 생성하고 있어요</span>
        </p>
        <Loader2
          className="text-muted-foreground mt-8 size-7 animate-spin"
          aria-label="데이트코스 생성 중"
        />
      </div>
    </section>
  );
}
