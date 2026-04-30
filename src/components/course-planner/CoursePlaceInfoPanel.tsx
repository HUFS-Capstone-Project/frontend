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
    <section className="bg-background px-4 pt-1 pb-5">
      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:bg-muted/45 focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-full transition-colors focus-visible:ring-3 focus-visible:outline-none"
          aria-label="코스 목록으로 돌아가기"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <h1 className="text-foreground min-w-0 flex-1 truncate text-sm font-bold">{courseTitle}</h1>
        <button
          type="button"
          onClick={onEdit}
          className="text-muted-foreground hover:bg-muted/45 focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-full transition-colors focus-visible:ring-3 focus-visible:outline-none"
          aria-label="코스 편집하기"
        >
          <Pencil className="size-3.5" aria-hidden />
        </button>
      </header>

      <div className="mt-5 grid grid-cols-[1.25rem_1fr] gap-x-3">
        <div className="flex flex-col items-center pt-1" aria-hidden>
          <span className="border-muted-foreground bg-background size-3 rounded-full border-2" />
          <span className="border-muted-foreground/70 mt-1 min-h-36 flex-1 border-l border-dashed" />
          <span className="border-muted-foreground bg-background size-3 rounded-full border-2" />
        </div>

        <div className="grid gap-5 pb-5">
          {stops.map((stop) => (
            <article key={stop.id}>
              <h2 className="text-foreground text-sm font-bold">{stop.name}</h2>
              <p className="text-muted-foreground mt-1 text-xs">{stop.address}</p>
              <button
                type="button"
                className="bg-muted text-muted-foreground mt-2 inline-flex h-7 items-center gap-1 rounded-full px-3 text-xs font-medium"
              >
                <MapPin className="size-3" aria-hidden />
                장소 정보
              </button>

              <div className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
                <PersonStanding className="size-4" aria-hidden />
                <span>{stop.walkingTime}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {primaryStop ? (
        <div className="border-border bg-muted/35 rounded-2xl border px-4 py-4">
          <h2 className="text-foreground text-sm font-bold">{primaryStop.name}</h2>
          <p className="text-muted-foreground mt-1 text-xs">{primaryStop.address}</p>

          <button
            type="button"
            className="border-border bg-background text-muted-foreground mt-3 inline-flex h-8 w-full items-center justify-center rounded-full border text-xs font-semibold"
          >
            내가 찾던 장소 다시보기
          </button>

          <div className="text-muted-foreground mt-4 flex items-center justify-between text-xs">
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
