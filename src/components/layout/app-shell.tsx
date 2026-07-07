"use client";

import { ViewTransition } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FloatingChatButton } from "@/components/layout/floating-chat-button";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top bar */}
      <TopBar />

      {/* Main layout */}
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 lg:ml-60">
          {/* pb-24 clears the mobile bottom nav (h-20 + safe area); lg:pb-0 removes it on desktop */}
          <div className="min-h-[calc(100vh-4rem)] pb-24 lg:pb-0">
            {/*
              ViewTransition — auto cross-fades the route content on navigation.
              Navigation is a React transition in App Router, so this fires on
              every bottom-nav / link click. Bars live outside this boundary so
              they stay anchored (further pinned via view-transition-name in CSS).
            */}
            <ViewTransition default="auto">{children}</ViewTransition>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Floating chat (天机) — hidden on /tianji via the component */}
      <FloatingChatButton />
    </div>
  );
}
