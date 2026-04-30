import { ArrowDown, ArrowUp, ChevronLeft, Trash2 } from "lucide-react";
import { useState } from "react";

import { CourseConfirmModal } from "@/components/course-planner/CourseConfirmModal";
import type { CourseStop } from "@/components/course-planner/CoursePlaceInfoPanel";
import { cn } from "@/lib/utils";

type CourseEditPanelProps = {
  title: string;
  stops: CourseStop[];
  onBack: () => void;
  onSave: (nextTitle: string, nextStops: CourseStop[]) => void;
};

export function CourseEditPanel({ title, stops, onBack, onSave }: CourseEditPanelProps) {
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftStops, setDraftStops] = useState(stops);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);

  const deleteTarget = draftStops.find((stop) => stop.id === deleteTargetId);

  const moveStop = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= draftStops.length) return;

    const nextStops = [...draftStops];
    const [movedStop] = nextStops.splice(fromIndex, 1);
    nextStops.splice(toIndex, 0, movedStop);
    setDraftStops(nextStops);
  };

  const handleDeleteStop = () => {
    if (!deleteTargetId) return;
    setDraftStops((current) => current.filter((stop) => stop.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  const handleConfirmSave = () => {
    onSave(draftTitle.trim() || title, draftStops);
  };

  return (
    <section className="bg-background px-4 pt-1 pb-5">
      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:bg-muted/45 focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-full transition-colors focus-visible:ring-3 focus-visible:outline-none"
          aria-label="코스 상세로 돌아가기"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <h1 className="text-foreground text-sm font-bold">코스 편집</h1>
      </header>

      <label className="mt-5 grid gap-2">
        <span className="text-muted-foreground text-xs font-semibold">코스명</span>
        <input
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          className="border-input bg-background text-foreground focus:border-primary focus:ring-primary/20 h-10 rounded-md border px-3 text-sm font-semibold transition-colors outline-none focus:ring-3"
          aria-label="코스명"
        />
      </label>

      <div className="mt-5 grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-muted-foreground text-xs font-semibold">장소 순서</h2>
          <span className="text-muted-foreground text-[0.7rem]">
            위/아래로 순서를 바꿀 수 있어요
          </span>
        </div>

        {draftStops.map((stop, index) => (
          <article
            key={stop.id}
            className="border-border bg-background grid grid-cols-[1.5rem_1fr_auto] items-center gap-3 rounded-xl border px-3 py-3"
          >
            <span className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-full text-xs font-bold">
              {index + 1}
            </span>

            <div className="min-w-0">
              <h3 className="text-foreground truncate text-sm font-semibold">{stop.name}</h3>
              <p className="text-muted-foreground mt-1 truncate text-xs">{stop.address}</p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveStop(index, "up")}
                disabled={index === 0}
                className="text-muted-foreground hover:bg-muted/45 disabled:text-muted-foreground/30 inline-flex size-8 items-center justify-center rounded-full transition-colors"
                aria-label={`${stop.name} 위로 이동`}
              >
                <ArrowUp className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => moveStop(index, "down")}
                disabled={index === draftStops.length - 1}
                className="text-muted-foreground hover:bg-muted/45 disabled:text-muted-foreground/30 inline-flex size-8 items-center justify-center rounded-full transition-colors"
                aria-label={`${stop.name} 아래로 이동`}
              >
                <ArrowDown className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTargetId(stop.id)}
                className="text-destructive hover:bg-destructive/10 inline-flex size-8 items-center justify-center rounded-full transition-colors"
                aria-label={`${stop.name} 삭제`}
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIsSaveConfirmOpen(true)}
        className={cn(
          "focus-visible:ring-ring/50 text-primary-foreground mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none",
          draftStops.length > 0 ? "bg-primary hover:bg-primary/90" : "bg-muted-foreground/45",
        )}
        disabled={draftStops.length === 0}
      >
        데이트코스 저장하기
      </button>

      <CourseConfirmModal
        open={deleteTarget != null}
        title="이 장소를 삭제하시겠어요?"
        description={deleteTarget?.name ?? ""}
        confirmLabel="삭제"
        historyStateKey="courseDeleteStopConfirm"
        variant="danger"
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteStop}
      />

      <CourseConfirmModal
        open={isSaveConfirmOpen}
        title="변경한 코스를 저장할까요?"
        description="저장하면 지금 편집한 코스명과 장소 순서가 반영됩니다."
        confirmLabel="저장"
        historyStateKey="courseSaveConfirm"
        onClose={() => setIsSaveConfirmOpen(false)}
        onConfirm={handleConfirmSave}
      />
    </section>
  );
}
