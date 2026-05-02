import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  message: ReactNode;
};

export function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="flex min-h-[12rem] flex-col items-center justify-center py-8 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-[#777777] text-white">
        {icon}
      </span>
      <p className="mt-4 text-sm font-medium text-[#8a8a8a]">{message}</p>
    </div>
  );
}
