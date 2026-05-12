import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  message: ReactNode;
};

export function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="flex min-h-[12rem] flex-col items-center justify-center py-8 text-center">
      <span className="bg-muted-foreground text-primary-foreground flex size-11 items-center justify-center rounded-full">
        {icon}
      </span>
      <p className="text-muted-foreground mt-4 text-sm font-medium">{message}</p>
    </div>
  );
}
