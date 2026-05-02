import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChevronLeft, MapPin, Pencil, PersonStanding } from "lucide-react";
import { useCallback, useState } from "react";

import { CourseConfirmModal } from "@/components/course-planner/CourseConfirmModal";
import { CourseStopEditRow } from "@/components/course-planner/CourseStopEditRow";
import { cn } from "@/lib/utils";
import type { CourseSavePayload, CourseStop } from "@/shared/types/course";
import { usePlaceDetailStore } from "@/store/place-detail-store";

export type { CourseStop };

type CoursePlaceInfoPanelProps = {
  courseTitle: string;
  stops: CourseStop[];
  onBack: () => void;
  onSave: (payload: CourseSavePayload) => void;
  /** true면 조회 모드에서 「데이트코스 저장하기」 버튼을 숨김 — 이미 저장된 코스(마이 페이지 등) */
  hideNewCourseSaveButton?: boolean;
};

export function CoursePlaceInfoPanel({
  courseTitle,
  stops,
  onBack,
  onSave,
  hideNewCourseSaveButton = false,
}: CoursePlaceInfoPanelProps) {
  const openDetail = usePlaceDetailStore((s) => s.openDetail);

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(courseTitle);
  const [draftStops, setDraftStops] = useState<CourseStop[]>(stops);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);

  const removeDraftStop = useCallback((stopId: string) => {
    setDraftStops((current) => current.filter((stop) => stop.id !== stopId));
    setSelectedStopId((id) => (id === stopId ? null : id));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setDraftStops((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  }, []);

  const handleStartEdit = () => {
    setDraftTitle(courseTitle);
    setDraftStops([...stops]);
    setSelectedStopId(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraftTitle(courseTitle);
    setDraftStops(stops);
    setSelectedStopId(null);
    setIsEditing(false);
  };

  const handleConfirmSave = () => {
    const nextTitle = (isEditing ? draftTitle.trim() : courseTitle.trim()) || courseTitle;
    const nextStops = isEditing ? draftStops : stops;
    onSave({
      kind: isEditing ? "edit" : "create",
      title: nextTitle,
      stops: nextStops,
    });
    setIsEditing(false);
    setSelectedStopId(null);
    setIsSaveConfirmOpen(false);
  };

  const displayStops = isEditing ? draftStops : stops;

  return (
    <section
      className={cn(
        "bg-background px-6 pt-8",
        hideNewCourseSaveButton && !isEditing
          ? "pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+1rem))]"
          : "pb-0",
      )}
    >
      {isEditing ? (
        <header className="w-full">
          <input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            className="text-foreground placeholder:text-muted-foreground border-border focus:border-primary w-full border-b bg-transparent pt-0.5 pb-2 text-lg leading-snug font-semibold transition-colors outline-none"
            placeholder="코스 이름"
            aria-label="코스 이름 편집"
          />
        </header>
      ) : (
        <header className="flex w-full items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="text-muted-foreground hover:bg-muted/45 focus-visible:ring-ring/50 inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-3 focus-visible:outline-none"
            aria-label="코스 목록으로 돌아가기"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-1">
            <h1 className="text-foreground min-w-0 shrink truncate text-lg leading-snug font-semibold">
              {courseTitle}
            </h1>
            <button
              type="button"
              onClick={handleStartEdit}
              className="text-muted-foreground hover:bg-muted/45 focus-visible:ring-ring/50 inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-3 focus-visible:outline-none"
              aria-label="코스 편집하기"
            >
              <Pencil className="size-3.5" aria-hidden />
            </button>
          </div>
        </header>
      )}

      <div className="mt-6 flex flex-col gap-5">
        {isEditing ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={draftStops.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {draftStops.map((stop, index) => (
                <CourseStopEditRow
                  key={stop.id}
                  stop={stop}
                  isLast={index === draftStops.length - 1}
                  isSelected={selectedStopId === stop.id}
                  onToggleSelect={() =>
                    setSelectedStopId((current) => (current === stop.id ? null : stop.id))
                  }
                  onRequestDelete={() => removeDraftStop(stop.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          displayStops.map((stop, index) => {
            const isLast = index === displayStops.length - 1;

            return (
              <div key={stop.id} className="grid grid-cols-[1.25rem_1fr] items-stretch gap-x-3">
                <div className="flex h-full min-h-0 flex-col items-center pt-1" aria-hidden>
                  <span className="border-muted-foreground bg-background size-3 shrink-0 rounded-full border-2" />
                  {!isLast ? (
                    <div className="mt-2 flex min-h-8 min-w-0 flex-1 flex-col items-center">
                      <span className="border-muted-foreground/70 w-px flex-1 border-l border-dashed" />
                    </div>
                  ) : null}
                </div>

                <article className="min-w-0">
                  <h2 className="text-foreground text-sm font-bold">{stop.name}</h2>
                  <p className="text-muted-foreground mt-1 text-xs">{stop.address}</p>
                  <button
                    type="button"
                    onClick={() => openDetail(stop.placeId)}
                    className="bg-muted text-muted-foreground hover:bg-muted/80 mt-2 inline-flex h-7 items-center gap-1 rounded-full px-3 text-xs font-medium transition-colors"
                  >
                    <MapPin className="size-3" aria-hidden />
                    장소 정보
                  </button>

                  {!isLast ? (
                    <div className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
                      <PersonStanding className="size-4" aria-hidden />
                      <span>{stop.walkingTime}</span>
                    </div>
                  ) : null}
                </article>
              </div>
            );
          })
        )}
      </div>

      {isEditing ? (
        <div className="mt-6 flex w-full gap-2">
          <button
            type="button"
            onClick={handleCancelEdit}
            className="border-border bg-background text-muted-foreground hover:bg-muted/50 focus-visible:ring-ring/50 inline-flex h-11 flex-1 items-center justify-center rounded-lg border text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => setIsSaveConfirmOpen(true)}
            className={cn(
              "focus-visible:ring-ring/50 text-primary-foreground inline-flex h-11 flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none",
              "bg-primary hover:bg-primary/90",
            )}
          >
            수정하기
          </button>
        </div>
      ) : hideNewCourseSaveButton ? null : (
        <button
          type="button"
          onClick={() => setIsSaveConfirmOpen(true)}
          className={cn(
            "focus-visible:ring-ring/50 text-primary-foreground mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none",
            "bg-primary hover:bg-primary/90",
          )}
        >
          데이트코스 저장하기
        </button>
      )}

      <CourseConfirmModal
        open={isSaveConfirmOpen}
        title={isEditing ? "코스를 수정할까요?" : "데이트 코스를 저장할까요?"}
        description={
          isEditing
            ? "변경한 코스 이름과 장소 순서가 저장됩니다."
            : "방에 등록된 장소를 기반으로 새 코스가 추가됩니다."
        }
        confirmLabel={isEditing ? "수정하기" : "저장하기"}
        historyStateKey="courseSaveConfirm"
        onClose={() => setIsSaveConfirmOpen(false)}
        onConfirm={handleConfirmSave}
      />
    </section>
  );
}
