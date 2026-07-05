/**
 * Luck Favorability (大运流年 รุ่ง/ระวัง) — เทียบธาตุใน luck pillar/annual
 * กับ 用神 (useful god) / 忌神 (avoid) ของดวง
 *
 * 子平 principle: luck pillar ที่ "เติม 用神/喜神" = ช่วงรุ่ง;
 *   ที่ "เติม 忌神" = ช่วงระวัง; อื่นๆ = กลาง
 *   ดูทั้ง stem element + branch element ของ pillar
 *
 * PURE FUNCTION — อ่าน LuckAnalysis + UsefulGodAnalysis (คำนวณแล้ว); serializable
 * ไม่ฟันธงเรื่องร้ายแรง — เป็นเพียงเคอร์เซอร์ "ช่วงไหนน่าโฟกัส/ระวัง" เท่านั้น
 */

import type { ElementName } from "./types";
import type {
  LuckAnalysis,
  LuckPillar,
} from "../../types/bazi-luck";
import type { UsefulGodAnalysis } from "../../types/bazi-useful-god";

export type Favorability = "favorable" | "neutral" | "unfavorable";

export interface LuckPillarFavorability {
  index: number;
  startAge: number;
  endAge: number;
  sixtyCycleName: string;
  /** true ถ้าเป็น pillar ปัจจุบัน */
  isCurrent: boolean;
  favorability: Favorability;
  favorabilityTh: string;
  /** คะแนนสุทธิ (positive = รุ่ง) */
  score: number;
  /** ส่วนประกอบที่ให้คะแนน (ไทย) */
  reasons: string[];
}

export interface LuckFavorabilityAnalysis {
  /** ทุก luck pillar พร้อม favorability */
  pillars: LuckPillarFavorability[];
  /** pillar ปัจจุบัน (null ถ้าไม่มี) */
  current: LuckPillarFavorability | null;
  /** ดวงรายปีปัจจุบัน พร้อม favorability (null ถ้าไม่มี) */
  annual: LuckPillarFavorability | null;
}

const FAVOR_THAI: Record<Favorability, string> = {
  favorable: "รุ่ง",
  neutral: "กลาง",
  unfavorable: "ระวัง",
};

const YONG_SHEN_WEIGHT = 1; // 用神 (primary)
const XI_SHEN_WEIGHT = 0.5; // 喜神 (secondary)
const JI_SHEN_WEIGHT = -1; // 忌神 (avoid)

/**
 * วิเคราะห์ favorability ของ luck pillars + annual
 */
export function analyzeLuckFavorability(
  luck: LuckAnalysis,
  usefulGod: UsefulGodAnalysis
): LuckFavorabilityAnalysis {
  const pillars = luck.pillars.map((p) => scorePillar(p, usefulGod));
  const current = pillars.find((p) => p.isCurrent) ?? null;

  let annual: LuckPillarFavorability | null = null;
  if (luck.currentAnnual) {
    const a = luck.currentAnnual;
    annual = {
      index: -1,
      startAge: a.year,
      endAge: a.year,
      sixtyCycleName: a.sixtyCycleName,
      isCurrent: true,
      ...scoreElements(
        stemElementOf(a.sixtyCycleName),
        branchElementOf(a.sixtyCycleName),
        a.sixtyCycleName,
        usefulGod,
        "รายปี"
      ),
    };
  }

  return { pillars, current, annual };
}

function scorePillar(
  pillar: LuckPillar,
  ug: UsefulGodAnalysis
): LuckPillarFavorability {
  const scored = scoreElements(
    pillar.stem.element,
    pillar.branch.element,
    pillar.sixtyCycleName,
    ug,
    "大运"
  );
  return {
    index: pillar.index,
    startAge: pillar.startAge,
    endAge: pillar.endAge,
    sixtyCycleName: pillar.sixtyCycleName,
    isCurrent: pillar.isCurrent,
    ...scored,
  };
}

/** ให้คะแนน stem+branch element เทียบ 用神/喜神/忌神 */
function scoreElements(
  stemEl: ElementName | null,
  branchEl: ElementName | null,
  cycleName: string,
  ug: UsefulGodAnalysis,
  contextLabel: string
): { favorability: Favorability; favorabilityTh: string; score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  const parts: Array<{ kind: string; el: ElementName | null }> = [
    { kind: "stem", el: stemEl },
    { kind: "branch", el: branchEl },
  ];

  for (const { kind, el } of parts) {
    if (!el) continue;
    const elName = `${kind} ${el}`;
    if (el === ug.primaryElement) {
      score += YONG_SHEN_WEIGHT;
      reasons.push(`${elName} = 用神 (เติมธาตุประโยชน์หลัก)`);
    } else if (ug.secondaryElements.includes(el)) {
      score += XI_SHEN_WEIGHT;
      reasons.push(`${elName} = 喜神 (เติมธาตุรอง)`);
    } else if (ug.avoidElements.includes(el)) {
      score += JI_SHEN_WEIGHT;
      reasons.push(`${elName} = 忌神 (เติมธาตุควรหลีกเลี่ยง)`);
    }
  }

  if (reasons.length === 0) {
    reasons.push(`${contextLabel} ${cycleName} ไม่เติม 用/喜/忌 โดยตรง`);
  }

  const favorability: Favorability =
    score > 0 ? "favorable" : score < 0 ? "unfavorable" : "neutral";

  return { favorability, favorabilityTh: FAVOR_THAI[favorability], score, reasons };
}

/** แปลง stem name (char แรกของ sixtyCycleName) → element */
const STEM_ELEMENT: Record<string, ElementName> = {
  甲: "木", 乙: "木",
  丙: "火", 丁: "火",
  戊: "土", 己: "土",
  庚: "金", 辛: "金",
  壬: "水", 癸: "水",
};

/** แปลง branch name (char ที่ 2 ของ sixtyCycleName) → element */
const BRANCH_ELEMENT: Record<string, ElementName> = {
  子: "水", 亥: "水",
  寅: "木", 卯: "木",
  巳: "火", 午: "火",
  申: "金", 酉: "金",
  丑: "土", 辰: "土", 未: "土", 戌: "土",
};

/** สรุปภาพรวม timeline ทั้ง 8 ช่วง — สำหรับ narrative "จังหวะเวลา" */
export interface LuckTimelineSummary {
  total: number;
  favorable: number;
  neutral: number;
  unfavorable: number;
  /** ช่วงที่ score สูงสุด (peak = รุ่งสุด) */
  peak: LuckPillarFavorability | null;
  /** ช่วงที่ score ต่ำสุด (valley = ระวังสุด) */
  valley: LuckPillarFavorability | null;
  /** สรุปภาพรวมไทย */
  summary: string;
}

/**
 * สรุปภาพรวม luck timeline — กี่ช่วงรุ่ง/กลาง/ระวัง + peak/valley
 */
export function summarizeLuckTimeline(
  lf: LuckFavorabilityAnalysis
): LuckTimelineSummary {
  const pillars = lf.pillars;
  const favorable = pillars.filter((p) => p.favorability === "favorable").length;
  const neutral = pillars.filter((p) => p.favorability === "neutral").length;
  const unfavorable = pillars.filter((p) => p.favorability === "unfavorable").length;

  // peak = score สูงสุด (ถ้ามี favorable), valley = score ต่ำสุด (ถ้ามี unfavorable)
  const peak =
    [...pillars].sort((a, b) => b.score - a.score)[0] ?? null;
  const valley =
    [...pillars].sort((a, b) => a.score - b.score)[0] ?? null;

  const peakLabel = peak && peak.score > 0 ? `${peak.sixtyCycleName} (${peak.startAge}–${peak.endAge})` : null;
  const valleyLabel = valley && valley.score < 0 ? `${valley.sixtyCycleName} (${valley.startAge}–${valley.endAge})` : null;

  const summary =
    `ตลอด ${pillars.length} ช่วง: รุ่ง ${favorable} · กลาง ${neutral} · ระวัง ${unfavorable}` +
    (peakLabel ? ` — รุ่งสุดที่ ${peakLabel}` : "") +
    (valleyLabel ? ` · ระวังสุดที่ ${valleyLabel}` : "");

  return { total: pillars.length, favorable, neutral, unfavorable, peak, valley, summary };
}

function stemElementOf(cycleName: string): ElementName | null {
  const stem = cycleName[0];
  return STEM_ELEMENT[stem] ?? null;
}

function branchElementOf(cycleName: string): ElementName | null {
  const branch = cycleName[1];
  return BRANCH_ELEMENT[branch] ?? null;
}
