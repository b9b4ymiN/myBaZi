/**
 * LuckTimelineView - แสดงเสาชะตาระยะยาว (大运) + ดวงรายปี (流年)
 * Timeline แนวนอน 8 luck pillars พร้อม highlight pillar ปัจจุบัน
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ElementBadge } from "@/components/bazi/element-badge";
import { Calendar, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import type { LuckAnalysis } from "@/types/bazi-luck";
import type { LuckPillarFavorability, Favorability } from "@/lib/bazi/luck-favorability";

interface LuckTimelineViewProps {
  luck: LuckAnalysis;
  /** favorability ต่อ pillar (optional — ถ้าส่งจะแสดง label รุ่ง/กลาง/ระวัง) */
  favorabilities?: LuckPillarFavorability[];
}

/** style ตาม favorability */
const FAVOR_STYLE: Record<Favorability, { label: string; badge: string; border: string }> = {
  favorable: { label: "รุ่ง", badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", border: "border-green-400/50" },
  neutral: { label: "กลาง", badge: "bg-muted text-muted-foreground", border: "border-border" },
  unfavorable: { label: "ระวัง", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", border: "border-amber-400/50" },
};

/**
 * ชื่อตำแหน่งภาษาไทย
 */
const POSITION_LABELS = {
  forward: "ไปข้างหน้า (順行)",
  backward: "ย้อนหลัง (逆行)",
};

/**
 * แสดง 1 Luck Pillar
 */
function LuckPillarBlock({
  pillar,
  isCurrent,
  favorability,
}: {
  pillar: LuckAnalysis["pillars"][number];
  isCurrent: boolean;
  favorability?: LuckPillarFavorability;
}) {
  const favor = favorability ? FAVOR_STYLE[favorability.favorability] : null;
  return (
    <div
      className={`flex-shrink-0 w-32 p-3 rounded-lg border-2 space-y-2 ${
        favor ? favor.border : isCurrent ? "border-primary" : "border-border"
      } bg-card ${isCurrent ? "shadow-md ring-2 ring-primary/30" : ""}`}
    >
      {/* ชื่อ Pillar + ปัจจุบัน/favorability badge */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-1">
          <span className="font-bold text-lg">{pillar.sixtyCycleName}</span>
          {isCurrent && (
            <Badge className="text-xs">ปัจจุบัน</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          อายุ {pillar.startAge}-{pillar.endAge}
        </p>
        {favor && favorability && (
          <Badge variant="outline" className={`text-xs w-full justify-center ${favor.badge}`}>
            {favor.label}
          </Badge>
        )}
      </div>

      {/* 10 God + Element Badges */}
      <div className="space-y-1">
        {pillar.tenGod && (
          <Badge variant="outline" className="text-xs w-full justify-center">
            {pillar.tenGod}
          </Badge>
        )}
        <div className="flex items-center gap-1 justify-center">
          <ElementBadge
            element={pillar.stem.element}
            size="sm"
            showThai={false}
          />
          <span className="text-xs text-muted-foreground">/</span>
          <ElementBadge
            element={pillar.branch.element}
            size="sm"
            showThai={false}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * LuckTimelineView Component
 */
export function LuckTimelineView({ luck, favorabilities }: LuckTimelineViewProps) {
  const {
    direction,
    startAge,
    pillars,
    currentAnnual,
    upcomingTransitions,
  } = luck;

  // map pillar.index → favorability (ถ้ามี)
  const favorByIndex = new Map((favorabilities ?? []).map((f) => [f.index, f]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          เสาชะตาระยะยาว (大运)
        </CardTitle>
        <CardDescription>
          ชะตา 10 ปีต่อเสา - เริ่มอายุ {startAge} ปี, {direction === "forward" ? "ไปข้างหน้า" : "ย้อนหลัง"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Direction Summary */}
          <div className="flex items-center gap-2 text-sm">
            {direction === "forward" ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-blue-600" />
            )}
            <span className="font-medium">
              ทิศทาง: {POSITION_LABELS[direction]}
            </span>
            <span className="text-muted-foreground">
              • เริ่มเสาแรกอายุ {startAge}
            </span>
          </div>

          {/* Timeline แนวนอน - Desktop */}
          <div className="hidden md:block">
            <ScrollArea className="w-full">
              <div className="flex items-center gap-3 pb-4">
                {pillars.map((pillar) => (
                  <LuckPillarBlock
                    key={pillar.index}
                    pillar={pillar}
                    isCurrent={pillar.isCurrent}
                    favorability={favorByIndex.get(pillar.index)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Timeline แนวตั้ง - Mobile */}
          <div className="md:hidden space-y-3">
            {pillars.map((pillar) => (
              <LuckPillarBlock
                key={pillar.index}
                pillar={pillar}
                isCurrent={pillar.isCurrent}
                favorability={favorByIndex.get(pillar.index)}
              />
            ))}
          </div>

          {/* Current Annual */}
          {currentAnnual && (
            <>
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  ดวงรายปีปัจจุบัน (流年)
                </h4>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm">
                    พ.ศ. {currentAnnual.year + 543}
                  </Badge>
                  <span className="font-medium">{currentAnnual.sixtyCycleName}</span>
                  {currentAnnual.tenGod && (
                    <Badge variant="secondary">{currentAnnual.tenGod}</Badge>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Upcoming Transitions */}
          {upcomingTransitions.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-3">
                เสาเปลี่ยน (Transitions) - 3 ครั้งถัดไป
              </h4>
              <div className="space-y-2">
                {upcomingTransitions.map((transition, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-sm p-2 rounded bg-muted/50"
                  >
                    <Badge variant="outline" className="text-xs">
                      อีก {transition.yearsAway} ปี
                    </Badge>
                    <span className="font-medium">อายุ {transition.age}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">{transition.pillar}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
