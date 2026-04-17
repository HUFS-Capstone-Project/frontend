import { HousePlus } from "lucide-react";

import { cn } from "@/lib/utils";

export type FloatingActionButtonProps = {
  label: string;
  onClick?: () => void;
  className?: string;
};

export function FloatingActionButton({ label, onClick, className }: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "bg-brand-coral text-primary-foreground shadow-md",
        "focus-visible:ring-ring flex size-12 items-center justify-center rounded-full outline-none",
        "focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2",
        "active:bg-brand-coral/90",
        className,
      )}
    >
      <HousePlus className="size-6" strokeWidth={2} aria-hidden />
    </button>
  );
}
