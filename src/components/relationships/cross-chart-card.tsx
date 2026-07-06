/**
 * Cross Chart Card - แสดงผลการวิเคราะห์ความเข้ากัน (合婚)
 * "use client" component สำหรับแสดง CrossChartAnalysis
 */

"use client";

import { CrossChartAnalysis } from "@/lib/bazi/cross-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TEN_GOD_THAI } from "@/types/bazi-gods-stars";
import { ELEMENT_THAI } from "@/lib/bazi/types";
import { cn } from "@/lib/utils";

interface CrossChartCardProps {
  result: CrossChartAnalysis;
  selfName: string;
  relativeName: string;
}

export function CrossChartCard({ result, selfName, relativeName }: CrossChartCardProps) {
  const { ownerDayMaster, relatedDayMaster, dayMasterComparison, signals, threeHarmony, branchMatrix, overall, score } = result;

  return (
    <div className="space-y-4">
      {/* Compatibility Score Card */}
      {score && (
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="text-lg text-primary">คะแนนความเข้ากัน (Composite Compatibility Score)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Score Display */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-primary">{score.score}</span>
                  <span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <p className={`text-lg font-medium mt-2 ${
                  score.band === "harmonious-tendency" ? "text-green-700" :
                  score.band === "tension-tendency" ? "text-red-700" :
                  "text-blue-700"
                }`}>
                  {score.bandLabelTh}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>สัญญาณเสริม: <span className="font-medium text-green-700">{score.positive}</span></p>
                <p>สัญญาณต้าน: <span className="font-medium text-red-700">{score.negative}</span></p>
                <p>สูงสุด: <span className="font-medium">{score.maxPossible}</span></p>
              </div>
            </div>

            {/* Probabilistic Frame */}
            <div className="rounded-lg bg-muted/50 border border-muted-200 p-3">
              <p className="text-sm leading-relaxed text-muted-700">
                ⚠️ <strong>คะแนนเป็นแนวโน้มรวมจากสัญญาณหลายตัว</strong> — ไม่ใช่การรับประกันหรือฟันธงความสำเร็จของความสัมพันธ์ ความเข้ากันขึ้นอยู่กับปัจจัยหลายด้านที่นอกเหนือจากดวง
              </p>
            </div>

            {/* Expandable Breakdown */}
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-800 flex items-center gap-2">
                <span>📊</span>
                <span>ดูการให้คะแนนรายสัญญาณ (Full Weight Breakdown)</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 space-y-2">
                {/* Breakdown Table */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-2 text-left font-medium">สัญญาณ</th>
                        <th className="p-2 text-center font-medium">ทิศทาง</th>
                        <th className="p-2 text-center font-medium">น้ำหนัก</th>
                        <th className="p-2 text-center font-medium">คะแนน</th>
                        <th className="p-2 text-left font-medium">หมายเหตุ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {score.breakdown.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2 font-medium">{item.label}</td>
                          <td className="p-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              item.direction === "harmonious" ? "bg-green-100 text-green-900" :
                              item.direction === "tense" ? "bg-red-100 text-red-900" :
                              "bg-gray-100 text-gray-900"
                            }`}>
                              {item.direction === "harmonious" ? "✓ เสริม" :
                               item.direction === "tense" ? "✗ ต้าน" : "○ เป็นกลาง"}
                            </span>
                          </td>
                          <td className="p-2 text-center">{item.weight}</td>
                          <td className={`p-2 text-center font-medium ${
                            item.contribution > 0 ? "text-green-700" :
                            item.contribution < 0 ? "text-red-700" :
                            "text-gray-600"
                          }`}>
                            {item.contribution > 0 ? "+" : ""}{item.contribution}
                          </td>
                          <td className="p-2 text-xs text-muted-foreground">{item.note}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/30 font-medium">
                      <tr className="border-t-2">
                        <td className="p-2" colSpan={3}>ผลรวม</td>
                        <td className="p-2 text-center">
                          <span className="text-green-700">+{score.positive}</span> / <span className="text-red-700">-{score.negative}</span>
                        </td>
                        <td className="p-2 text-xs text-muted-foreground">คะแนนสุทธิ = {score.score}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Scoring Formula Explanation */}
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
                  <p className="font-medium mb-1">สูตรคำนวณ:</p>
                  <ul className="space-y-0.5 ml-4 list-disc">
                    <li>แต่ละสัญญาณ: น้ำหนัก × (+1 เสริม | -1 ต้าน | 0 เป็นกลาง)</li>
                    <li>คะแนน = 50 + ((ผลรวมเสริม - ผลรวมต้าน) ÷ ค่าสูงสุดทางทฤษฎี {score.maxPossible} × 50)</li>
                    <li>ช่วง: 0-100 (50 = กลาง, ≥62 = เข้ากันดี, ≤38 = มีแรงเสียดสี)</li>
                    <li>ค่าสูงสุด {score.maxPossible} = รวมน้ำหนัก categories ทั้งหมดที่เป็นไปได้ (ไม่ใช่แค่ที่พบ) — เพื่อให้มี headroom</li>
                  </ul>
                </div>
              </div>
            </details>
          </CardContent>
        </Card>
      )}

      {/* Day Master Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">เปรียบเทียบเจ้าวัน (Day Master)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Day masters info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{selfName}</p>
              <p className="font-medium">
                {ownerDayMaster.stem} ({ELEMENT_THAI[ownerDayMaster.element]})
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">{relativeName}</p>
              <p className="font-medium">
                {relatedDayMaster.stem} ({ELEMENT_THAI[relatedDayMaster.element]})
              </p>
            </div>
          </div>

          {/* Stem combination */}
          {dayMasterComparison.stemCombines && dayMasterComparison.transformElement && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-sm font-medium text-green-900">
                ✓ 天干五合 (แปรสภาพเป็น{ELEMENT_THAI[dayMasterComparison.transformElement]})
              </p>
              <p className="text-xs text-green-700 mt-1">
                {ownerDayMaster.stem} + {relatedDayMaster.stem} ผนึกกัน
              </p>
            </div>
          )}

          {/* Element interaction */}
          <div className={cn(
            "rounded-lg border p-3",
            dayMasterComparison.elementInteraction === "same" || dayMasterComparison.elementInteraction === "i-generate" || dayMasterComparison.elementInteraction === "generates-me"
              ? "bg-blue-50 border-blue-200"
              : "bg-amber-50 border-amber-200"
          )}>
            <p className="text-sm font-medium text-blue-900">
              ธาตุ: {dayMasterComparison.elementInteraction === "same" ? "เดียวกัน" :
                     dayMasterComparison.elementInteraction === "i-generate" ? "เกื้อกูล (เกิด)" :
                     dayMasterComparison.elementInteraction === "generates-me" ? "เกื้อกูล (ถูกเกิด)" :
                     dayMasterComparison.elementInteraction === "i-control" ? "คุม-ถูกคุม" : "ถูกคุม-คุม"}
            </p>
          </div>

          {/* Ten gods */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">{selfName} มอง {relativeName}</p>
              <p className="font-medium">{TEN_GOD_THAI[dayMasterComparison.tenGodOwnerSeesRelated]}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{relativeName} มอง {selfName}</p>
              <p className="font-medium">{TEN_GOD_THAI[dayMasterComparison.tenGodRelatedSeesOwner]}</p>
            </div>
          </div>

          {/* Reading */}
          {dayMasterComparison.reading && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm leading-relaxed">{dayMasterComparison.reading}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">สัญญาณความเข้ากัน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {signals.map((signal, idx) => (
              <Badge
                key={idx}
                variant={signal.direction === "harmonious" ? "default" :
                       signal.direction === "tense" ? "destructive" : "secondary"}
                className={cn(
                  "px-3 py-1 text-xs",
                  signal.direction === "harmonious" && "bg-green-100 text-green-900 hover:bg-green-200",
                  signal.direction === "tense" && "bg-red-100 text-red-900 hover:bg-red-200",
                  signal.direction === "neutral" && "bg-gray-100 text-gray-900 hover:bg-gray-200"
                )}
              >
                <span className="font-medium">{signal.label}</span>
                {signal.weight === "high" && <span className="ml-1 text-[10px]">⭐</span>}
              </Badge>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {signals.map((signal, idx) => (
              <div key={idx} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{signal.label}:</span> {signal.note}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Three Harmony */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">三合/半三合</CardTitle>
        </CardHeader>
        <CardContent>
          {threeHarmony.found ? (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-sm font-medium text-green-900">
                ✓ พบ {threeHarmony.type === "half" ? "半三合" : "三合"} ({threeHarmony.frame})
              </p>
              <div className="mt-2 text-xs text-green-700 space-y-1">
                <p>ชนิด: {threeHarmony.type === "half" ? "ครึ่ง" : "เต็ม"}</p>
                <p>ความแรง: {threeHarmony.strength === "strong" ? "แรง" : "อ่อน"}</p>
                {threeHarmony.transformElement && (
                  <p>แปรสภาพ: {ELEMENT_THAI[threeHarmony.transformElement]}</p>
                )}
                <p>สาขาที่มี: {threeHarmony.presentBranches.join("、")}</p>
                {threeHarmony.missingBranches.length > 0 && (
                  <p>ขาด: {threeHarmony.missingBranches.join("、")}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">ไม่มี三合/半三合ข้ามดวง</p>
          )}
        </CardContent>
      </Card>

      {/* Branch Matrix - Progressive Disclosure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">เมทริกซ์ปฏิสัมพันธ์ (冲合害刑)</CardTitle>
        </CardHeader>
        <CardContent>
          {/* High-weight cells only (default) */}
          <div className="space-y-2 mb-4">
            {/* Day-vs-day */}
            {(() => {
              const cell = branchMatrix.day.day;
              if (cell.interaction) {
                return (
                  <div className={cn(
                    "rounded-lg p-3 text-sm border",
                    cell.interaction === "合" ? "bg-green-50 border-green-200" :
                    cell.interaction === "冲" ? "bg-red-50 border-red-200" :
                    cell.interaction === "害" ? "bg-amber-50 border-amber-200" :
                    "bg-purple-50 border-purple-200"
                  )}>
                    <p className="font-medium">
                      วัน vs วัน: {cell.ownerBranch} + {cell.relatedBranch} = {cell.interaction}
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            {/* Other 冲/合 cells */}
            {Object.entries(branchMatrix).map(([ownerPos, row]) =>
              Object.entries(row).map(([relatedPos, cell]) => {
                if ((ownerPos !== "day" || relatedPos !== "day") && cell.interaction && (cell.interaction === "冲" || cell.interaction === "合")) {
                  return (
                    <div key={`${ownerPos}-${relatedPos}`} className={cn(
                      "rounded-lg p-3 text-sm border",
                      cell.interaction === "合" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    )}>
                      <p className="font-medium">
                        {ownerPos === "year" ? "ปี" : ownerPos === "month" ? "เดือน" : ownerPos === "hour" ? "ชั่วโมง" : "วัน"} vs {relatedPos === "year" ? "ปี" : relatedPos === "month" ? "เดือน" : relatedPos === "hour" ? "ชั่วโมง" : "วัน"}: {cell.ownerBranch} + {cell.relatedBranch} = {cell.interaction}
                      </p>
                    </div>
                  );
                }
                return null;
              })
            )}
          </div>

          {/* Progressive disclosure - full matrix */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-800">
              ดูเมทริกซ์เต็ม (4×4)
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">เสา</th>
                    <th className="p-2 text-center font-medium">ปี</th>
                    <th className="p-2 text-center font-medium">เดือน</th>
                    <th className="p-2 text-center font-medium">วัน</th>
                    <th className="p-2 text-center font-medium">ชั่วโมง</th>
                  </tr>
                </thead>
                <tbody>
                  {(["year", "month", "day", "hour"] as const).map((ownerPos) => (
                    <tr key={ownerPos} className="border-b">
                      <td className="p-2 font-medium">
                        {ownerPos === "year" ? "ปี" : ownerPos === "month" ? "เดือน" : ownerPos === "hour" ? "ชั่วโมง" : "วัน"}
                      </td>
                      {(["year", "month", "day", "hour"] as const).map((relatedPos) => {
                        const cell = branchMatrix[ownerPos][relatedPos];
                        return (
                          <td key={`${ownerPos}-${relatedPos}`} className={cn(
                            "p-2 text-center",
                            cell.interaction === "合" ? "bg-green-50 text-green-900" :
                            cell.interaction === "冲" ? "bg-red-50 text-red-900" :
                            cell.interaction === "害" ? "bg-amber-50 text-amber-900" :
                            cell.interaction === "刑" ? "bg-purple-50 text-purple-900" : ""
                          )}>
                            {cell.interaction || "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </CardContent>
      </Card>

      {/* Overall */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg text-primary">ภาพรวมความเข้ากัน</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{overall}</p>
        </CardContent>
      </Card>
    </div>
  );
}
