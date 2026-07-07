/**
 * BaZi Page - หน้าวิเคราะห์ปาจื้อ (八字)
 * แสดง Natal Chart + การวิเคราะห์ทั้งหมด
 */

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { NatalChart } from "@/components/bazi/natal-chart";
import { DayMasterCard } from "@/components/bazi/day-master-card";
import { StrengthCard } from "@/components/bazi/strength-card";
import { StructureCard } from "@/components/bazi/structure-card";
import { UsefulGodCard } from "@/components/bazi/useful-god-card";
import { TenGodsView } from "@/components/bazi/ten-gods-view";
import { StarsView } from "@/components/bazi/stars-view";
import { InteractionsView } from "@/components/bazi/interactions-view";
import { TenGodProfileView } from "@/components/bazi/ten-god-profile-view";
import { LuckTimelineView } from "@/components/bazi/luck-timeline";
import { ElementCompositionView } from "@/components/bazi/element-composition-view";
import { DestinyHero } from "@/components/bazi/destiny-hero";
import { InsightNarrative } from "@/components/bazi/insight-narrative";
import { RelationshipSection } from "@/components/bazi/relationship-section";
import { Heart } from "lucide-react";
import { useActiveProfileSafe } from "@/lib/stores/use-hydrated";
import {
  useBaZiAnalysis,
  type BaZiAnalysis,
} from "@/lib/bazi/use-bazi-analysis";
import { getArchetype } from "@/lib/bazi/archetypes";
import { buildBaZiNarrativeV2 } from "@/lib/bazi/narrative-v2";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  EmptyStatePanel,
  LoadingPanel,
  PageFrame,
  PageSection,
  RouteHeader,
} from "@/components/layout/page-patterns";
import { RevealContent } from "@/components/ui/motion";
import type { Profile } from "@/types/profile";

export default function BaziPage() {
  const activeProfile = useActiveProfileSafe();
  const analysis = useBaZiAnalysis(activeProfile);

  // ไม่มีโปรไฟล์ → empty state (ไม่ใช่ loading swap, เป็น early return)
  if (activeProfile === null) {
    return (
      <PageFrame maxWidth="narrow">
        <RouteHeader
          eyebrow="八字"
          title="ปาจื้อ"
          description="โมดูลคำนวณปาจื้อและวิเคราะห์ดวงชะตา"
        />
        <EmptyStatePanel
          title="ยังไม่ได้เลือกโปรไฟล์"
          description="สร้างหรือเลือกโปรไฟล์ก่อนเริ่มวิเคราะห์ เพื่อให้แผนผัง 4 เสาและคำอธิบายอิงข้อมูลเกิดของคุณ"
        >
          <Button asChild size="lg">
            <Link href="/profiles">ไปที่หน้าโปรไฟล์</Link>
          </Button>
        </EmptyStatePanel>
      </PageFrame>
    );
  }

  // analysis คำนวณ async → LoadingPanel cross-fade เป็น content ผ่าน RevealContent
  return (
    <PageFrame maxWidth="narrow">
      <RevealContent
        loading={analysis === null}
        fallback={
          <LoadingPanel
            title="ปาจื้อ (八字)"
            description="กำลังคำนวณแผนผังและสมดุลธาตุ..."
          />
        }
      >
        {analysis && (
          <BaziContent analysis={analysis} profile={activeProfile} />
        )}
      </RevealContent>
    </PageFrame>
  );
}

/** เนื้อหาหลักของ /bazi — รับ analysis ที่ non-null เสมอ (แยกออกเพื่อให้ cross-fade ระหว่าง skeleton↔content ทำงานได้) */
function BaziContent({
  analysis,
  profile,
}: {
  analysis: BaZiAnalysis;
  profile: Profile;
}) {
  const [tab, setTab] = useState<"overview" | "chart" | "details" | "relationship">("overview");

  const { chart, strength, structure, usefulGod, godsAndStars, luck, elements } = analysis;

  // Get archetype for day master
  const archetype = getArchetype({
    name: strength.dayMaster.name,
    element: strength.dayMaster.element,
    yinYang: chart.dayMaster.yinYang ? "yin" : "yang",
  });

  // Build narrative insight flow (v2 — ผูกดวงจริง via ten god profile/palace/luck favorability)
  const narrative = buildBaZiNarrativeV2({
    profileName: profile.name,
    analysis,
    tenGodProfile: analysis.tenGodProfile,
    palace: analysis.palace,
    luckFavorability: analysis.luckFavorability,
    archetype,
  });

  return (
    <>
      <RouteHeader
        eyebrow="八字"
        title="ปาจื้อ"
        description="วิเคราะห์ดวงชะตาจาก 4 เสา พร้อม Day Master, 用神, ดาว และเสาโชค"
        meta={
          <span className="text-sm font-medium text-element-fire">
            เจ้าวัน: {strength.dayMaster.name}
          </span>
        }
      />

      {/* Mobile tab bar — เฉพาะ mobile. Desktop เห็นทุก section เพราะ max-md:hidden ไม่มีผลที่ md+ */}
      <div className="sticky top-16 z-30 -mx-4 mb-1 px-4 md:hidden">
        <div
          role="tablist"
          aria-label="ส่วนของดวง"
          className="flex gap-1 rounded-xl bg-muted p-1"
        >
          {(
            [
              ["overview", "ภาพรวม"],
              ["chart", "แผนผัง"],
              ["details", "รายละเอียด"],
              ["relationship", "ความสัมพันธ์", Heart],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5",
                tab === id ? "bg-card text-ink shadow-sm" : "text-muted-foreground",
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ภาพรวม — DestinyHero + InsightNarrative */}
      <div className={tab !== "overview" ? "max-md:hidden" : undefined}>
        <PageSection>
          <DestinyHero
            strength={strength}
            structure={structure}
            usefulGod={usefulGod}
            profileName={profile.name}
            birthDate={profile.birthDate}
          />
        </PageSection>
        <PageSection title="สิ่งที่คุณอยากรู้">
          <InsightNarrative narrative={narrative} />
        </PageSection>
      </div>

      {/* แผนผัง — NatalChart + ElementComposition */}
      <div className={tab !== "chart" ? "max-md:hidden" : undefined}>
        <PageSection title="แผนผัง 4 เสา (Natal Chart)">
          <NatalChart chart={chart} />
        </PageSection>
        <PageSection title="สมดุลธาตุ">
          <ElementCompositionView elements={elements} />
        </PageSection>
      </div>

      {/* รายละเอียด — 4 detail cards + TenGods/Stars/Luck */}
      <div className={tab !== "details" ? "max-md:hidden" : undefined}>
        <PageSection title="การวิเคราะห์เชิงลึก">
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <DayMasterCard strength={strength} />
            <StrengthCard strength={strength} />
            <StructureCard structure={structure} />
            <UsefulGodCard usefulGod={usefulGod} />
          </div>
          <div className="mt-4">
            <TenGodProfileView profile={analysis.tenGodProfile} />
          </div>
        </PageSection>
        <PageSection title="รายละเอียดเพิ่มเติม">
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <TenGodsView godsAndStars={godsAndStars} chart={chart} />
            <StarsView godsAndStars={godsAndStars} />
            <LuckTimelineView luck={luck} favorabilities={analysis.luckFavorability.pillars} />
          </div>
        </PageSection>
        <PageSection title="ปฏิสัมพันธ์ในดวง">
          <InteractionsView
            interactions={analysis.interactions}
            threeHarmony={analysis.threeHarmony}
            stemCombinations={analysis.stemCombinations}
          />
        </PageSection>
      </div>

      {/* ความสัมพันธ์ — RelationshipSection */}
      <div className={tab !== "relationship" ? "max-md:hidden" : undefined}>
        <PageSection
          title="ความสัมพันธ์"
          description="วิเคราะห์คู่ครอง ครอบครัว และจังหวะความรักจากดวงจีน"
        >
          <RelationshipSection profile={profile} analysis={analysis} />
        </PageSection>
      </div>
    </>
  );
}
