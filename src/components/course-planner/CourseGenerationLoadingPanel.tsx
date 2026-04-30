import { Loader2 } from "lucide-react";

export function CourseGenerationLoadingPanel() {
  return (
    <section className="bg-background px-4 pt-1 pb-6">
      <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
        <p className="text-foreground text-base leading-7 font-semibold">
          실심 한 두줄 방을 위한
          <br />
          맞춤 데이트코스를 생성하고 있어요
        </p>
        <Loader2
          className="text-muted-foreground mt-8 size-7 animate-spin"
          aria-label="데이트코스 생성 중"
        />
      </div>
    </section>
  );
}
