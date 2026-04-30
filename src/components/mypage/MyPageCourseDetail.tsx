import { ArrowLeft, Footprints, MapPin, Pencil } from "lucide-react";

import type { SavedCourse } from "./mypage-mock-data";

type MyPageCourseDetailProps = {
  course: SavedCourse;
  onBack: () => void;
};

export function MyPageCourseDetail({ course, onBack }: MyPageCourseDetailProps) {
  return (
    <main className="bg-background min-h-0 flex-1 overflow-y-auto pb-28">
      <section className="relative h-[17rem] overflow-hidden bg-[#eef3f5]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#eef1ec_0_25%,#ffffff_25%_50%,#e8f0f4_50%_75%,#ffffff_75%)] bg-[length:82px_82px]" />
        <div className="absolute top-32 left-[-3rem] h-3 w-[30rem] rotate-[-9deg] rounded-full bg-[#2454b7]/75" />
        <div className="absolute top-16 left-10 h-[2px] w-52 rotate-[30deg] bg-[#ef7773]" />
        <div className="absolute top-24 left-20 h-[2px] w-40 rotate-[-28deg] bg-[#ef7773]" />
        {["left-20 top-24", "left-36 top-16", "left-48 top-32"].map((position, index) => (
          <span
            key={position}
            className={`absolute ${position} flex size-6 items-center justify-center rounded-full border border-[#ef7773] bg-white text-[0.65rem] font-bold text-[#ef7773]`}
          >
            {index + 1}
          </span>
        ))}
      </section>

      <section className="relative -mt-10 rounded-t-[1.75rem] bg-white px-5 pt-4 pb-8 shadow-[0_-12px_24px_rgb(0_0_0_/_0.05)]">
        <div className="mx-auto mb-5 h-1 w-14 rounded-full bg-[#d4d4d4]" />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="touch-target-min -ml-2 flex items-center justify-center rounded-full"
          >
            <ArrowLeft className="size-5 text-[#222222]" aria-hidden />
            <span className="sr-only">마이페이지로 돌아가기</span>
          </button>
          <h1 className="min-w-0 flex-1 truncate text-lg font-bold text-[#111111]">
            {course.title}
          </h1>
          <Pencil className="size-4 text-[#9a9a9a]" aria-hidden />
        </div>

        <ol className="mt-6 space-y-5 border-l border-dashed border-[#8f8f8f] pl-5">
          {course.stops.map((stop) => (
            <li key={stop.id} className="relative pl-1">
              <span className="absolute top-0 -left-[1.82rem] size-3 rounded-full border-2 border-[#8f8f8f] bg-white" />
              <h2 className="text-sm font-semibold text-[#222222]">{stop.name}</h2>
              <p className="mt-1 text-[0.68rem] font-medium text-[#777777]">{stop.address}</p>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#f6f6f6] px-2 py-1 text-[0.65rem] font-semibold text-[#222222]"
              >
                <MapPin className="size-3" aria-hidden />
                장소 정보
              </button>
              {stop.walkingTime ? (
                <p className="mt-3 flex items-center gap-1 text-[0.68rem] font-medium text-[#777777]">
                  <Footprints className="size-3" aria-hidden />
                  {stop.walkingTime}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
