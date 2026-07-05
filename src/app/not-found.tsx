import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Global 404 — branded, Thai. Server component.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-gold/40">
        <CardContent className="space-y-4 pt-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-jade/10">
            <Home className="h-7 w-7 text-jade" />
          </div>
          <h1 className="text-xl font-semibold text-ink">ไม่พบหน้าที่ค้นหา</h1>
          <p className="text-sm text-muted-foreground">
            หน้าที่คุณเข้าถึงอาจถูกย้ายหรือไม่มีอยู่
          </p>
          <Button asChild className="w-full">
            <Link href="/">
              <Home className="h-4 w-4" />
              กลับหน้าหลัก
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
