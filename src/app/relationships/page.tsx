/**
 * Relationships Page - ความสัมพันธ์ (关系/合婚)
 * หน้าเทียบดวงคู่/ครอบครัว/เพื่อน — วิเคราะห์ความเข้ากันแบบรวมศาสตร์ปาจื้อ
 */

"use client";

import { useState, useEffect } from "react";
import { useProfiles } from "@/lib/stores/use-hydrated";
import { useCachedAnalysis } from "@/lib/bazi/use-cached-analysis";
import { analyzeCrossChart } from "@/lib/bazi/cross-chart";
import { analyzeSpouse } from "@/lib/bazi/spouse-analysis";
import { PairPicker } from "@/components/relationships/pair-picker";
import { CrossChartCard } from "@/components/relationships/cross-chart-card";
import { SpouseSummaryCard } from "@/components/relationships/spouse-summary-card";
import {
  EmptyStatePanel,
  LoadingPanel,
  PageFrame,
  PageSection,
  RouteHeader,
} from "@/components/layout/page-patterns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users } from "lucide-react";

export default function RelationshipsPage() {
  const { profiles, isHydrated } = useProfiles();
  const [selfId, setSelfId] = useState<string>("");
  const [relativeId, setRelativeId] = useState<string>("");

  // Set default profiles on mount/profiles change
  useEffect(() => {
    if (profiles.length >= 1 && !selfId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelfId(profiles[0].id); // Owner = first profile
    }
    if (profiles.length >= 2 && !relativeId) {
       
      setRelativeId(profiles[1].id); // Relative = second profile
    }
   
  }, [profiles, selfId, relativeId]);

  const currentYear = new Date().getFullYear();

  // Get cached analyses
  const selfProfile = profiles.find((p) => p.id === selfId) || null;
  const relativeProfile = profiles.find((p) => p.id === relativeId) || null;

  const selfAnalysis = useCachedAnalysis(selfProfile, currentYear);
  const relativeAnalysis = useCachedAnalysis(relativeProfile, currentYear);

  // Loading state
  if (!isHydrated) {
    return (
      <PageFrame maxWidth="wide">
        <RouteHeader
          eyebrow="关系/合婚"
          title="ความสัมพันธ์"
          description="เทียบดวงคู่/ครอบครัว — วิเคราะห์ความเข้ากันแบบรวมศาสตร์ปาจื้อ"
        />
        <LoadingPanel title="ความสัมพันธ์ (关系)" description="กำลังโหลดโปรไฟล์..." />
      </PageFrame>
    );
  }

  // Empty state (no profiles)
  if (profiles.length === 0) {
    return (
      <PageFrame maxWidth="wide">
        <RouteHeader
          eyebrow="关系/合婚"
          title="ความสัมพันธ์"
          description="เทียบดวงคู่/ครอบครัว — วิเคราะห์ความเข้ากันแบบรวมศาสตร์ปาจื้อ"
        />
        <EmptyStatePanel
          title="ยังไม่มีโปรไฟล์"
          description="ต้องสร้างโปรไฟล์อย่างน้อย 2 โปรไฟล์เพื่อเทียบดวงความเข้ากัน ไปสร้างโปรไฟล์ของคุณและคนที่ต้องการเทียบดวงก่อน"
        >
          <Button asChild size="lg">
            <Link href="/profiles">
              <Users className="w-4 h-4 mr-2" />
              ไปที่หน้าโปรไฟล์
            </Link>
          </Button>
        </EmptyStatePanel>
      </PageFrame>
    );
  }

  // Need-2 state (only 1 profile)
  if (profiles.length === 1) {
    return (
      <PageFrame maxWidth="wide">
        <RouteHeader
          eyebrow="关系/合婚"
          title="ความสัมพันธ์"
          description="เทียบดวงคู่/ครอบครัว — วิเคราะห์ความเข้ากันแบบรวมศาสตร์ปาจื้อ"
        />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <PageSection title="ต้องมีอย่างน้อย 2 โปรไฟล์">
              <div className="rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  การเทียบดวงความเข้ากันต้องใช้ข้อมูลของ 2 คน คุณมีโปรไฟล์อยู่ 1 โปรไฟล์ กรุณาสร้างอีก 1 โปรไฟล์เพื่อเริ่มวิเคราะห์
                </p>
                <Button asChild>
                  <Link href="/profiles">
                    <Users className="w-4 h-4 mr-2" />
                    สร้างโปรไฟล์เพิ่ม
                  </Link>
                </Button>
              </div>
            </PageSection>
          </div>
        </div>
      </PageFrame>
    );
  }

  // Ready state (2+ profiles)
  return (
    <PageFrame maxWidth="wide">
      <RouteHeader
        eyebrow="关系/合婚"
        title="ความสัมพันธ์"
        description="เทียบดวงคู่/ครอบครัว — วิเคราะห์ความเข้ากันแบบรวมศาสตร์ปาจื้อ"
      />

      {/* Pair picker */}
      <PageSection>
        <PairPicker
          profiles={profiles}
          selfId={selfId}
          relativeId={relativeId}
          onSelfChange={setSelfId}
          onRelativeChange={setRelativeId}
        />
      </PageSection>

      {/* Scope note */}
      <div className="mx-4 mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 sm:mx-0">
        <p className="font-medium">⚠️ ข้อจำกัดของการวิเคราะห์ความเข้ากัน:</p>
        <p className="mt-1">
          ผลการวิเคราะห์ความเข้ากันเป็นแนวโน้มที่อิงกับสมดุลธาตุและปฏิสัมพันธ์ในดวง ไม่ใช่การฟันธงความสำเร็จหรือความล้มเหลวของความสัมพันธ์
          ปัจจัยภายนอกเช่นความพยายาม การเข้าใจ และสถานการณ์ทางสังคมก็มีความสำคัญ อ่านจากสัญญาณหลายตัวร่วมกัน
        </p>
      </div>

      {/* Analysis content */}
      {!selfAnalysis || !relativeAnalysis ? (
        <PageSection>
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">กำลังคำนวณ...</p>
          </div>
        </PageSection>
      ) : (
        <PageSection>
          {/* Cross-chart analysis */}
          <div className="mb-6">
            <CrossChartCard
              result={analyzeCrossChart(selfAnalysis.chart, relativeAnalysis.chart)}
              selfName={selfProfile?.name || ""}
              relativeName={relativeProfile?.name || ""}
            />
          </div>

          {/* Spouse summaries side-by-side */}
          <div className="grid gap-4 md:grid-cols-2">
            <SpouseSummaryCard
              name={selfProfile?.name || ""}
              spouse={analyzeSpouse(
                selfAnalysis.chart,
                selfProfile?.gender || "male",
                selfAnalysis.strength,
                selfAnalysis.usefulGod,
                selfAnalysis.tenGodProfile,
                selfAnalysis.palace
              )}
            />
            <SpouseSummaryCard
              name={relativeProfile?.name || ""}
              spouse={analyzeSpouse(
                relativeAnalysis.chart,
                relativeProfile?.gender || "male",
                relativeAnalysis.strength,
                relativeAnalysis.usefulGod,
                relativeAnalysis.tenGodProfile,
                relativeAnalysis.palace
              )}
            />
          </div>
        </PageSection>
      )}
    </PageFrame>
  );
}
