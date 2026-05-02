import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CourseStop } from "@/shared/types/course";

const DELETE_STRIP_W_CLASS = "w-[76px]";

type CourseStopEditRowProps = {
  stop: CourseStop;
  isLast: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onRequestDelete: () => void;
};

export function CourseStopEditRow({
  stop,
  isLast,
  isSelected,
  onToggleSelect,
  onRequestDelete,
}: CourseStopEditRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const rowStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
    zIndex: isDragging ? 2 : 0,
  };

  return (
    <div ref={setNodeRef} style={rowStyle} className="touch-manipulation">
      <div className="bg-background flex overflow-hidden">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className={cn(
            "text-muted-foreground hover:bg-muted/45 bg-muted/15 flex w-11 shrink-0 flex-col items-center justify-center",
            "touch-none select-none",
          )}
          aria-label={`${stop.name} 순서 변경`}
        >
          <GripVertical className="size-5" aria-hidden />
        </button>

        <div className="flex min-h-[5.5rem] min-w-0 flex-1">
          <button
            type="button"
            onClick={onToggleSelect}
            className={cn(
              "focus-visible:ring-ring focus-visible:ring-offset-background flex min-h-[5.5rem] min-w-0 flex-1 flex-col justify-center px-3 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              isSelected ? "bg-muted/20" : "bg-background",
            )}
            aria-expanded={isSelected}
            aria-label={isSelected ? `${stop.name} 선택 해제` : `${stop.name} 선택`}
          >
            <span className="pointer-events-none flex flex-col gap-1 text-left">
              <span className="text-foreground text-sm font-bold">{stop.name}</span>
              <span className="text-muted-foreground text-xs leading-snug">{stop.address}</span>
              {!isLast ? (
                <span className="text-muted-foreground mt-2 text-xs">{stop.walkingTime}</span>
              ) : null}
            </span>
          </button>

          <div
            className={cn(
              "flex shrink-0 overflow-hidden transition-[width] duration-200 ease-out",
              isSelected ? DELETE_STRIP_W_CLASS : "w-0",
            )}
            aria-hidden={!isSelected}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRequestDelete();
              }}
              className={cn(
                "text-primary-foreground bg-brand-coral hover:bg-brand-coral/90 flex h-full min-h-[5.5rem] shrink-0 items-center justify-center text-xs font-semibold transition-colors",
                DELETE_STRIP_W_CLASS,
              )}
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
