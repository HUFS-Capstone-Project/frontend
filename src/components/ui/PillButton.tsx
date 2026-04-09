import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * 전폭 pill CTA — `GoogleLoginButton`과 동일한 높이·패딩(`h-12`, `rounded-full`, `px-5`, `text-base`).
 */
const pillButtonVariants = cva(
  [
    "inline-flex h-12 w-full min-h-12 touch-target-min items-center justify-center rounded-full px-5 text-base font-medium transition-colors",
    "focus-visible:outline-none disabled:pointer-events-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        outline: [
          "cursor-pointer border border-border bg-background text-foreground shadow-none",
          "hover:bg-muted/40 hover:text-foreground",
          "disabled:opacity-50",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ],
        onboarding: [
          "cursor-pointer border border-transparent bg-brand-coral text-white",
          "active:bg-brand-coral/90",
          "disabled:opacity-100",
          "focus-visible:ring-2 focus-visible:ring-brand-coral/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ],
        onboardingMuted: [
          "cursor-not-allowed border border-transparent bg-brand-coral-soft text-brand-coral-muted",
          "disabled:opacity-100",
          "focus-visible:ring-2 focus-visible:ring-brand-coral/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ],
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);

export type PillButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof pillButtonVariants>;

function PillButton({
  className,
  variant = "outline",
  type = "button",
  ...props
}: PillButtonProps) {
  return (
    <button
      type={type}
      data-slot="pill-button"
      className={cn(pillButtonVariants({ variant }), className)}
      {...props}
    />
  );
}

export { PillButton, pillButtonVariants };
