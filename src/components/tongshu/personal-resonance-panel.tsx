"use client";

import { PersonalResonance } from "@/types/tongshu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ELEMENT_THAI } from "@/lib/bazi/types";

interface PersonalResonancePanelProps {
  resonance: PersonalResonance | null;
}

const RATING_BADGES = {
  very_good: {
    label: "เข้ากันมาก",
    className: "bg-green-700 text-white hover:bg-green-800",
  },
  good: {
    label: "เข้ากันดี",
    className: "bg-green-500 text-white hover:bg-green-600",
  },
  neutral: {
    label: "ปานกลาง",
    className: "bg-gray-400 text-white hover:bg-gray-500",
  },
  challenging: {
    label: "ท้าทาย",
    className: "bg-orange-500 text-white hover:bg-orange-600",
  },
  very_challenging: {
    label: "ท้าทายมาก",
    className: "bg-red-600 text-white hover:bg-red-700",
  },
};

const RELATIONSHIP_COLORS = {
  resource: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  companion: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  output: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  wealth: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  power: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function PersonalResonancePanel({ resonance }: PersonalResonancePanelProps) {
  if (!resonance) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-full min-h-[200px]">
          <p className="text-muted-foreground text-center">
            เลือก profile เพื่อดูความเข้ากันส่วนตัว
          </p>
        </CardContent>
      </Card>
    );
  }

  const ratingBadge = RATING_BADGES[resonance.rating];
  const relationshipColor = RELATIONSHIP_COLORS[resonance.stemRelationship];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">ความเข้ากันส่วนตัว (Personal Resonance)</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* User Day Master vs Day Pillar */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Day Master ของคุณ</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{resonance.userDayMaster.stem}</span>
              <Badge variant="outline" className="text-xs">
                {ELEMENT_THAI[resonance.userDayMaster.element]}
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">วันหลัก</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{resonance.dayPillar.stem}</span>
              <span className="text-2xl font-bold text-muted-foreground">
                {resonance.dayPillar.branch}
              </span>
              <Badge variant="outline" className="text-xs">
                {ELEMENT_THAI[resonance.dayPillar.stemElement]}/{ELEMENT_THAI[resonance.dayPillar.branchElement]}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Stem Relationship */}
        <div className="space-y-2">
          <div className="text-sm font-medium">ความสัมพันธ์ 10 神:</div>
          <Badge className={cn("text-sm", relationshipColor)}>
            {resonance.stemRelationshipTh}
          </Badge>
        </div>

        {/* Element Alignment */}
        <div className="space-y-2">
          <div className="text-sm font-medium">การเข้ากับ Useful God:</div>
          {resonance.usefulGodElement !== null ? (
            <div className="flex items-center gap-2">
              {resonance.alignsWithUsefulGod ? (
                <>
                  <span className="text-green-600 text-lg">✓</span>
                  <span className="text-sm text-green-700 dark:text-green-400">
                    {resonance.alignmentNote}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-red-600 text-lg">✗</span>
                  <span className="text-sm text-muted-foreground">
                    {resonance.alignmentNote}
                  </span>
                </>
              )}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              ไม่มีข้อมูล Useful God
            </span>
          )}
        </div>

        <Separator />

        {/* Resonance Score and Rating */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">คะแนนความเข้ากัน:</span>
            <span className={cn(
              "text-2xl font-bold",
              resonance.resonanceScore >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {resonance.resonanceScore > 0 ? "+" : ""}{resonance.resonanceScore}
            </span>
          </div>
          <Badge className={cn("w-full justify-center py-2", ratingBadge.className)}>
            {ratingBadge.label}
          </Badge>
        </div>

        {/* Summary */}
        {resonance.summary && (
          <>
            <Separator />
            <div className="text-sm text-muted-foreground">
              {resonance.summary}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
