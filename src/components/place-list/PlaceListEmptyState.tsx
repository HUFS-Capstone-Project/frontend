type PlaceListEmptyStateProps = {
  message: string;
};

export function PlaceListEmptyState({ message }: PlaceListEmptyStateProps) {
  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-[#777777] text-xl font-semibold text-white">!</div>
      <p className="mt-4 text-sm font-medium text-[#8a8a8a]">{message}</p>
    </div>
  );
}