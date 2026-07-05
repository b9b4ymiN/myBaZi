/**
 * StarsView - แสดงดาวมงคลและดาวอัปมงคล (神煞)
 * รายการดาวทั้งหมดพร้อมหมวดหมู่และตำแหน่ง
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, AlertTriangle } from "lucide-react";
import type { GodsAndStarsAnalysis, StarInfo } from "@/types/bazi-gods-stars";

interface StarsViewProps {
  godsAndStars: GodsAndStarsAnalysis;
}

/**
 * ชื่อตำแหน่งภาษาไทย
 */
const POSITION_THAI: Record<string, string> = {
  year: "ปีชะตา",
  month: "เดือนชะตา",
  day: "วันชะตา",
  hour: "ชั่วโมงชะตา",
};

/**
 * แสดงดาวแต่ละดวง
 */
function StarItem({ star }: { star: StarInfo }) {
  const isAuspicious = star.category === "auspicious";
  const Icon = isAuspicious ? Star : AlertTriangle;

  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className={`h-5 w-5 mt-0.5 ${
        isAuspicious ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"
      }`} />
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">{star.name}</span>
          <span className="text-sm text-muted-foreground">{star.nameTh}</span>
          <Badge
            variant={isAuspicious ? "default" : "destructive"}
            className="text-xs"
          >
            {isAuspicious ? "มงคล" : "อัปมงคล"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {POSITION_THAI[star.position]}
          </Badge>
        </div>
        {star.description && (
          <p className="text-xs text-muted-foreground">{star.description}</p>
        )}
      </div>
    </div>
  );
}

/**
 * StarsView Component
 */
export function StarsView({ godsAndStars }: StarsViewProps) {
  const { stars, starsSummary } = godsAndStars;

  // แยกดาวมงคลและอัปมงคล
  const auspiciousStars = stars.filter((s) => s.category === "auspicious");
  const inauspiciousStars = stars.filter((s) => s.category === "inauspicious");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">ดาวมงคลและอัปมงคล (神煞)</CardTitle>
        <CardDescription>
          ดาวที่ส่งผลต่อชะตาชีวิต - มงคลเสริมดี, อัปมงคลเตือนภัย
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300">
              <Star className="h-3 w-3 mr-1" />
              มงคล {starsSummary.auspicious} ดวง
            </Badge>
            <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300">
              <AlertTriangle className="h-3 w-3 mr-1" />
              อัปมงคล {starsSummary.inauspicious} ดวง
            </Badge>
          </div>

          <Separator />

          {/* Empty State */}
          {stars.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">ไม่พบดาวในการวิเคราะห์</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* ดาวมงคล */}
              {auspiciousStars.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    ดาวมงคล ({auspiciousStars.length})
                  </h4>
                  <div className="space-y-1">
                    {auspiciousStars.map((star, idx) => (
                      <StarItem key={idx} star={star} />
                    ))}
                  </div>
                </div>
              )}

              {/* ดาวอัปมงคล */}
              {inauspiciousStars.length > 0 && (
                <>
                  {auspiciousStars.length > 0 && <Separator />}
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      ดาวอัปมงคล ({inauspiciousStars.length})
                    </h4>
                    <div className="space-y-1">
                      {inauspiciousStars.map((star, idx) => (
                        <StarItem key={idx} star={star} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
