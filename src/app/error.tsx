"use client";

/**
 * Global error boundary — branded, Thai. Must be a Client Component.
 * `reset()` re-attempts rendering the error route segment.
 */

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to browser console for debugging; no sensitive data is logged.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-gold/40">
        <CardContent className="space-y-4 pt-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-ink">เกิดข้อผิดพลาด</h1>
          <p className="text-sm text-muted-foreground">
            ขอโทษด้วย บางอย่างทำงานผิดพลาด ลองอีกครั้งได้
          </p>
          <Button onClick={reset} className="w-full">
            <RefreshCw className="h-4 w-4" />
            ลองอีกครั้ง
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
