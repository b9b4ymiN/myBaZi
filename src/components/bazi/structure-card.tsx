/**
 * StructureCard component - แสดงโครงสร้างของ BaZi (格局)
 * แสดงประเภท, subtype, คำอธิบาย, เหตุผล, และความหมาย
 */

"use client";

import type { StructureAnalysis } from "@/types/bazi-structure";
import { ElementBadge } from "./element-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RichText } from "@/components/ui/rich-text";

interface StructureCardProps {
  structure: StructureAnalysis;
}

/**
 * สี badge ตามประเภทโครงสร้าง
 */
const STRUCTURE_BADGE_COLOR: Record<StructureAnalysis["type"], { bg: string; text: string; border: string }> = {
  normal: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-300",
    border: "border-blue-300 dark:border-blue-700",
  },
  vibrant: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-800 dark:text-purple-300",
    border: "border-purple-300 dark:border-purple-700",
  },
  follower: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-300 dark:border-amber-700",
  },
  special: {
    bg: "bg-pink-100 dark:bg-pink-900/30",
    text: "text-pink-800 dark:text-pink-300",
    border: "border-pink-300 dark:border-pink-700",
  },
};

/**
 * แสดงโครงสร้างของ BaZi (格局)
 */
export function StructureCard({ structure }: StructureCardProps) {
  const { type, subtype, label, labelCn, description, dominantElement, reasons, implications } = structure;
  const badgeColors = STRUCTURE_BADGE_COLOR[type];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">โครงสร้าง (格局)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Type Badge + Subtype Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={`${badgeColors.bg} ${badgeColors.text} ${badgeColors.border} text-sm px-3 py-1`}
          >
            {label}
          </Badge>
          {subtype && (
            <Badge variant="outline" className="text-sm px-2 py-1">
              {labelCn}
            </Badge>
          )}
        </div>

        {/* Description */}
        {description && (
          <RichText className="text-sm text-muted-foreground">{description}</RichText>
        )}

        <Separator />

        {/* Reasons (scrollable if long) */}
        {reasons.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">เหตุผล</div>
            <ScrollArea className={`h-24 w-full rounded-md border border-border ${reasons.length > 3 ? '' : 'h-auto'}`}>
              <div className="p-3 space-y-1.5">
                {reasons.map((reason, idx) => (
                  <div key={idx} className="text-sm text-muted-foreground flex gap-2">
                    <span className="font-medium text-primary">•</span>
                    <RichText>{reason}</RichText>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Dominant Element (ถ้ามี) */}
        {dominantElement && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-medium">ธาตุที่ครอบปาจื้อ</div>
              <ElementBadge element={dominantElement} size="md" />
            </div>
          </>
        )}

        {/* Implications */}
        {implications && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-medium">ความหมายต่อชีวิต</div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <RichText className="text-sm text-muted-foreground">{implications}</RichText>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
