/**
 * RelationshipSection component - วิเคราะห์ความสัมพันธ์ (คู่ครอง + ครอบครัว + จังหวะความรัก)
 * ใช้ R1 engine modules: spouse-analysis, marriage-timing, six-relatives
 */

"use client";

import type { Profile } from "@/types/profile";
import type { BaZiAnalysis } from "@/lib/bazi/use-bazi-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { analyzeSpouse } from "@/lib/bazi/spouse-analysis";
import { scanMarriageWindows } from "@/lib/bazi/marriage-timing";
import { getSixRelatives } from "@/lib/bazi/six-relatives";
import { analyzeRomanceStars } from "@/lib/bazi/romance-stars";
import { RELATIONSHIP_ROLE_LABELS } from "@/lib/bazi/relationship-labels";
import { TEN_GOD_THAI } from "@/types/bazi-gods-stars";

interface RelationshipSectionProps {
  profile: Profile;
  analysis: BaZiAnalysis;
}

/**
 * แสดงส่วนวิเคราะห์ความสัมพันธ์ทั้งหมด
 */
export function RelationshipSection({ profile, analysis }: RelationshipSectionProps) {
  const spouseAnalysis = analyzeSpouse(
    analysis.chart,
    profile.gender,
    analysis.strength,
    analysis.usefulGod,
    analysis.tenGodProfile,
    analysis.palace
  );

  const currentYear = new Date().getFullYear();
  const marriageTiming = scanMarriageWindows(
    analysis.luck,
    profile,
    analysis.chart,
    currentYear
  );

  const sixRelatives = getSixRelatives(profile.gender);
  const romanceStars = analyzeRomanceStars(analysis.chart, profile.gender);

  return (
    <div className="space-y-6">
      {/* 1. คู่ครอง (Spouse) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">คู่ครอง (Spouse)</CardTitle>
          {profile.relationship === "spouse" && (
            <div className="text-sm text-muted-foreground">
              ดวงนี้คือคู่ครองของคุณ
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Spouse Stars */}
          <div className="space-y-2">
            <div className="text-sm font-medium">ดาวคู่ครอง</div>
            <div className="flex flex-wrap gap-2">
              {spouseAnalysis.star.stars.map((star) => (
                <Badge key={star} variant="outline" className="text-sm">
                  {TEN_GOD_THAI[star]}
                </Badge>
              ))}
              {spouseAnalysis.star.present && (
                <Badge
                  variant={spouseAnalysis.star.dominant ? "default" : "secondary"}
                  className="text-xs"
                >
                  {spouseAnalysis.star.dominant ? "เด่น" : "มี"}
                </Badge>
              )}
              {!spouseAnalysis.star.present && (
                <Badge variant="outline" className="text-xs">
                  ไม่พบ
                </Badge>
              )}
            </div>
            {spouseAnalysis.star.isUsefulGod && (
              <Badge variant="default" className="text-xs">
                用神 (เสริมดวง)
              </Badge>
            )}
            {spouseAnalysis.star.isAvoidGod && (
              <Badge variant="destructive" className="text-xs">
                忌神 (ใช้ความพยายาม)
              </Badge>
            )}
          </div>

          <Separator />

          {/* Spouse Star Reading */}
          <div className="text-sm text-muted-foreground whitespace-pre-line">
            {spouseAnalysis.star.reading}
          </div>

          <Separator />

          {/* Spouse Palace */}
          <div className="space-y-2">
            <div className="text-sm font-medium">คู่สมรส (Spouse Palace)</div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{spouseAnalysis.palace.branch}</span>
              <Badge
                variant={
                  spouseAnalysis.palace.stability === "stable"
                    ? "default"
                    : spouseAnalysis.palace.stability === "clashed"
                      ? "destructive"
                      : spouseAnalysis.palace.stability === "combined"
                        ? "default"
                        : "secondary"
                }
                className="text-xs"
              >
                {spouseAnalysis.palace.stability === "stable" && "มั่นคง"}
                {spouseAnalysis.palace.stability === "clashed" && "ถูกชง"}
                {spouseAnalysis.palace.stability === "combined" && "หกธรรม"}
                {spouseAnalysis.palace.stability === "neutral" && "ปกติ"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {TEN_GOD_THAI[spouseAnalysis.palace.primaryTenGod]}
              </span>
            </div>
            {spouseAnalysis.palace.interactions.length > 0 && (
              <div className="text-xs text-muted-foreground">
                ปฏิสัมพันธ์:{" "}
                {spouseAnalysis.palace.interactions.map((i) => {
                  const posTh =
                    i.otherPosition === "year"
                      ? "ปี"
                      : i.otherPosition === "month"
                        ? "เดือน"
                        : "ชั่วโมง";
                  const typeTh =
                    i.type === "冲"
                      ? "ชง"
                      : i.type === "合"
                        ? "ร่วม"
                        : i.type === "害"
                          ? "ระยำ"
                          : "ลงโทษ";
                  return `${posTh} (${i.otherBranch}) ${typeTh}`;
                }).join("、")}
              </div>
            )}
          </div>

          <Separator />

          {/* Palace Reading */}
          <div className="text-sm text-muted-foreground whitespace-pre-line">
            {spouseAnalysis.palace.reading}
          </div>

          <Separator />

          {/* Cross-Check + Overall */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {spouseAnalysis.crossCheckReading}
            </div>
            <div className="text-sm font-medium text-foreground">
              {spouseAnalysis.overall}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. ดาวความรัก (Romance Stars) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">ดาวความรัก (Romance Stars)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stars List */}
          <div className="space-y-3">
            {romanceStars.relevantForGender.map((star) => (
              <div
                key={star.name}
                className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{star.nameTh}</span>
                    <Badge variant={star.present ? "default" : "outline"} className="text-xs">
                      {star.present ? "ปรากฏ" : "ไม่ปรากฏ"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{star.meaning}</div>
                  {star.present && star.positions.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      ตำแหน่ง:{" "}
                      {star.positions.map((pos) =>
                        pos === "year"
                          ? "ปี"
                          : pos === "month"
                            ? "เดือน"
                            : pos === "day"
                              ? "วัน"
                              : "ชั่วโมง"
                      ).join("、")}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {star.starBranch}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Reading */}
          <div className="text-sm text-muted-foreground whitespace-pre-line">
            {romanceStars.reading}
          </div>
        </CardContent>
      </Card>

      {/* 3. ครอบครัว (六亲) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">ครอบครัว (六亲)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(sixRelatives).map(([role, stars]) => {
              const roleKey = role as keyof typeof RELATIONSHIP_ROLE_LABELS;
              const starsThai = stars.map((s) => TEN_GOD_THAI[s]).join("、");

              // ตรวจสถานะจาก tenGodProfile
              const isDominant = stars.some((star) =>
                analysis.tenGodProfile.dominantGods.includes(star)
              );
              const isPresent = stars.some(
                (star) => analysis.tenGodProfile.counts[star] > 0
              );

              const statusBadge = isDominant ? (
                <Badge variant="default" className="text-xs">
                  เด่น
                </Badge>
              ) : isPresent ? (
                <Badge variant="secondary" className="text-xs">
                  มี
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  ขาด
                </Badge>
              );

              return (
                <div
                  key={role}
                  className="flex items-start justify-between gap-2 p-3 rounded-lg border border-border"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {RELATIONSHIP_ROLE_LABELS[roleKey]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {starsThai}
                    </div>
                  </div>
                  {statusBadge}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. จังหวะความรัก (Marriage Timing) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">จังหวะความรัก (Marriage Timing)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timing Reliability */}
          <div className="flex items-center gap-2">
            <Badge
              variant={marriageTiming.timingReliability === "reliable" ? "default" : "secondary"}
              className="text-xs"
            >
              {marriageTiming.timingReliability === "reliable" ? "ความแม่นยำสูง" : "ความแม่นยำปานกลาง"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {marriageTiming.reliabilityNote}
            </span>
          </div>

          <Separator />

          {/* Marriage Windows */}
          {marriageTiming.windows.length > 0 ? (
            <div className="space-y-4">
              {/* Decade Windows (大运) */}
              {marriageTiming.decadeWindows.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">大运 (ทศวัตร)</div>
                  <div className="space-y-2">
                    {marriageTiming.decadeWindows.map((window, idx) => (
                      <div
                        key={`decade-${idx}`}
                        className="p-3 rounded-lg border border-border bg-muted/30"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-medium">
                            อายุ {window.ageRange}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {window.type === "spouse_star_stem" && "ดาวคู่"}
                            {window.type === "spouse_palace_branch" && "คู่สมรส"}
                            {window.type === "spouse_palace_combined" && "หกธรรม"}
                            {window.type === "spouse_palace_clashed" && "ชง"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {window.signal}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Annual Windows (流年) */}
              {marriageTiming.annualWindows.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">流年 (รายปี)</div>
                  <div className="space-y-2">
                    {marriageTiming.annualWindows.map((window, idx) => {
                      const birthYear = parseInt(profile.birthDate.split('-')[0], 10);
                      const age = window.year ? window.year - birthYear : "N/A";
                      return (
                        <div
                          key={`annual-${idx}`}
                          className="p-3 rounded-lg border border-border bg-muted/30"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-medium">
                              ปี {window.year} (อายุ ~{age})
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {window.type === "spouse_star_stem" && "ดาวคู่"}
                              {window.type === "spouse_palace_branch" && "คู่สมรส"}
                              {window.type === "spouse_palace_combined" && "หกธรรม"}
                              {window.type === "spouse_palace_clashed" && "ชง"}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {window.signal}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {marriageTiming.reading}
            </div>
          )}

          <Separator />

          {/* Reading */}
          <div className="text-xs text-muted-foreground whitespace-pre-line">
            {marriageTiming.reading}
          </div>

          {/* Scope Note */}
          <div className="text-xs text-muted-foreground italic">
            อ่านระดับ大运 (ทศวัฒน์) + 流年 (วัตถุปัจจัยประจำปี) — เดือน (月运) ยังไม่รวม
          </div>
        </CardContent>
      </Card>

      {/* 5. สรุป (Synthesis) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">สรุป</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground whitespace-pre-line">
            {spouseAnalysis.overall}
          </div>
          <Separator />
          <div className="text-xs text-muted-foreground italic">
            คำทำนายเป็นแนวโน้ม ไม่ฟันธง — ใช้เป็นแนวทางพิจารณาเท่านั้น
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
