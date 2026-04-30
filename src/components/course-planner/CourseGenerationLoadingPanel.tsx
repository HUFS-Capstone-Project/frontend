import { Loader2 } from "lucide-react";

export function CourseGenerationLoadingPanel() {
  return (
    <section className="relative z-20 -mt-9 min-h-[420px] rounded-t-[28px] bg-white px-4 pt-8 pb-7 shadow-[0_-16px_40px_rgba(15,23,42,0.08)]">
      <div className="mx-auto mb-12 h-1 w-14 rounded-full bg-[#d9d9d9]" />

      <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
        <p className="text-base leading-7 font-semibold text-[#171717]">
          실심 한 두줄 방을 위한
          <br />
          맞춤 데이트코스를 생성하고 있어요
        </p>
        <Loader2
          className="mt-8 size-7 animate-spin text-[#9ca3af]"
          aria-label="데이트코스 생성 중"
        />
      </div>
    </section>
  );
}
