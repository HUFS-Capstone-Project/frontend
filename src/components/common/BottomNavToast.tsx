import { AnimatePresence, motion } from "framer-motion";

export type BottomNavToastProps = {
  message: string;
};

export function BottomNavToast({ message }: BottomNavToastProps) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.8rem)] z-70 flex justify-center px-5"
        >
          <p className="bg-foreground/88 text-background rounded-full px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-sm">
            {message}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
