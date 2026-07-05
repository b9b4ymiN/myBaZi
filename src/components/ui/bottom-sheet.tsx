"use client";

/**
 * BottomSheet — mobile-only modal sliding up from the bottom.
 * Used by /tongshu to show day detail when a day is tapped (app-like UX).
 * Hidden on desktop (lg:hidden); desktop renders its own panel.
 *
 * Behavior: backdrop tap + Esc close; body scroll locked while open;
 * respects prefers-reduced-motion (fade instead of slide).
 */

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function BottomSheet({
  open,
  onClose,
  children,
  title,
  className,
}: BottomSheetProps) {
  const reduce = useReducedMotion();

  // Esc to close + lock body scroll while open
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.25 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              "absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl border-t border-border bg-card shadow-[0_-12px_40px_rgba(76,57,25,0.18)]",
              className,
            )}
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={{ duration: reduce ? 0.15 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Handle + header */}
            <div className="shrink-0 rounded-t-3xl bg-card">
              <div className="flex justify-center pt-2">
                <div className="h-1.5 w-10 rounded-full bg-border" />
              </div>
              {title && (
                <div className="flex items-center justify-between px-4 pb-2 pt-1">
                  <h2 className="text-base font-semibold text-ink">{title}</h2>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="ปิด"
                    className="rounded-full p-1.5 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable content */}
            <div
              className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-2"
              style={{ maxHeight: "calc(88dvh - 3rem)" }}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
