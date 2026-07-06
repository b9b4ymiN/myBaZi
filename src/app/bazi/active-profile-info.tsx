"use client";

import { useRouter } from "next/navigation";
import { User, Calendar, Clock, Globe, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveProfileSafe } from "@/lib/stores/use-hydrated";
import { formatThaiDate } from "@/lib/utils";

export function ActiveProfileInfo() {
  const router = useRouter();
  const activeProfile = useActiveProfileSafe();

  // Show skeleton during hydration
  if (activeProfile === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  // No active profile - show empty state
  if (!activeProfile) {
    return (
      <div className="text-center py-8">
        <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          ยังไม่ได้เลือกโปรไฟล์
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          สร้างหรือเลือกโปรไฟล์เพื่อเริ่มคำนวณปาจื้อ
        </p>
        <Button onClick={() => router.push("/profiles")} size="lg">
          <UserPlus className="h-5 w-5 mr-2" />
          ไปยังหน้าจัดการโปรไฟล์
        </Button>
      </div>
    );
  }

  // Has active profile - show info
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{activeProfile.name}</h3>
          <p className="text-sm text-muted-foreground">
            {activeProfile.gender === "male" ? "ชาย" : "หญิง"}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">วันเกิด:</span>
          <span className="font-medium">
            {formatThaiDate(activeProfile.birthDate)}
          </span>
        </div>

        {activeProfile.birthTimeKnown === "known" && activeProfile.birthTime && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">เวลาเกิด:</span>
            <span className="font-medium">{activeProfile.birthTime}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">โซนเวลา:</span>
          <span className="font-medium">{activeProfile.timezone}</span>
        </div>
      </div>

      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          การคำนวณปาจื้อจะเริ่มใน Phase 1
        </p>
      </div>
    </div>
  );
}
