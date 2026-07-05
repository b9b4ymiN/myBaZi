"use client";

import { ScoredHour } from "@/types/tongshu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ELEMENT_THAI } from "@/lib/bazi/types";

interface HoursViewProps {
  hours: ScoredHour[];
}

const RECOMMENDATION_BADGES = {
  best: {
    label: "ดีที่สุด",
    className: "bg-green-700 text-white hover:bg-green-800 border-green-800",
  },
  good: {
    label: "ดี",
    className: "bg-green-500 text-white hover:bg-green-600 border-green-600",
  },
  neutral: {
    label: "ปานกลาง",
    className: "bg-gray-400 text-white hover:bg-gray-500 border-gray-500",
  },
  avoid: {
    label: "หลีกเลี่ยง",
    className: "bg-red-600 text-white hover:bg-red-700 border-red-700",
  },
};

export function HoursView({ hours }: HoursViewProps) {
  const bestHours = hours.filter(h => h.recommendation === "best");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">ช่วงเวลามงคล (12 ช่วง)</CardTitle>
        {bestHours.length > 0 && (
          <div className="text-sm text-green-700 dark:text-green-400">
            ช่วงเวลาดีที่สุด: {bestHours.length} ช่วง
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-2 gap-2 pr-4">
            {hours.map((hour, idx) => (
              <HourCard key={idx} hour={hour} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function HourCard({ hour }: { hour: ScoredHour }) {
  const recommendationBadge = RECOMMENDATION_BADGES[hour.recommendation];
  const isBest = hour.recommendation === "best";

  return (
    <div
      className={cn(
        "p-3 rounded-lg border space-y-2 transition-colors",
        isBest
          ? "bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-800"
          : "bg-background border-border"
      )}
    >
      {/* Header: Hour Name + Time Range */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="font-medium text-sm">{hour.nameTh}</div>
          <div className="text-xs text-muted-foreground">{hour.timeRange}</div>
        </div>
        <Badge
          variant="outline"
          className={cn("text-xs whitespace-nowrap", recommendationBadge.className)}
        >
          {recommendationBadge.label}
        </Badge>
      </div>

      {/* Hour Pillar + Element */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold">{hour.sixtyCycle}</span>
        <Badge variant="secondary" className="text-xs">
          {ELEMENT_THAI[hour.element]}
        </Badge>
      </div>

      {/* Personal Score */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">คะแนน:</span>
        <span
          className={cn(
            "font-bold",
            hour.personalScore >= 0 ? "text-green-600" : "text-red-600"
          )}
        >
          {hour.personalScore > 0 ? "+" : ""}
          {hour.personalScore}
        </span>
      </div>

      {/* Alignment Indicator */}
      {hour.alignsWithUsefulGod && (
        <div className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
          <span>✓</span>
          <span>ตรงกับ Useful God</span>
        </div>
      )}
    </div>
  );
}
