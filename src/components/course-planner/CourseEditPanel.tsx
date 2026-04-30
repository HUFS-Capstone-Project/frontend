import { ArrowDown, ArrowUp, ChevronLeft, Trash2 } from "lucide-react";
import { useState } from "react";

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
    <section className="relative z-20 -mt-9 rounded-t-[28px] bg-white px-4 pt-5 pb-7 shadow-[0_-16px_40px_rgba(15,23,42,0.08)]">
      <div className="mx-auto mb-4 h-1 w-14 rounded-full bg-[#d9d9d9]" />

      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-full text-[#52525b] transition-colors hover:bg-[#f4f4f5] focus-visible:ring-3 focus-visible:outline-none"
          aria-label="코스 상세로 돌아가기"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <h1 className="text-sm font-bold text-[#171717]">코스 편집</h1>
      </header>

      <label className="mt-5 grid gap-2">
        <span className="text-xs font-semibold text-[#52525b]">코스명</span>
        <input
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          className="h-10 rounded-md border border-[#d4d4d8] bg-white px-3 text-sm font-semibold text-[#171717] transition-colors outline-none focus:border-[#f06f6b] focus:ring-3 focus:ring-[#f06f6b]/20"
          aria-label="코스명"
        />
      </label>

      <div className="mt-5 grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-[#52525b]">장소 순서</h2>
          <span className="text-[0.7rem] text-[#9ca3af]">위/아래로 순서를 바꿀 수 있어요</span>
        </div>

        {draftStops.map((stop, index) => (
          <article
            key={stop.id}
            className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3 rounded-xl border border-[#eeeeee] bg-white px-3 py-3"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-[#fff0ee] text-xs font-bold text-[#f06f6b]">
              {index + 1}
            </span>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-[#171717]">{stop.name}</h3>
              <p className="mt-1 truncate text-xs text-[#71717a]">{stop.address}</p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveStop(index, "up")}
                disabled={index === 0}
                className="inline-flex size-8 items-center justify-center rounded-full text-[#52525b] transition-colors hover:bg-[#f4f4f5] disabled:text-[#d4d4d8]"
                aria-label={`${stop.name} 위로 이동`}
              >
                <ArrowUp className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => moveStop(index, "down")}
                disabled={index === draftStops.length - 1}
                className="inline-flex size-8 items-center justify-center rounded-full text-[#52525b] transition-colors hover:bg-[#f4f4f5] disabled:text-[#d4d4d8]"
                aria-label={`${stop.name} 아래로 이동`}
              >
                <ArrowDown className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTargetId(stop.id)}
                className="inline-flex size-8 items-center justify-center rounded-full text-[#ef4444] transition-colors hover:bg-[#fef2f2]"
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
          "focus-visible:ring-ring/50 mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold text-white transition-colors focus-visible:ring-3 focus-visible:outline-none",
          draftStops.length > 0 ? "bg-[#f06f6b] hover:bg-[#e86460]" : "bg-[#d4d4d8]",
        )}
        disabled={draftStops.length === 0}
      >
        데이트코스 저장하기
      </button>

      {deleteTarget ? (
        <ConfirmDialog
          title="이 장소를 삭제하시겠어요?"
          description={deleteTarget.name}
          confirmLabel="삭제"
          confirmClassName="text-[#ef4444]"
          onCancel={() => setDeleteTargetId(null)}
          onConfirm={handleDeleteStop}
        />
      ) : null}

      {isSaveConfirmOpen ? (
        <ConfirmDialog
          title="변경한 코스를 저장할까요?"
          description="저장하면 지금 편집한 코스명과 장소 순서가 반영됩니다."
          confirmLabel="저장"
          confirmClassName="text-[#f06f6b]"
          onCancel={() => setIsSaveConfirmOpen(false)}
          onConfirm={handleConfirmSave}
        />
      ) : null}
    </section>
  );
}

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  confirmClassName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  confirmClassName,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-start justify-center bg-black/35 px-8 pt-28">
      <div className="w-full max-w-[250px] overflow-hidden rounded-xl bg-white text-center shadow-xl">
        <div className="px-4 py-5">
          <p className="text-sm font-semibold text-[#171717]">{title}</p>
          <p className="mt-1 text-xs leading-5 text-[#71717a]">{description}</p>
        </div>
        <div className="grid grid-cols-2 border-t border-[#eeeeee]">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 border-r border-[#eeeeee] text-sm font-medium text-[#2563eb]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn("h-11 text-sm font-semibold", confirmClassName)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
