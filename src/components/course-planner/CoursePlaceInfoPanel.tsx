import { ChevronDown, ChevronLeft, MapPin, Pencil, PersonStanding } from "lucide-react";

export type CourseStop = {
  id: string;
  name: string;
  address: string;
  category: string;
  walkingTime: string;
  hours: string;
};

type CoursePlaceInfoPanelProps = {
  courseTitle: string;
  stops: CourseStop[];
  onBack: () => void;
  onEdit: () => void;
};

export function CoursePlaceInfoPanel({
  courseTitle,
  stops,
  onBack,
  onEdit,
}: CoursePlaceInfoPanelProps) {
  const primaryStop = stops[0];

  return (
    <section className="relative z-20 -mt-9 rounded-t-[28px] bg-white px-4 pt-5 pb-7 shadow-[0_-16px_40px_rgba(15,23,42,0.08)]">
      <div className="mx-auto mb-4 h-1 w-14 rounded-full bg-[#d9d9d9]" />

      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-full text-[#52525b] transition-colors hover:bg-[#f4f4f5] focus-visible:ring-3 focus-visible:outline-none"
          aria-label="코스 목록으로 돌아가기"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-sm font-bold text-[#171717]">{courseTitle}</h1>
        <button
          type="button"
          onClick={onEdit}
          className="focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-full text-[#71717a] transition-colors hover:bg-[#f4f4f5] focus-visible:ring-3 focus-visible:outline-none"
          aria-label="코스 편집하기"
        >
          <Pencil className="size-3.5" aria-hidden />
        </button>
      </header>

      <div className="mt-5 grid grid-cols-[1.25rem_1fr] gap-x-3">
        <div className="flex flex-col items-center pt-1" aria-hidden>
          <span className="size-3 rounded-full border-2 border-[#737373] bg-white" />
          <span className="mt-1 min-h-36 flex-1 border-l border-dashed border-[#a3a3a3]" />
          <span className="size-3 rounded-full border-2 border-[#737373] bg-white" />
        </div>

        <div className="grid gap-5 pb-5">
          {stops.map((stop) => (
            <article key={stop.id}>
              <h2 className="text-sm font-bold text-[#171717]">{stop.name}</h2>
              <p className="mt-1 text-xs text-[#71717a]">{stop.address}</p>
              <button
                type="button"
                className="mt-2 inline-flex h-7 items-center gap-1 rounded-full bg-[#f4f4f5] px-3 text-xs font-medium text-[#52525b]"
              >
                <MapPin className="size-3" aria-hidden />
                장소 정보
              </button>

              <div className="mt-4 flex items-center gap-2 text-xs text-[#71717a]">
                <PersonStanding className="size-4" aria-hidden />
                <span>{stop.walkingTime}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {primaryStop ? (
        <div className="rounded-2xl border border-[#eeeeee] bg-[#fafafa] px-4 py-4">
          <h2 className="text-sm font-bold text-[#171717]">{primaryStop.name}</h2>
          <p className="mt-1 text-xs text-[#71717a]">{primaryStop.address}</p>

          <button
            type="button"
            className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-full border border-[#dedede] bg-white text-xs font-semibold text-[#52525b]"
          >
            내가 찾던 장소 다시보기
          </button>

          <div className="mt-4 flex items-center justify-between text-xs text-[#52525b]">
            <span>{primaryStop.category}</span>
            <span className="inline-flex items-center gap-1">
              {primaryStop.hours}
              <ChevronDown className="size-3" aria-hidden />
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
