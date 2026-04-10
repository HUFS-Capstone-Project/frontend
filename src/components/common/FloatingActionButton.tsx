import { MessageSquarePlus } from "lucide-react";

import { cn } from "@/lib/utils";

export type FloatingActionButtonProps = {
  label: string;
  className?: string;
};

export function FloatingActionButton({ label, className }: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "bg-brand-coral text-primary-foreground shadow-md",
        "focus-visible:ring-ring flex size-12 items-center justify-center rounded-full outline-none",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:bg-brand-coral/90",
        className,
      )}
    >
      <MessageSquarePlus className="size-6" strokeWidth={2} aria-hidden />
    </button>
  );
}
