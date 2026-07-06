/**
 * 合婚 Cross-Chart Compatibility Analysis — การวิเคราะห์ความเข้ากันของดวงคู่
 *
 * โมดูลนี้คำนวณความเข้ากันระหว่าง BaZi Chart สองอัน (เช่น สามี vs ภรรยา) โดย
 * รวบวิเคราะห์:
 * - 天干五合 (Stem Combinations) — การผนึกกันของ天干 10 ตัว
 * - 三合/半三合 (Three-way Harmony) — การผนึกกันของ地支 3 ตัวหรือ 2 ตัว
 * - 冲合害刑 (Branch Interactions) — ปฏิสัมพันธ์ระหว่าง地支 (ชง/ร่วม/ระยำ/ลงโทษ)
 * - Day Master Ten God — ธาตุ day master มองกันเป็น 10 god อะไร
 * - Element Interaction — ความสัมพันธ์ธาตุ (เดียวกัน/กำเนิด/กำหนด/ถูกคุม/คุม)
 *
 * ผลลัพธ์เป็น CrossChartAnalysis ที่มี:
 * - 4×4 stem matrix (天干五合)
 * - 4×4 branch matrix (冲合害刑)
 * - three-harmony scan (三合/半三合)
 * - weighted signals (ปัจจัยเสริม/ปัจจัยต้าน — transparent, no black-box score)
 * - overall reading (ภาพรวมแบบ probabilistic ไม่ doom-say)
 *
 * ⚠️ DUTY-OF-CARE (หน้าที่ต่อผู้ใช้):
 * - ห้ามฟันธง categorical negative verdicts: "หย่าร้าง/เลิกรา/ไม่ควรคบ/คู่แต่งไม่ติด"
 * - ความเข้ากันเป็นเรื่อง multi-factor: day-branch clash ถูก offset ด้วย stem 五合/三合/element harmony
 * - overall reading ใช้ภาษา probabilistic: "แนวโน้ม/โอกาส/ปัจจัยเสริม-ปัจจัยต้าน"
 * - mirror กฎ "ห้ามฟันธงเรื่องสุขภาพร้ายแรง" ของโปรเจกต์
 *
 * @module cross-chart
 */

import type { BaZiChart, ElementName } from "./types";
import type { TenGodName } from "../../types/bazi-gods-stars";
import { detectStemCombination, type HeavenStemName } from "./stem-combinations";
import { detectThreeHarmony, type BranchName, type ThreeHarmonyResult } from "./three-harmony";
import { detectInteractionBetween } from "./interactions";
import { getTenGod } from "./ten-gods";
import { getRelationshipType } from "./relationships";

/**
 * ตำแหน่ง pillar ทั้ง 4 หลัก
 */
export type PillarPosition = "year" | "month" | "day" | "hour";

/**
 * ผลลัพธ์การเปรียบเทียบ stem หนึ่งๆ ระหว่างสอง chart
 */
export interface StemPairCell {
  /** ชื่อ stem ของ owner (จีน, หรือ empty string ถ้า pillar ไม่มี) */
  ownerStem: string;
  /** ชื่อ stem ของ related person (จีน, หรือ empty string ถ้า pillar ไม่มี) */
  relatedStem: string;
  /** เป็นคู่ที่ผนึกกันตาม天干五合หรือไม่ */
  combines: boolean;
  /** ธาตุที่แปรสภาพ (มีค่าก็ต่อเมื่อ combines === true) */
  transformElement?: ElementName;
}

/**
 * ผลลัพธ์การเปรียบเทียบ branch หนึ่งๆ ระหว่างสอง chart
 */
export interface BranchPairCell {
  /** ชื่อ branch ของ owner (จีน, หรือ empty string ถ้า pillar ไม่มี) */
  ownerBranch: string;
  /** ชื่อ branch ของ related person (จีน, หรือ empty string ถ้า pillar ไม่มี) */
  relatedBranch: string;
  /** ประเภท interaction (null ถ้าไม่มี) */
  interaction: "冲" | "合" | "害" | "刑" | null;
}

/**
 * ผลลัพธ์การเปรียบเทียบ day master ระหว่างสอง chart
 */
export interface DayMasterComparison {
  /** ชื่อ stem day master ของ owner */
  ownerStem: string;
  /** ชื่อ stem day master ของ related */
  relatedStem: string;
  /** day master ของ owner มอง day master ของ related เป็น 10 god อะไร */
  tenGodOwnerSeesRelated: TenGodName;
  /** day master ของ related มอง day master ของ owner เป็น 10 god อะไร */
  tenGodRelatedSeesOwner: TenGodName;
  /** day stems ผนึกกัน (天干五合) หรือไม่ */
  stemCombines: boolean;
  /** ธาตุที่แปรสภาพจากการผนึก (มีค่าก็ต่อเมื่อ stemCombines === true) */
  transformElement?: ElementName;
  /** ความสัมพันธ์ธาตุระหว่าง day master ทั้งสอง */
  elementInteraction: "same" | "i-generate" | "generates-me" | "i-control" | "controls-me";
  /** คำอ่านภาษาไทย (probabilistic, holistic) */
  reading: string;
}

/**
 * สัญญาณความเข้ากัน (weighted, transparent)
 */
export interface CompatibilitySignal {
  /** ป้ายกำกับสั้นๆ */
  label: string;
  /** น้ำหนักความสำคัญ */
  weight: "high" | "medium" | "low";
  /** ทิศทาง: กลมกลืน/ตึงเครียด/เป็นกลาง */
  direction: "harmonious" | "tense" | "neutral";
  /** หมายเหตุสั้นๆ */
  note: string;
}

/**
 * การให้คะแนนแต่ละสัญญาณ (transparent breakdown)
 */
export interface ScoreContribution {
  /** ป้ายกำกับภาษาไทย — บอกว่าสัญญาณนี้คืออะไร */
  label: string;
  /** น้ำหนักเป็นตัวเลข (high=3, medium=2, low=1) */
  weight: number;
  /** ทิศทาง: กลมกลืน/ตึงเครียด/เป็นกลาง */
  direction: "harmonious" | "tense" | "neutral";
  /** ค่าเป็นบวก/ลบที่ contributr ไปยัง总分: harmonious=positive, tense=negative, neutral=0 */
  contribution: number;
  /** หมายเหตุสั้นๆ */
  note: string;
}

/**
 * คะแนนความเข้ากันรวม (0-100) พร้อม breakdown เปิดเผยทั้งหมด
 */
export interface CompatibilityScore {
  /** คะแนน 0-100, center 50 = neutral. คำนวณจาก signed contributions normalized */
  score: number;
  /** ระดับความเข้ากัน — probabilistic framing ไม่ใช่ verdict */
  band: "harmonious-tendency" | "balanced" | "tension-tendency";
  /** ป้ายกำกับภาษาไทย — probabilistic, ไม่ฟันธง */
  bandLabelTh: string;
  /** การกระจายคะแนนรายสัญญาณ — full transparent breakdown */
  breakdown: ScoreContribution[];
  /** ผลรวมส่วนบวก (harmonious contributions) */
  positive: number;
  /** ผลรวมส่วนลบ (absolute value of tense contributions) */
  negative: number;
  /** ค่าสูงสุดที่เป็นไปได้ (สำหรับใช้เปรียบเทียบขนาด) */
  maxPossible: number;
}

/**
 * การแปลง weight categories → numeric weights
 */
export const SIGNAL_WEIGHT: Record<"high" | "medium" | "low", number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * ค่าสูงสุดทางทฤษฎี (THEORETICAL MAX) สำหรับคะแนนความเข้ากัน
 *
 * คำนวณจากผลรวมน้ำหนักสูงสุดของ signal categories ทั้งหมดที่ "COULD exist"
 * ใน cross-chart analysis (ไม่ใช่ sum ของ signals ที่เกิดขึ้นจริง)
 *
 * หมวดหมู่ signals ที่อาจเกิดขึ้น (จาก buildSignals):
 *   1. Day stem 五合 (high=3) — มากสุด 1 ครั้ง
 *   2. Day branch interaction: 冲/合/害/刑 (high=3) — มากสุด 1 (mutually exclusive สำหรับ day-day)
 *   3. Three-harmony สามัคคี (medium=2) — มากสุด 1
 *   4. Day-vs-other-pillar interaction (medium=2) — มากสุด 1 (day-year)
 *   5. Element harmony (low=1) — มากสุด 1
 *   6. Other pillar stem combos (low=1 each) — สมมุติ base 3 combos realistic
 *
 * รวม = 3 + 3 + 2 + 2 + 1 + 3 = 14
 *
 * หมายเหตุ: ค่านี้เป็น capacity ที่ทำให้ score ไม่ max ที่ 100 เมื่อมีแค่ "few harmonious signals"
 * ตัวอย่าง: couple ที่มี positive=5, negative=0 → score = 50 + (5/14)*50 ≈ 68 (believable)
 */
const MAX_POSSIBLE_SCORE = 14;

/**
 * ผลลัพธ์การวิเคราะห์ cross-chart compatibility
 */
export interface CrossChartAnalysis {
  /** day master ของ owner */
  ownerDayMaster: { stem: string; element: ElementName; yinYang: string };
  /** day master ของ related person */
  relatedDayMaster: { stem: string; element: ElementName; yinYang: string };
  /** การเปรียบเทียบ day master ทั้งสอง */
  dayMasterComparison: DayMasterComparison;
  /** 4×4 stem matrix (owner pillars × related pillars) — 天干五合 */
  stemMatrix: Record<PillarPosition, Record<PillarPosition, StemPairCell>>;
  /** 4×4 branch matrix (owner branches × related branches) — 冲合害刑 */
  branchMatrix: Record<PillarPosition, Record<PillarPosition, BranchPairCell>>;
  /** ผลสแกน三合/半三合 ทั่ว branches ทั้งหมดของทั้งสอง chart */
  threeHarmony: ThreeHarmonyResult;
  /** สัญญาณความเข้ากันแบบ weighted (transparent, no black-box score) */
  signals: CompatibilitySignal[];
  /** คะแนนความเข้ากัน (optional composite score 0-100) */
  score?: CompatibilityScore;
  /** สรุปภาษาไทย (probabilistic, holistic, no doom-say) */
  overall: string;
}

/**
 * แปลง relationship type → element interaction type
 */
function mapRelationshipToElementInteraction(
  relationship: ReturnType<typeof getRelationshipType>
): DayMasterComparison["elementInteraction"] {
  switch (relationship) {
    case "companion":
      return "same";
    case "output":
      return "i-generate";
    case "resource":
      return "generates-me";
    case "wealth":
      return "i-control";
    case "power":
      return "controls-me";
  }
}

/**
 * สร้าง stem matrix 4×4
 */
function buildStemMatrix(
  ownerChart: BaZiChart,
  relatedChart: BaZiChart
): CrossChartAnalysis["stemMatrix"] {
  const positions: PillarPosition[] = ["year", "month", "day", "hour"];
  const matrix: CrossChartAnalysis["stemMatrix"] = {
    year: {} as Record<PillarPosition, StemPairCell>,
    month: {} as Record<PillarPosition, StemPairCell>,
    day: {} as Record<PillarPosition, StemPairCell>,
    hour: {} as Record<PillarPosition, StemPairCell>,
  };

  for (const ownerPos of positions) {
    matrix[ownerPos] = {} as Record<PillarPosition, StemPairCell>;
    for (const relatedPos of positions) {
      const ownerPillar = ownerChart[ownerPos];
      const relatedPillar = relatedChart[relatedPos];

      // ถ้าขาด pillar → ใส่ null cell (ทั้งสอง anchor chart มี hour pillar ครบ)
      if (!ownerPillar || !relatedPillar) {
        matrix[ownerPos][relatedPos] = {
          ownerStem: "",
          relatedStem: "",
          combines: false,
        };
        continue;
      }

      const ownerStem = ownerPillar.stem.name as HeavenStemName;
      const relatedStem = relatedPillar.stem.name as HeavenStemName;
      const combination = detectStemCombination(ownerStem, relatedStem);

      matrix[ownerPos][relatedPos] = {
        ownerStem,
        relatedStem,
        combines: combination.combines,
        transformElement: combination.transformElement,
      };
    }
  }

  return matrix;
}

/**
 * สร้าง branch matrix 4×4
 */
function buildBranchMatrix(
  ownerChart: BaZiChart,
  relatedChart: BaZiChart
): CrossChartAnalysis["branchMatrix"] {
  const positions: PillarPosition[] = ["year", "month", "day", "hour"];
  const matrix: CrossChartAnalysis["branchMatrix"] = {
    year: {} as Record<PillarPosition, BranchPairCell>,
    month: {} as Record<PillarPosition, BranchPairCell>,
    day: {} as Record<PillarPosition, BranchPairCell>,
    hour: {} as Record<PillarPosition, BranchPairCell>,
  };

  for (const ownerPos of positions) {
    matrix[ownerPos] = {} as Record<PillarPosition, BranchPairCell>;
    for (const relatedPos of positions) {
      const ownerPillar = ownerChart[ownerPos];
      const relatedPillar = relatedChart[relatedPos];

      // ถ้าขาด pillar → ใส่ null cell
      if (!ownerPillar || !relatedPillar) {
        matrix[ownerPos][relatedPos] = {
          ownerBranch: "",
          relatedBranch: "",
          interaction: null,
        };
        continue;
      }

      const ownerBranch = ownerPillar.branch.name as BranchName;
      const relatedBranch = relatedPillar.branch.name as BranchName;
      const interaction = detectInteractionBetween(ownerBranch, relatedBranch);

      matrix[ownerPos][relatedPos] = {
        ownerBranch,
        relatedBranch,
        interaction,
      };
    }
  }

  return matrix;
}

/**
 * สร้าง day master comparison
 */
function buildDayMasterComparison(
  ownerChart: BaZiChart,
  relatedChart: BaZiChart
): DayMasterComparison {
  const ownerDM = ownerChart.dayMaster;
  const relatedDM = relatedChart.dayMaster;

  const ownerStemName = ownerDM.name as HeavenStemName;
  const relatedStemName = relatedDM.name as HeavenStemName;

  const stemCombination = detectStemCombination(ownerStemName, relatedStemName);
  const relationship = getRelationshipType(ownerDM.element, relatedDM.element);
  const elementInteraction = mapRelationshipToElementInteraction(relationship);

  // คำนวณ ten god ทั้งสองทิศทาง
  const tenGodOwnerSeesRelated = getTenGod(
    { element: ownerDM.element, yinYang: ownerDM.yinYang },
    { element: relatedDM.element, yinYang: relatedDM.yinYang }
  );
  const tenGodRelatedSeesOwner = getTenGod(
    { element: relatedDM.element, yinYang: relatedDM.yinYang },
    { element: ownerDM.element, yinYang: ownerDM.yinYang }
  );

  // สร้าง reading ภาษาไทย (probabilistic, holistic)
  const reading = buildDayMasterReading(
    ownerStemName,
    relatedStemName,
    stemCombination.combines,
    stemCombination.transformElement,
    elementInteraction
  );

  return {
    ownerStem: ownerStemName,
    relatedStem: relatedStemName,
    tenGodOwnerSeesRelated,
    tenGodRelatedSeesOwner,
    stemCombines: stemCombination.combines,
    transformElement: stemCombination.transformElement,
    elementInteraction,
    reading,
  };
}

/**
 * สร้าง reading ภาษาไทยสำหรับ day master comparison (probabilistic, no doom-say)
 */
function buildDayMasterReading(
  ownerStem: HeavenStemName,
  relatedStem: HeavenStemName,
  stemCombines: boolean,
  transformElement: ElementName | undefined,
  elementInteraction: DayMasterComparison["elementInteraction"]
): string {
  const parts: string[] = [];

  // 1. Stem combination (天干五合)
  if (stemCombines && transformElement) {
    parts.push(`ดาวเสาวันคู่กัน 五合 (แปรสภาพเป็น${transformElement}) คู่มีสายสัมพันธ์แน่น`);
  } else if (!stemCombines) {
    // ไม่ต้องพูด — ไม่ใช่ปัจจัยเสริม แต่ก็ไม่ใช่ปัจจัยต้าน
  }

  // 2. Element interaction
  switch (elementInteraction) {
    case "same":
      parts.push("เสาวันธาตุเดียวกัน เข้าใจกันง่าย");
      break;
    case "i-generate":
      parts.push("ธาตุเกื้อกูลกัน (เสาวันผู้หนึ่งเกิดอีกฝ่าย) มีแนวโน้มสนับสนุน");
      break;
    case "generates-me":
      parts.push("ธาตุเกื้อกูลกัน (เสาวันผู้หนึ่งถูกอีกฝ่ายเกิด) มีแนวโน้มอุปถัมภ์");
      break;
    case "i-control":
      parts.push("ธาตุคุม-ถูกคุม อาจมีความตึงเครียดบ้าง");
      break;
    case "controls-me":
      parts.push("ธาตุคุม-ถูกคุม อาจมีความตึงเครียดบ้าง");
      break;
  }

  return parts.length > 0 ? parts.join(" ") : "เสาวันทั้งสองมีทั้งปัจจัยเสริมและปัจจัยที่ควรศึกษา";
}

/**
 * สร้างสัญญาณความเข้ากัน (weighted signals)
 */
function buildSignals(
  dayMasterComp: DayMasterComparison,
  stemMatrix: CrossChartAnalysis["stemMatrix"],
  branchMatrix: CrossChartAnalysis["branchMatrix"],
  threeHarmony: ThreeHarmonyResult
): CompatibilitySignal[] {
  const signals: CompatibilitySignal[] = [];

  // 1. Day stem combination (HIGH — critical)
  if (dayMasterComp.stemCombines) {
    signals.push({
      label: "ดาวเสาวัน 五合",
      weight: "high",
      direction: "harmonious",
      note: `เสาวันผนึกกัน (${dayMasterComp.ownerStem}+${dayMasterComp.relatedStem}→${dayMasterComp.transformElement}) สายสัมพันธ์แน่น`,
    });
  }

  // 2. Day-branch interaction (HIGH — critical)
  const dayBranchInteraction = branchMatrix.day.day.interaction;
  if (dayBranchInteraction === "冲") {
    signals.push({
      label: "สาส์นวันชง (冲)",
      weight: "high",
      direction: "tense",
      note: `สาส์นวัน (${stemMatrix.day.day.ownerStem !== "" ? branchMatrix.day.day.ownerBranch : "?"}+${stemMatrix.day.day.relatedStem !== "" ? branchMatrix.day.day.relatedBranch : "?"}) ชงกัน อาจสร้างความไม่สงบ`,
    });
  } else if (dayBranchInteraction === "合") {
    signals.push({
      label: "สาส์นวันร่วม (合)",
      weight: "high",
      direction: "harmonious",
      note: `สาส์นวัน (${branchMatrix.day.day.ownerBranch}+${branchMatrix.day.day.relatedBranch}) ร่วมกัน สร้างความกลมกลืน`,
    });
  }

  // 3. Day-branch harm/punishment (HIGH)
  if (dayBranchInteraction === "害") {
    signals.push({
      label: "สาส์นวันระยำ (害)",
      weight: "high",
      direction: "tense",
      note: `สาส์นวัน (${branchMatrix.day.day.ownerBranch}+${branchMatrix.day.day.relatedBranch}) ระยำกัน อาจมีปัญหาซ่อนเร้น`,
    });
  } else if (dayBranchInteraction === "刑") {
    signals.push({
      label: "สาส์นวันลงโทษ (刑)",
      weight: "high",
      direction: "tense",
      note: `สาส์นวัน (${branchMatrix.day.day.ownerBranch}+${branchMatrix.day.day.relatedBranch}) ลงโทษกัน อาจสร้างความเจ็บปวด`,
    });
  }

  // 4. Three-harmony found (MEDIUM — significant but less than day-vs-day)
  if (threeHarmony.found) {
    const strengthText = threeHarmony.strength === "strong" ? "แรง" : "อ่อน";
    signals.push({
      label: `三合${threeHarmony.type === "half" ? "ครึ่ง" : "เต็ม"}`,
      weight: "medium",
      direction: "harmonious",
      note: `พบ ${threeHarmony.type === "half" ? "半三合" : "三合"} (${threeHarmony.frame}) ${strengthText} — สายสัมพันธ์กลมกลืน`,
    });
  }

  // 5. Day-vs-other-pillar interactions (MEDIUM)
  // Owner day vs related year
  const dayYearInteraction = branchMatrix.day.year.interaction;
  if (dayYearInteraction === "冲") {
    signals.push({
      label: "สาส์นวัน-ปีคู่ชง",
      weight: "medium",
      direction: "tense",
      note: `สาส์นวันคู่กับปีคู่ชง — อาจกระทบความสัมพันธ์`,
    });
  } else if (dayYearInteraction === "合") {
    signals.push({
      label: "สาส์นวัน-ปีคู่ร่วม",
      weight: "medium",
      direction: "harmonious",
      note: `สาส์นวันคู่กับปีคู่ร่วม — สร้างความกลมกลืน`,
    });
  }

  // 6. Element harmony (LOW — supportive but not decisive)
  if (dayMasterComp.elementInteraction === "same" || dayMasterComp.elementInteraction === "i-generate" || dayMasterComp.elementInteraction === "generates-me") {
    signals.push({
      label: "ธาตุเสาวันกลมกลืน",
      weight: "low",
      direction: "harmonious",
      note: `ธาตุเสาวันเข้ากัน (${dayMasterComp.elementInteraction === "same" ? "เดียวกัน" : dayMasterComp.elementInteraction === "i-generate" ? "เกื้อกูล" : "อุปถัมภ์"}) — เข้าใจกันง่าย`,
    });
  } else if (dayMasterComp.elementInteraction === "i-control" || dayMasterComp.elementInteraction === "controls-me") {
    signals.push({
      label: "ธาตุเสาวันตึงเครียด",
      weight: "low",
      direction: "tense",
      note: `ธาตุเสาวันคุม-ถูกคุม — อาจมีความตึงเครียดบ้าง`,
    });
  }

  // 7. Other pillar stem combinations (LOW)
  // Scan stem matrix for combinations (skip day-vs-day already covered)
  for (const ownerPos of ["year", "month", "hour"] as PillarPosition[]) {
    for (const relatedPos of ["year", "month", "hour"] as PillarPosition[]) {
      const cell = stemMatrix[ownerPos][relatedPos];
      if (cell.combines && (ownerPos !== "day" || relatedPos !== "day")) {
        signals.push({
          label: `天干 ${ownerPos}-${relatedPos} 五合`,
          weight: "low",
          direction: "harmonious",
          note: `${cell.ownerStem}+${cell.relatedStem}→${cell.transformElement} ผนึกกัน`,
        });
      }
    }
  }

  return signals;
}

/**
 * คำนวณคะแนนความเข้ากัน (composite score 0-100) จาก signals
 *
 * @param signals - สัญญาณความเข้ากันทั้งหมด
 * @param opts - ตัวเลือกเพิ่มเติม (stemCombines, threeHarmonyFound)
 * @returns CompatibilityScore - คะแนน 0-100 พร้อม breakdown
 *
 * สูตรคำนวณ:
 * - แต่ละ signal มี contribution = weight * (+1 harmonious | -1 tense | 0 neutral)
 * - positive = ผลรวม contribution เป็นบวก, negative = ผลรวม contribution เป็นลบ (absolute value)
 * - maxPossible = THEORETICAL MAX (MAX_POSSIBLE_SCORE = 14) ครอบคลุม categories ทั้งหมดที่ COULD exist
 * - score = 50 + Math.round((positive - negative) / maxPossible * 50) → clamp [0,100]
 * - band: score >= 62 → harmonious-tendency; score <= 38 → tension-tendency; else balanced
 *
 * หมายเหตุ: score 50 = neutral (ไม่ดีไม่แย่), 100 = ดีที่สุด, 0 = แย่ที่สุด
 * ใช้ theoretical max (ไม่ใช่ sum ของ existing signals) เพื่อให้ couple ที่มีแค่ few harmonious
 * ไม่ max ที่ 100 — เหลือ headroom สำหรับ "exceptional" couples
 */
export function computeCompatibilityScore(
  signals: CompatibilitySignal[],
  opts?: { stemCombines?: boolean; threeHarmonyFound?: boolean }
): CompatibilityScore {
  // 1. สร้าง breakdown จาก signals ที่มี
  const breakdown: ScoreContribution[] = signals.map((signal) => {
    const weight = SIGNAL_WEIGHT[signal.weight];
    let contribution = 0;

    if (signal.direction === "harmonious") {
      contribution = weight;
    } else if (signal.direction === "tense") {
      contribution = -weight;
    }
    // neutral → contribution 0

    return {
      label: signal.label,
      weight,
      direction: signal.direction,
      contribution,
      note: signal.note,
    };
  });

  // 2. เพิ่ม extras ถ้ามี (stemCombines, threeHarmonyFound)
  // ตรวจสอบก่อนว่ามีใน signals แล้วหรือยัง เพื่อไม่ double-count
  const hasStemCombinesSignal = signals.some(s => s.label.includes("五合"));
  const hasThreeHarmonySignal = signals.some(s => s.label.includes("三合"));

  if (opts?.stemCombines && !hasStemCombinesSignal) {
    breakdown.push({
      label: "ดาวเสาวัน 五合",
      weight: SIGNAL_WEIGHT.high,
      direction: "harmonious",
      contribution: SIGNAL_WEIGHT.high,
      note: "เสาวันผนึกกัน (ส่วนเสริมจาก extras)",
    });
  }

  if (opts?.threeHarmonyFound && !hasThreeHarmonySignal) {
    breakdown.push({
      label: "三合/半三合",
      weight: SIGNAL_WEIGHT.medium,
      direction: "harmonious",
      contribution: SIGNAL_WEIGHT.medium,
      note: "พบ三合/半三合 (ส่วนเสริมจาก extras)",
    });
  }

  // 3. คำนวณ positive, negative (sums of actual contributions)
  const positive = breakdown
    .filter((b) => b.contribution > 0)
    .reduce((sum, b) => sum + b.contribution, 0);

  const negative = Math.abs(
    breakdown
      .filter((b) => b.contribution < 0)
      .reduce((sum, b) => sum + b.contribution, 0)
  );

  // 4. maxPossible = THEORETICAL MAX (constant, ไม่ใช่ sum ของ existing weights)
  // เพื่อให้ score เหลือ headroom และไม่ inflate เมื่อ couple มีแค่ few signals
  const maxPossible = MAX_POSSIBLE_SCORE;

  // 5. คำนวณ score (center 50, range [0, 100])
  // net = positive - negative (range: [-maxPossible, +maxPossible] ในทางทฤษฎี)
  // score = 50 + (net / maxPossible) * 50 → [0, 100]
  const net = positive - negative;
  let score = 50 + Math.round((net / maxPossible) * 50);
  score = Math.max(0, Math.min(100, score)); // clamp to [0, 100]

  // 5. กำหนด band
  let band: CompatibilityScore["band"];
  let bandLabelTh: string;

  if (score >= 62) {
    band = "harmonious-tendency";
    bandLabelTh = "แนวโน้มเข้ากันดี";
  } else if (score <= 38) {
    band = "tension-tendency";
    bandLabelTh = "แนวโน้มมีแรงเสียดสี (ไม่ใช่ว่าไม่เข้ากัน)";
  } else {
    band = "balanced";
    bandLabelTh = "สมดุล (มีทั้งปัจจัยเสริมและต้าน)";
  }

  return {
    score,
    band,
    bandLabelTh,
    breakdown,
    positive,
    negative,
    maxPossible,
  };
}

/**
 * สร้างสรุปภาษาไทย (probabilistic, holistic, no doom-say)
 */
function buildOverall(
  dayMasterComp: DayMasterComparison,
  signals: CompatibilitySignal[]
): string {
  const parts: string[] = [];

  // 1. Day master core
  parts.push(dayMasterComp.reading);

  // 2. Count signals by direction
  const harmoniousSignals = signals.filter((s) => s.direction === "harmonious");
  const tenseSignals = signals.filter((s) => s.direction === "tense");

  // 3. Overall assessment
  if (harmoniousSignals.length > tenseSignals.length) {
    parts.push("ภาพรวมมีแนวโน้มเสริมความสามัคคี");
  } else if (tenseSignals.length > harmoniousSignals.length) {
    parts.push("ภาพรวมมีทั้งปัจจัยเสริมและปัจจัยที่ควรระวัง");
  } else {
    parts.push("ภาพรวมสมดุล");
  }

  // 4. Add contextual nuance (probabilistic)
  if (tenseSignals.length > 0) {
    parts.push("ความตึงเครียดที่พบสามารถบรรเทาได้ด้วยปัจจัยเสริมอื่นๆ เช่น การผนึกกันของ天干/地支 หรือธาตุที่เข้ากัน");
  }

  return parts.join(". ") + ".";
}

/**
 * วิเคราะห์ cross-chart compatibility (合婚) ระหว่างสอง BaZi Chart
 *
 * @param ownerChart - ดวงของ owner (เช่น สามี)
 * @param relatedChart - ดวงของ related person (เช่น ภรรยา)
 * @returns CrossChartAnalysis — ผลการวิเคราะห์ความเข้ากัน
 *
 * @example
 * const husbandChart = calculateBaZi(husbandProfile);
 * const wifeChart = calculateBaZi(wifeProfile);
 * const compatibility = analyzeCrossChart(husbandChart, wifeChart);
 * console.log(compatibility.overall); // สรุปภาษาไทย
 */
export function analyzeCrossChart(
  ownerChart: BaZiChart,
  relatedChart: BaZiChart
): CrossChartAnalysis {
  // 1. Day master info
  const ownerDayMaster = {
    stem: ownerChart.dayMaster.name,
    element: ownerChart.dayMaster.element,
    yinYang: ownerChart.dayMaster.yinYang,
  };
  const relatedDayMaster = {
    stem: relatedChart.dayMaster.name,
    element: relatedChart.dayMaster.element,
    yinYang: relatedChart.dayMaster.yinYang,
  };

  // 2. Day master comparison
  const dayMasterComparison = buildDayMasterComparison(ownerChart, relatedChart);

  // 3. Matrices
  const stemMatrix = buildStemMatrix(ownerChart, relatedChart);
  const branchMatrix = buildBranchMatrix(ownerChart, relatedChart);

  // 4. Three-harmony scan (รวม branches ทั้งหมดของทั้งสอง chart)
  const allBranches: BranchName[] = [];
  for (const pillar of [ownerChart.year, ownerChart.month, ownerChart.day]) {
    allBranches.push(pillar.branch.name as BranchName);
  }
  if (ownerChart.hour) {
    allBranches.push(ownerChart.hour.branch.name as BranchName);
  }
  for (const pillar of [relatedChart.year, relatedChart.month, relatedChart.day]) {
    allBranches.push(pillar.branch.name as BranchName);
  }
  if (relatedChart.hour) {
    allBranches.push(relatedChart.hour.branch.name as BranchName);
  }
  const threeHarmony = detectThreeHarmony(allBranches);

  // 5. Signals
  const signals = buildSignals(dayMasterComparison, stemMatrix, branchMatrix, threeHarmony);

  // 6. Overall
  const overall = buildOverall(dayMasterComparison, signals);

  // 7. Compatibility score (optional composite)
  const score = computeCompatibilityScore(signals, {
    stemCombines: dayMasterComparison.stemCombines,
    threeHarmonyFound: threeHarmony.found,
  });

  return {
    ownerDayMaster,
    relatedDayMaster,
    dayMasterComparison,
    stemMatrix,
    branchMatrix,
    threeHarmony,
    signals,
    score,
    overall,
  };
}
