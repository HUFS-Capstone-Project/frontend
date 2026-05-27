import { BrandMarkerLoader } from "@/components/ui/BrandMarkerLoader";
import { cn } from "@/lib/utils";

type CourseGenerationLoadingPanelProps = {
  roomName: string;
  className?: string;
};

export function CourseGenerationLoadingPanel({
  roomName,
  className,
}: CourseGenerationLoadingPanelProps) {
  const label = roomName.trim() || "방";

  return (
    <section className={cn("bg-background flex min-h-0 flex-1 flex-col px-6 pt-8 pb-6", className)}>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
        <div className="flex shrink-0 flex-col items-center">
          <BrandMarkerLoader aria-label="데이트 코스 생성 중" />
        </div>
        <p className="text-foreground mt-12 text-base leading-7 font-semibold">
          <span className="block">{label}의 장소들로</span>
          <span className="mt-2 block">데이트 코스를 생성하고 있어요</span>
        </p>
      </div>
    </section>
  );
}
