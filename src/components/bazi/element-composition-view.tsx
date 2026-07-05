/**
 * ElementCompositionView - แสดงสัดส่วน 5 ธาตุ (五行)
 * Bar chart แนวนอนแสดงความสมดุลของ 5 ธาตุใน BaZi Chart
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ElementBadge } from "@/components/bazi/element-badge";
import { AlertCircle, CheckCircle2, Minus } from "lucide-react";
import type { ElementComposition } from "@/types/bazi-elements";
import { ELEMENT_THAI } from "@/lib/bazi/types";
import { ELEMENT_LEVEL_THAI, BALANCE_STATUS_THAI } from "@/types/bazi-elements";

interface ElementCompositionViewProps {
  elements: ElementComposition;
}

/**
 * สี bar ตามธาตุ (Tailwind gradient)
 */
const ELEMENT_BAR_COLORS: Record<string, string> = {
  木: "from-green-400 to-green-600 dark:from-green-600 dark:to-green-800",
  火: "from-red-400 to-red-600 dark:from-red-600 dark:to-red-800",
  土: "from-amber-400 to-amber-600 dark:from-amber-600 dark:to-amber-800",
  金: "from-slate-400 to-slate-600 dark:from-slate-500 dark:to-slate-700",
  水: "from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800",
};

/**
 * แสดง Bar ของแต่ละธาตุ
 */
function ElementBar({
  element,
  count,
  percentage,
  level,
}: {
  element: string;
  count: number;
  percentage: number;
  level: string;
}) {
  const thaiName = ELEMENT_THAI[element as keyof typeof ELEMENT_THAI];
  const barColor = ELEMENT_BAR_COLORS[element] || "from-gray-400 to-gray-600";

  return (
    <div className="space-y-1">
      {/* Label + Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">{element}</span>
          <span className="font-medium">{thaiName}</span>
          <Badge variant="outline" className="text-xs">
            {level}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-xs">{count} ครั้ง</span>
          <span className="font-medium">{percentage.toFixed(1)}%</span>
        </div>
      </div>

      {/* Bar */}
      <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} transition-all duration-500`}
          style={{ width: `${Math.max(percentage, 2)}%` }} // min 2% ให้เห็นเสมอ
        />
      </div>
    </div>
  );
}

/**
 * ElementCompositionView Component
 */
export function ElementCompositionView({ elements }: ElementCompositionViewProps) {
  const {
    counts,
    dominantElement,
    weakestElement,
    missingElements,
    description,
    balanceStatus,
  } = elements;

  const dominantThai = ELEMENT_THAI[dominantElement as keyof typeof ELEMENT_THAI];
  const weakestThai = weakestElement
    ? ELEMENT_THAI[weakestElement as keyof typeof ELEMENT_THAI]
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          สัดส่วน 5 ธาตุ (五行)
        </CardTitle>
        <CardDescription>
          ความสมดุลของ 5 ธาตุในชะตา - บ่งบอกสุขภาพและอุปสรรค
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Balance Status */}
          <div className="flex items-center gap-3">
            {balanceStatus === "balanced" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : balanceStatus === "slightly_imbalanced" ? (
              <Minus className="h-5 w-5 text-amber-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="font-medium">
              สถานะ: {BALANCE_STATUS_THAI[balanceStatus]}
            </span>
          </div>

          {/* Element Bars */}
          <div className="space-y-3">
            {counts.map((item) => (
              <ElementBar
                key={item.element}
                element={item.element}
                count={item.count}
                percentage={item.percentage}
                level={ELEMENT_LEVEL_THAI[item.level]}
              />
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="space-y-3">
            {/* Dominant */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">ธาตุที่เด่นที่สุด:</span>
              <ElementBadge
                element={dominantElement}
                size="sm"
                showThai={false}
              />
              <span className="text-muted-foreground">{dominantThai}</span>
            </div>

            {/* Weakest */}
            {weakestElement && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">ธาตุที่น้อยที่สุด:</span>
                <ElementBadge
                  element={weakestElement}
                  size="sm"
                  showThai={false}
                />
                <span className="text-muted-foreground">{weakestThai}</span>
              </div>
            )}

            {/* Missing */}
            {missingElements.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">ธาตุที่ขาด:</span>
                <div className="flex items-center gap-1">
                  {missingElements.map((element) => (
                    <Badge
                      key={element}
                      variant="destructive"
                      className="text-xs"
                    >
                      {element}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">คำอธิบาย:</p>
            <p>{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
