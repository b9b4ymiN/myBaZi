/**
 * Spouse Summary Card - สรุปดาวคู่สำหรับแต่ละคน
 * "use client" component สำหรับแสดง SpouseAnalysis แบบย่อ
 */

"use client";

import { SpouseAnalysis } from "@/lib/bazi/spouse-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TEN_GOD_THAI } from "@/types/bazi-gods-stars";
import { cn } from "@/lib/utils";

interface SpouseSummaryCardProps {
  name: string;
  spouse: SpouseAnalysis;
}

export function SpouseSummaryCard({ name, spouse }: SpouseSummaryCardProps) {
  const { star, palace, starPalaceAligned, overall } = spouse;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Spouse star info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">ดาวคู่:</span>
            <Badge variant="outline" className="text-xs">
              {star.stars.map(s => TEN_GOD_THAI[s]).join("、")}
            </Badge>
            <Badge variant={star.quality === "strong" ? "default" : star.quality === "moderate" ? "secondary" : "outline"} className="text-xs">
              {star.quality === "strong" ? "แข็งแรง" : star.quality === "moderate" ? "ปานกลาง" : star.quality === "weak" ? "อ่อน" : "ไม่พบ"}
            </Badge>
          </div>

          {/* Useful/avoid god status */}
          {star.isUsefulGod && (
            <p className="text-xs text-green-700">✓ เป็น用神 (เสริมดวง)</p>
          )}
          {star.isAvoidGod && (
            <p className="text-xs text-amber-700">⚠ เป็น忌神 (ระวัง)</p>
          )}

          {/* Star reading excerpt */}
          {star.reading && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {star.reading}
            </p>
          )}
        </div>

        {/* Palace stability */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Spouse Palace:</span>
            <Badge variant="outline" className="text-xs">
              {palace.branch}
            </Badge>
            <Badge variant={palace.stability === "stable" ? "default" : palace.stability === "combined" ? "secondary" : "outline"} className="text-xs">
              {palace.stability === "stable" ? "มั่นคง" : palace.stability === "combined" ? "ร่วมกัน" : palace.stability === "clashed" ? "ชง" : "ปกติ"}
            </Badge>
          </div>

          {/* Palace reading excerpt */}
          {palace.reading && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {palace.reading}
            </p>
          )}
        </div>

        {/* Star-palace alignment */}
        <div className={cn(
          "rounded-lg p-2 text-xs",
          starPalaceAligned ? "bg-green-50 text-green-900" : "bg-amber-50 text-amber-900"
        )}>
          <p className="font-medium">
            {starPalaceAligned ? "✓ ดาวคู่สอดคล้องกับ Palace" : "⚠ ดาวคู่ไม่สอดคล้องกับ Palace"}
          </p>
        </div>

        {/* Overall excerpt */}
        {overall && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {overall}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
