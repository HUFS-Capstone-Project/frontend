import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

import type { BottomNavToastPlacement } from "@/hooks/use-bottom-nav-controller";

export type BottomNavToastProps = {
  message: string;
  placement?: BottomNavToastPlacement;
};

export function BottomNavToast({ message, placement = "bottom" }: BottomNavToastProps) {
  const isTop = placement === "top";
  const displayMessage = message.trim();

  return createPortal(
    <AnimatePresence>
      {displayMessage ? (
        <motion.div
          initial={{ opacity: 0, y: isTop ? -8 : 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: isTop ? -6 : 6, scale: 0.97 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={
            isTop
              ? "pointer-events-none fixed inset-x-0 top-[calc(var(--inset-top)+0.75rem)] z-90 flex justify-center px-5"
              : "pointer-events-none fixed inset-x-0 bottom-[calc(var(--inset-bottom)+var(--keyboard-inset-bottom)+7.0rem)] z-90 flex justify-center px-5"
          }
        >
          <p className="bg-foreground/88 text-background rounded-full px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-sm">
            {displayMessage}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
