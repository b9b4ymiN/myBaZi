"use client";

import type { QiMenChart } from "@/types/qimen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface ChartSummaryProps {
  chart: QiMenChart;
  chartType: string;
}

/**
 * Summary cards showing key chart information
 */
export function ChartSummary({ chart, chartType }: ChartSummaryProps) {
  const isBestEffort = chartType !== "hour";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            สรุปแผนผัง (Chart Summary)
            {isBestEffort && (
              <Badge variant="outline" className="ml-2 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                Best-effort
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 局 */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">局 (Ju):</span>
            <span className="font-semibold">
              {chart.dun} {chart.ju}局 ({chart.yuan})
            </span>
          </div>

          {/* Term */}
          {chart.term && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">节气 (Term):</span>
              <span className="font-semibold">{chart.term}</span>
            </div>
          )}

          {/* 旬首 */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">旬首 (Xun Shou):</span>
            <span className="font-semibold">{chart.xunShou}</span>
          </div>

          {/* 值符 */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">值符 (Zhi Fu):</span>
            <span className="font-semibold">
              {chart.zhiFuStem} (ที่ palace {chart.palaces.find((p) => p.isZhiFu)?.palaceNumber})
            </span>
          </div>

          {/* 值使 */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">值使 (Zhi Shi):</span>
            <span className="font-semibold">
              {chart.zhiShiDoor} (ที่ palace {chart.palaces.find((p) => p.isZhiShi)?.palaceNumber})
            </span>
          </div>

          {/* Hour Branch */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">时支 (Hour Branch):</span>
            <span className="font-semibold">{chart.hourBranch}</span>
          </div>

          {/* Best-effort warning */}
          {isBestEffort && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 rounded-md border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-semibold mb-1">คำเตือนความแม่นยำ</p>
                  <p className="text-xs">
                    {chartType === "day"
                      ? "日家奇门 (Day Chart): คำนวณแบบ best-effort — กฎการ定局สำหรับแผนผังรายวันแตกต่างกันไปตามสำนัก และต้องการการตรวจสอบเพิ่มเติม"
                      : chartType === "month"
                        ? "月家奇门 (Month Chart): คำนวณแบบ best-effort — กฎการ定局สำหรับแผนผังรายเดือนแตกต่างกันไปตามสำนัก"
                        : "年家奇门 (Year Chart): คำนวณแบบ best-effort — กฎการ定局สำหรับแผนผังรายปีแตกต่างกันไปตามสำนัก"}
                  </p>
                  <p className="text-xs mt-1">
                    แนะนำ: ใช้{" "}
                    <span className="font-semibold">时家奇门 (รายชั่วโมง)</span> เพื่อความแม่นยำสูงสุด
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
