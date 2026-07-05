"use client";

/**
 * FloatingChatButton — app-wide floating action button linking to 天机 (AI chat).
 * Always reachable (mobile + desktop), hidden when already on /tianji.
 * Positioned above the mobile bottom nav so it never overlaps it.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingChatButton() {
  const pathname = usePathname();
  if (pathname === "/tianji") return null;

  return (
    <Link
      href="/tianji"
      aria-label="ถาม 天机 — AI ที่ปรึกษาดวง"
      title="ถาม 天机"
      className={cn(
        "fixed right-4 bottom-[5.5rem] z-40 lg:bottom-6 lg:right-6",
        "flex h-12 w-12 items-center justify-center rounded-full",
        "bg-gradient-to-br from-gold to-jade text-primary-foreground shadow-[0_8px_24px_rgba(47,122,104,0.35)]",
        "ring-2 ring-card/60 backdrop-blur",
        "transition-transform hover:scale-105 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jade/40",
      )}
    >
      <Sparkles className="h-5 w-5" />
      <span className="sr-only">ถาม 天机</span>
    </Link>
  );
}
