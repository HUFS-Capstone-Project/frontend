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
import { MapPin, Pencil, Plus } from "lucide-react";
import type { ClipboardEvent, FormEvent, KeyboardEvent, TouchEvent } from "react";
import { Fragment, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { CharacterLimitFeedback } from "@/components/common/CharacterLimitFeedback";
import { courseStopFromSavedPlace } from "@/components/course-planner/course-place-stop";
import { CourseConfirmModal } from "@/components/course-planner/CourseConfirmModal";
import { CoursePlaceAddSheet } from "@/components/course-planner/CoursePlaceAddSheet";
import { CourseStopEditRow } from "@/components/course-planner/CourseStopEditRow";
import { CourseStopTitle } from "@/components/course-planner/CourseStopTitle";
import { PLACE_FLOW_LINK_CHIP_CLASS } from "@/components/place-flow/PlaceFlowOriginalLinkChipRow";
import { RoomConfirmModal } from "@/components/room/RoomConfirmModal";
import {
  DATE_COURSE_MAX_NAME_LENGTH,
  normalizeDateCourseName,
} from "@/features/course-planner/constants";
import { getDateCourseConflictModalCopy } from "@/features/course-planner/lib/date-course-errors";
import { lengthAfterInsertAtSelection } from "@/lib/string-max-length";
import { cn } from "@/lib/utils";
import type { CourseSavePayload, CourseStop } from "@/shared/types/course";
import type { SavedPlace } from "@/shared/types/map-home";
import { usePlaceDetailStore } from "@/store/place-detail-store";

export type { CourseStop };

type SaveConfirmKind = "create" | "edit";
type CourseConflictModalCopy = {
  message: string;
  description: string;
};

const COLLAPSED_ROUTE_SUMMARY_MAX_ITEMS = 3;

type CoursePlaceInfoPanelProps = {
  courseTitle: string;
  stops: CourseStop[];
  roomId?: string | null;
  onBack: () => void;
  onSave: (payload: CourseSavePayload) => void | Promise<void>;
  /** true면 조회 모드에서 「데이트 코스 저장하기」 버튼을 숨김 — 이미 저장된 코스(마이 페이지 등) */
  hideNewCourseSaveButton?: boolean;
  collapsed?: boolean;
  onExpand?: () => void;
  className?: string;
};

export function CoursePlaceInfoPanel({
  courseTitle,
  stops,
  roomId = null,
  onSave,
  hideNewCourseSaveButton = false,
  collapsed = false,
  onExpand,
  className,
}: CoursePlaceInfoPanelProps) {
  const openDetail = usePlaceDetailStore((s) => s.openDetail);
  const {
    isEditing,
    draftTitle,
    draftStops,
    selectedStopId,
    setDraftTitle,
    setSelectedStopId,
    setIsEditing,
    startEdit,
    cancelEdit,
    addDraftPlace,
    removeDraftStop,
    moveDraftStop,
  } = useCourseEditDraft({ courseTitle, stops });
  const [saveConfirmKind, setSaveConfirmKind] = useState<SaveConfirmKind | null>(null);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [conflictModalCopy, setConflictModalCopy] = useState<CourseConflictModalCopy | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [titleLimitAttempted, setTitleLimitAttempted] = useState(false);
  const collapsedTouchStartYRef = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      moveDraftStop(active.id, over.id);
    },
    [moveDraftStop],
  );

  const handleStartEdit = () => {
    setTitleError(null);
    setTitleLimitAttempted(false);
    startEdit();
  };

  const handleCancelEdit = () => {
    setTitleError(null);
    setTitleLimitAttempted(false);
    cancelEdit();
    setIsAddPlaceOpen(false);
  };

  const validateDraftTitle = () => {
    const nextTitle = draftTitle.trim() || courseTitle.trim();
    if (nextTitle.length > DATE_COURSE_MAX_NAME_LENGTH) {
      setTitleError(`코스 이름은 ${DATE_COURSE_MAX_NAME_LENGTH}자 이하로 입력해 주세요.`);
      return false;
    }

    setTitleError(null);
    return true;
  };

  const handleDraftTitleChange = (value: string) => {
    setDraftTitle(value);
    if ((value.trim() || courseTitle.trim()).length <= DATE_COURSE_MAX_NAME_LENGTH) {
      setTitleError(null);
    }
    if (value.length < DATE_COURSE_MAX_NAME_LENGTH) {
      setTitleLimitAttempted(false);
    }
  };

  const handleDraftTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if ((event.nativeEvent as globalThis.KeyboardEvent).isComposing) {
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    if (event.key.length !== 1) {
      return;
    }

    const nextLength = lengthAfterInsertAtSelection(
      draftTitle,
      event.currentTarget.selectionStart,
      event.currentTarget.selectionEnd,
      1,
    );
    if (nextLength > DATE_COURSE_MAX_NAME_LENGTH) {
      setTitleLimitAttempted(true);
    }
  };

  const handleDraftTitlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData("text");
    if (!text) {
      return;
    }

    const nextLength = lengthAfterInsertAtSelection(
      draftTitle,
      event.currentTarget.selectionStart,
      event.currentTarget.selectionEnd,
      text.length,
    );
    if (nextLength > DATE_COURSE_MAX_NAME_LENGTH) {
      setTitleLimitAttempted(true);
    }
  };

  const handleDraftTitleBeforeInput = (event: FormEvent<HTMLInputElement>) => {
    const nativeEvent = event.nativeEvent as InputEvent;
    if (nativeEvent.isComposing) {
      return;
    }

    const text = nativeEvent.data;
    if (!text) {
      return;
    }

    const nextLength = lengthAfterInsertAtSelection(
      draftTitle,
      event.currentTarget.selectionStart,
      event.currentTarget.selectionEnd,
      text.length,
    );
    if (nextLength > DATE_COURSE_MAX_NAME_LENGTH) {
      setTitleLimitAttempted(true);
    }
  };

  const handleCollapsedTouchStart = (event: TouchEvent<HTMLElement>) => {
    collapsedTouchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleCollapsedTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const startY = collapsedTouchStartYRef.current;
    collapsedTouchStartYRef.current = null;

    if (startY == null) {
      return;
    }

    const endY = event.changedTouches[0]?.clientY ?? startY;
    if (startY - endY >= 36) {
      onExpand?.();
    }
  };

  const handleRequestEditSave = () => {
    if (!validateDraftTitle()) {
      return;
    }

    setSaveConfirmKind("edit");
    setIsSaveConfirmOpen(true);
  };

  const handleAddPlace = (place: SavedPlace) => {
    addDraftPlace(place);
    setIsAddPlaceOpen(false);
  };

  const handleConfirmSave = async () => {
    if (!saveConfirmKind || isSaving) {
      return;
    }

    const isEditSave = saveConfirmKind === "edit";
    if (isEditSave && !validateDraftTitle()) {
      setIsSaveConfirmOpen(false);
      return;
    }

    const nextTitle =
      normalizeDateCourseName(draftTitle.trim() || courseTitle.trim()) || courseTitle;
    const nextStops = isEditSave ? draftStops : stops;
    setIsSaving(true);
    try {
      await onSave({
        kind: saveConfirmKind,
        title: nextTitle,
        stops: nextStops,
      });
      setIsSaveConfirmOpen(false);
      setIsEditing(false);
      setSelectedStopId(null);
    } catch (error) {
      const nextConflictModalCopy = getDateCourseConflictModalCopy(error);
      if (nextConflictModalCopy) {
        setIsSaveConfirmOpen(false);
        setConflictModalCopy(nextConflictModalCopy);
      }
      return;
    } finally {
      setIsSaving(false);
    }
  };

  const displayStops = isEditing ? draftStops : stops;
  const currentSaveConfirmKind = saveConfirmKind ?? "create";

  if (collapsed && !isEditing) {
    return (
      <section
        className={cn(
          "bg-background flex h-full min-w-0 flex-col overflow-hidden px-6 pt-8 pb-[max(1rem,env(safe-area-inset-bottom))]",
          className,
        )}
        onTouchStart={handleCollapsedTouchStart}
        onTouchEnd={handleCollapsedTouchEnd}
        onClick={onExpand}
      >
        <header className="flex min-w-0 items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <h1 className="text-foreground min-w-0 shrink truncate text-lg leading-snug font-semibold">
              {courseTitle}
            </h1>
            <button
              type="button"
              onClick={() => {
                onExpand?.();
                handleStartEdit();
              }}
              className="text-muted-foreground hover:bg-muted/45 focus-visible:ring-ring/50 inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-3 focus-visible:outline-none"
              aria-label="코스 편집하기"
            >
              <Pencil className="size-3.5" aria-hidden />
            </button>
          </div>
        </header>

        <CourseRouteSummary stops={stops} className="mt-4" />
      </section>
    );
  }

  return (
    <section
      className={cn(
        "bg-background px-6 pt-8",
        hideNewCourseSaveButton && !isEditing
          ? "pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+1rem))]"
          : "pb-0",
        className,
      )}
    >
      {isEditing ? (
        <header className="w-full">
          <input
            value={draftTitle}
            onChange={(event) => handleDraftTitleChange(event.target.value)}
            className={cn(
              "text-foreground placeholder:text-muted-foreground border-border focus:border-primary w-full border-b bg-transparent pt-0.5 pb-2 text-lg leading-snug font-semibold transition-colors outline-none",
              titleError && "border-destructive focus:border-destructive",
            )}
            placeholder="코스 이름"
            maxLength={DATE_COURSE_MAX_NAME_LENGTH}
            aria-label="코스 이름 편집"
            aria-invalid={Boolean(titleError)}
            aria-describedby={
              titleError || titleLimitAttempted ? "course-title-message" : undefined
            }
            onBeforeInput={handleDraftTitleBeforeInput}
            onKeyDown={handleDraftTitleKeyDown}
            onPaste={handleDraftTitlePaste}
          />
          <CharacterLimitFeedback
            warningId="course-title-message"
            currentLength={draftTitle.length}
            maxLength={DATE_COURSE_MAX_NAME_LENGTH}
            warning={
              titleError ??
              (titleLimitAttempted
                ? `코스 이름은 ${DATE_COURSE_MAX_NAME_LENGTH}자까지 입력할 수 있어요.`
                : null)
            }
          />
        </header>
      ) : (
        <header className="flex w-full items-center gap-2">
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

      <div className={cn("flex flex-col gap-5", isEditing ? "mt-3" : "mt-6")}>
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
                  <span className="bg-primary text-primary-foreground inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs leading-none font-bold shadow-[0_2px_6px_rgb(194_92_86/0.22)]">
                    {index + 1}
                  </span>
                  {!isLast ? (
                    <div className="mt-2 flex min-h-8 min-w-0 flex-1 flex-col items-center">
                      <span className="border-primary/45 w-px flex-1 border-l border-dashed" />
                    </div>
                  ) : null}
                </div>

                <article className="min-w-0">
                  <CourseStopTitle stop={stop} asHeading />
                  <p className="text-muted-foreground mt-1 text-xs">{stop.address}</p>
                  <button
                    type="button"
                    onClick={() => openDetail(String(stop.roomPlaceId))}
                    className={cn(PLACE_FLOW_LINK_CHIP_CLASS, "mt-2 h-7 px-3 font-medium")}
                  >
                    <MapPin className="size-3" aria-hidden />
                    장소 정보
                  </button>
                </article>
              </div>
            );
          })
        )}
      </div>

      {isEditing ? (
        <>
          <button
            type="button"
            onClick={() => setIsAddPlaceOpen(true)}
            className="border-border bg-background text-muted-foreground hover:bg-muted/35 focus-visible:ring-ring/50 mt-5 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none"
          >
            <Plus className="size-4" aria-hidden />
            장소 추가하기
          </button>

          <div className="mt-3 flex w-full gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="border-border bg-background text-muted-foreground hover:bg-muted/50 focus-visible:ring-ring/50 inline-flex h-11 flex-1 items-center justify-center rounded-lg border text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleRequestEditSave}
              className={cn(
                "focus-visible:ring-ring/50 text-primary-foreground inline-flex h-11 flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none",
                "bg-primary hover:bg-primary/90",
              )}
            >
              수정하기
            </button>
          </div>
        </>
      ) : hideNewCourseSaveButton ? null : (
        <button
          type="button"
          onClick={() => {
            setSaveConfirmKind("create");
            setIsSaveConfirmOpen(true);
          }}
          className={cn(
            "focus-visible:ring-ring/50 text-primary-foreground mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none",
            "bg-primary hover:bg-primary/90",
          )}
        >
          데이트 코스 저장하기
        </button>
      )}

      <CourseConfirmModal
        open={isSaveConfirmOpen}
        title={
          currentSaveConfirmKind === "edit"
            ? "변경한 내용을 저장할까요?"
            : "데이트 코스를 저장할까요?"
        }
        description={
          currentSaveConfirmKind === "edit"
            ? "코스와 장소 순서가 저장돼요."
            : "선택한 장소들로 새 코스가 만들어져요."
        }
        confirmLabel={currentSaveConfirmKind === "edit" ? "수정하기" : "저장하기"}
        historyStateKey="courseSaveConfirm"
        onClose={() => setIsSaveConfirmOpen(false)}
        onConfirm={handleConfirmSave}
      />

      <CoursePlaceAddSheet
        open={isAddPlaceOpen}
        roomId={roomId}
        excludedPlaceIds={draftStops.map((stop) => String(stop.roomPlaceId))}
        onClose={() => setIsAddPlaceOpen(false)}
        onConfirm={handleAddPlace}
      />

      <CourseConflictModal copy={conflictModalCopy} onClose={() => setConflictModalCopy(null)} />
    </section>
  );
}

function CourseRouteSummary({ stops, className }: { stops: CourseStop[]; className?: string }) {
  if (stops.length === 0) {
    return null;
  }

  const hasHiddenStops = stops.length > COLLAPSED_ROUTE_SUMMARY_MAX_ITEMS;
  const visibleStops = hasHiddenStops ? stops.slice(0, COLLAPSED_ROUTE_SUMMARY_MAX_ITEMS) : stops;
  const hiddenStopCount = stops.length - visibleStops.length;

  return (
    <ol
      className={cn(
        "flex w-full max-w-full min-w-0 flex-wrap items-center justify-center gap-x-2 gap-y-2 overflow-hidden px-1 py-1",
        className,
      )}
    >
      {visibleStops.map((stop, index) => {
        const isLastVisibleStop = index === visibleStops.length - 1;

        return (
          <Fragment key={stop.id}>
            <li className="text-foreground flex max-w-[8.5rem] min-w-0 items-center gap-1.5 text-sm font-semibold">
              <span className="bg-primary text-primary-foreground inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[0.7rem] leading-none font-bold">
                {index + 1}
              </span>
              <span className="min-w-0 truncate">{stop.name}</span>
            </li>
            {isLastVisibleStop && !hasHiddenStops ? null : (
              <span className="text-muted-foreground/65 shrink-0 text-sm font-semibold" aria-hidden>
                →
              </span>
            )}
          </Fragment>
        );
      })}
      {hasHiddenStops ? (
        <li className="text-muted-foreground shrink-0 text-sm font-semibold">
          +{hiddenStopCount}곳
        </li>
      ) : null}
    </ol>
  );
}

function useCourseEditDraft({ courseTitle, stops }: { courseTitle: string; stops: CourseStop[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(courseTitle);
  const [draftStops, setDraftStops] = useState<CourseStop[]>(stops);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const startEdit = useCallback(() => {
    setDraftTitle(courseTitle);
    setDraftStops([...stops]);
    setSelectedStopId(null);
    setIsEditing(true);
  }, [courseTitle, stops]);

  const cancelEdit = useCallback(() => {
    setDraftTitle(courseTitle);
    setDraftStops(stops);
    setSelectedStopId(null);
    setIsEditing(false);
  }, [courseTitle, stops]);

  const addDraftPlace = useCallback((place: SavedPlace) => {
    setDraftStops((current) => {
      const placeRoomPlaceId = place.roomPlaceId ?? Number(place.id);
      if (
        Number.isInteger(placeRoomPlaceId) &&
        current.some((stop) => stop.roomPlaceId === placeRoomPlaceId)
      ) {
        return current;
      }

      return [...current, courseStopFromSavedPlace(place)];
    });
    setSelectedStopId(null);
  }, []);

  const removeDraftStop = useCallback((stopId: string) => {
    setDraftStops((current) => current.filter((stop) => stop.id !== stopId));
    setSelectedStopId((id) => (id === stopId ? null : id));
  }, []);

  const moveDraftStop = useCallback((activeId: string | number, overId: string | number) => {
    setDraftStops((items) => {
      const oldIndex = items.findIndex((item) => item.id === activeId);
      const newIndex = items.findIndex((item) => item.id === overId);
      if (oldIndex < 0 || newIndex < 0) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  }, []);

  return {
    isEditing,
    draftTitle,
    draftStops,
    selectedStopId,
    setDraftTitle,
    setSelectedStopId,
    setIsEditing,
    startEdit,
    cancelEdit,
    addDraftPlace,
    removeDraftStop,
    moveDraftStop,
  };
}

function CourseConflictModal({
  copy,
  onClose,
}: {
  copy: CourseConflictModalCopy | null;
  onClose: () => void;
}) {
  if (!copy) {
    return null;
  }

  return createPortal(
    <RoomConfirmModal
      open
      message={copy.message}
      description={copy.description}
      confirmLabel="확인"
      className="z-90"
      onConfirm={onClose}
    />,
    document.body,
  );
}
