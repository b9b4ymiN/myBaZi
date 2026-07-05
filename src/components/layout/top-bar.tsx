"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ProfileSelector } from "@/components/profile/profile-selector";
import { cn } from "@/lib/utils";
import { Bell, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/88 px-4 backdrop-blur lg:px-6">
      {/* Mobile logo */}
      <Link
        href="/"
        className={cn(
          "flex items-center gap-2 font-serif text-2xl font-bold text-jade",
          "lg:hidden" // Hidden on desktop since sidebar has it
        )}
      >
        <Image
          src="/assets/brand/logo.png"
          alt=""
          aria-hidden="true"
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
        myBaZi
      </Link>

      {/* Spacer on desktop */}
      <div className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
        <Image
          src="/assets/brand/ornament-cloud-divider.png"
          alt=""
          aria-hidden="true"
          width={52}
          height={28}
          className="h-7 w-[52px] opacity-70"
        />
        <span>Porcelain jade astrology PWA</span>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Profile selector */}
        <ProfileSelector />

        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="outline" size="icon" className="rounded-full border-border bg-card/80">
            <Bell className="h-4 w-4" />
            <span className="sr-only">การแจ้งเตือน</span>
          </Button>
          <Button variant="outline" size="icon" className="rounded-full border-border bg-card/80">
            <Bookmark className="h-4 w-4" />
            <span className="sr-only">บันทึก</span>
          </Button>
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

      </div>
    </header>
  );
}
