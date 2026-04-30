type CoursePlannerMapPreviewProps = {
  statusMessage?: string;
};

export function CoursePlannerMapPreview({ statusMessage }: CoursePlannerMapPreviewProps) {
  return (
    <div className="bg-map-placeholder-bg relative h-full w-full">
      {statusMessage ? (
        <div className="px-page absolute inset-x-0 top-4 z-20">
          <div className="bg-primary text-primary-foreground rounded-sm px-4 py-2 text-center text-xs font-semibold shadow-sm">
            {statusMessage}
          </div>
        </div>
      ) : null}
    </div>
  );
}
