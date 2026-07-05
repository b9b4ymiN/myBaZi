/**
 * StrengthCard component - แสดงความแข็ง/อ่อนของเจ้าวัน
 * แสดงระดับ, คะแนน, ปัจจัย, ธาตุที่เสริม/อ่อน, และสรุป
 */

"use client";

import type { StrengthAnalysis } from "@/types/bazi-strength";
import { STRENGTH_LEVEL_THAI } from "@/types/bazi-strength";
import { ElementBadge } from "./element-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface StrengthCardProps {
  strength: StrengthAnalysis;
}

/**
 * สี badge ตามระดับความแข็ง
 */
const STRENGTH_BADGE_COLOR: Record<StrengthAnalysis["level"], { bg: string; text: string; border: string }> = {
  very_strong: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-300",
    border: "border-green-300 dark:border-green-700",
  },
  strong: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-300",
    border: "border-blue-300 dark:border-blue-700",
  },
  weak: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-800 dark:text-orange-300",
    border: "border-orange-300 dark:border-orange-700",
  },
  very_weak: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-300",
    border: "border-red-300 dark:border-red-700",
  },
};

/**
 * แสดงความแข็ง/อ่อนของเจ้าวัน
 */
export function StrengthCard({ strength }: StrengthCardProps) {
  const { level, score, factors, supportingElements, weakeningElements, clashNotes, summary } = strength;
  const badgeColors = STRENGTH_BADGE_COLOR[level];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">ความแข็ง/อ่อนของเจ้าวัน (身強身弱)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Badge + Score */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className={`${badgeColors.bg} ${badgeColors.text} ${badgeColors.border} text-sm px-3 py-1`}
          >
            {STRENGTH_LEVEL_THAI[level]}
          </Badge>
          <span className="text-sm text-muted-foreground">
            คะแนนรวม: <span className="font-medium">{score}</span>
          </span>
        </div>

        <Separator />

        {/* Factors Breakdown */}
        <div className="space-y-3">
          <div className="text-sm font-medium">ปัจจัยที่影响ความแข็ง/อ่อน</div>
          <ScrollArea className="h-48 w-full rounded-md border border-border">
            <div className="p-3 space-y-3">
              {factors.map((factor, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{factor.label}</span>
                    <Badge
                      variant={factor.score > 0 ? "default" : "destructive"}
                      className="text-xs px-2 py-0.5"
                    >
                      {factor.score > 0 ? "+" : ""}
                      {factor.score}
                    </Badge>
                  </div>
                  {factor.description && (
                    <div className="text-xs text-muted-foreground">{factor.description}</div>
                  )}
                  {factor.details.length > 0 && (
                    <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                      {factor.details.map((detail, dIdx) => (
                        <li key={dIdx}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Supporting vs Weakening Elements */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Supporting Elements */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-green-700 dark:text-green-400">
              ธาตุที่เสริมเจ้าวัน (印/比)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {supportingElements.length > 0 ? (
                supportingElements.map((el, idx) => <ElementBadge key={idx} element={el} size="sm" />)
              ) : (
                <span className="text-xs text-muted-foreground">ไม่มี</span>
              )}
            </div>
          </div>

          {/* Weakening Elements */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-red-700 dark:text-red-400">
              ธาตุที่อ่อนเจ้าวัน (食伤/财/官杀)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {weakeningElements.length > 0 ? (
                weakeningElements.map((el, idx) => <ElementBadge key={idx} element={el} size="sm" />)
              ) : (
                <span className="text-xs text-muted-foreground">ไม่มี</span>
              )}
            </div>
          </div>
        </div>

        {/* Clash Notes (ถ้ามี) */}
        {clashNotes.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-medium">หมายเหตุ: การชน/รวมกัน (冲/合)</div>
              <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                {clashNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Summary */}
        {summary && (
          <>
            <Separator />
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <div className="text-sm font-medium mb-1">สรุป</div>
              <div className="text-sm text-muted-foreground">{summary}</div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
