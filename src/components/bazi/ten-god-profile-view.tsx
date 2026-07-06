/**
 * TenGodProfileView - ภาพรวมโครงดวง (Phase C depth)
 *
 * แสดงสัดส่วน 5 แกนความสัมพันธ์ (resource/companion/output/wealth/power)
 * บอกว่าดวงหนักด้านไหน ขาดด้านไหน — เป็น "ลายเซ็นต์" ของดวง
 *
 * ZERO HALLUCINATION: ทุกตัวเลขมาจาก ten-god-profile analyzer (counts จริง)
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart } from "lucide-react";
import type { TenGodProfile } from "@/lib/bazi/ten-god-profile";
import type { RelationshipType } from "@/types/bazi-useful-god";
import { RELATIONSHIP_TYPE_THAI } from "@/types/bazi-useful-god";
import { TEN_GOD_THAI } from "@/types/bazi-gods-stars";

const GROUP_ORDER: RelationshipType[] = ["resource", "companion", "output", "wealth", "power"];

const GROUP_MEANING: Record<RelationshipType, string> = {
  resource: "ความรู้ · ผู้ใหญ่ค้ำยัน · ความมั่นคงภายใน",
  companion: "เพื่อนพี่น้อง · การแข่งขัน · พลังตัวเอง",
  output: "ความคิดสร้างสรรค์ · การแสดงออก · ผลงาน",
  wealth: "ทรัพย์สิน · ผลผลิต · สิ่งที่ครอบครอง",
  power: "อำนาจ · หน้าที่ · ความกดดัน/ความรับผิดชอบ",
};

const GROUP_BAR_COLOR: Record<RelationshipType, string> = {
  resource: "bg-violet-500",
  companion: "bg-emerald-500",
  output: "bg-amber-500",
  wealth: "bg-yellow-500",
  power: "bg-blue-500",
};

interface TenGodProfileViewProps {
  profile: TenGodProfile;
}

export function TenGodProfileView({ profile }: TenGodProfileViewProps) {
  const total = GROUP_ORDER.reduce((sum, g) => sum + profile.relationshipCounts[g], 0);
  const primaryTh = RELATIONSHIP_TYPE_THAI[profile.primaryGroup as RelationshipType];
  const missing = profile.missingRelationships as RelationshipType[];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-jade" />
          ภาพรวมโครงดวง
        </CardTitle>
        <CardDescription>
          สัดส่วน 5 แกนความสัมพันธ์ — บอกว่าดวงหนักด้านไหน ขาดด้านไหน
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">ดวงนี้หนักไปทาง</span>
            <Badge>{primaryTh}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {GROUP_MEANING[profile.primaryGroup as RelationshipType]}
          </p>
        </div>

        {/* 5 แกน bar */}
        <div className="space-y-2.5">
          {GROUP_ORDER.map((g) => {
            const count = profile.relationshipCounts[g as RelationshipType];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const isPrimary = g === profile.primaryGroup;
            const isMissing = count === 0;
            return (
              <div key={g} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className={isMissing ? "text-muted-foreground line-through" : ""}>
                    {RELATIONSHIP_TYPE_THAI[g]}
                    {isPrimary && <span className="ml-1 text-xs text-jade">★ หลัก</span>}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {count} {isMissing ? "(ขาด)" : `· ${pct}%`}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isMissing ? "bg-transparent" : GROUP_BAR_COLOR[g]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ten gods ที่เด่น */}
        {profile.dominantGods.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-sm font-medium text-muted-foreground">ดาวที่เด่นในดวง</h4>
            <div className="flex flex-wrap gap-1.5">
              {profile.dominantGods.map((g) => (
                <Badge key={g} variant="secondary">
                  {TEN_GOD_THAI[g]} · {profile.counts[g]} ตำแหน่ง
                </Badge>
              ))}
            </div>
          </div>
        )}

        {missing.length > 0 && (
          <p className="text-xs text-muted-foreground">
            ดวงนี้ขาดแกน {missing.map((g) => RELATIONSHIP_TYPE_THAI[g]).join(" · ")} — ด้านนี้มักต้องเติมจากรอบดวงหรือความสัมพันธ์ภายนอก
          </p>
        )}
      </CardContent>
    </Card>
  );
}
