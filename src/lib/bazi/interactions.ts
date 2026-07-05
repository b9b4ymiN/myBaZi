/**
 * BaZi Branch Interactions Analysis (ปฏิสัมพันธ์ระหว่าง地支)
 * วิเคราะห์ 冲 (clash), 合 (combine), 害 (harm), 刑 (punishment)
 *
 * ปฏิสัมพันธ์เหล่านี้สำคัญมากใน BaZi เพราะส่งผลต่อ:
 * - ความเสถียรของ chart
 * - การ transform ของ element (combine → transform)
 * - ความขัดแย้งในชีวิต (clash)
 * - ปัญหาสุขภาพ/ความสัมพันธ์ (harm/punishment)
 */

import type { BaZiChart } from "./types";

/**
 * ประเภทของ branch interaction
 */
export type BranchInteractionType = "冲" | "合" | "害" | "刑";

/**
 * ข้อมูล interaction ระหว่าง branches
 */
export interface BranchInteraction {
  /** ประเภท (clash/combine/harm/punishment) */
  type: BranchInteractionType;
  /** ชื่อ branches ที่ interact (จีน) */
  branches: [string, string];
  /** ตำแหน่ง (year/month/day/hour) */
  positions: [string, string];
  /** คำอธิบายภาษาไทย */
  description: string;
  /** ชื่อ interaction ภาษาไทย */
  nameTh: string;
}

/**
 * Map ชื่อ interaction → ไทย
 */
const INTERACTION_TYPE_THAI: Record<BranchInteractionType, string> = {
  冲: "ชง (冲) - ขัดแย้ง",
  合: "ร่วม (合) - ผสมผสาน",
  害: "ระยำ (害) - ทำร้าย",
  刑: "ลงโทษ (刑) - ทำลาย",
};

/**
 * Map ชื่อ interaction → อธิบายสั้น
 */
const INTERACTION_DESCRIPTION: Record<BranchInteractionType, string> = {
  冲: "ตรงข้ามกัน - สร้างความไม่สงบ ขัดแย้ง การเปลี่ยนแปลงฉับพลัน",
  合: "ผสมผสานกัน - สร้างความกลมกลืน อาจ transform element",
  害: "ทำร้ายกัน - สร้างปัญหาซ่อนเร้น ความสัมพันธ์ซับซ้อน",
  刑: "ลงโทษกัน - สร้างความเจ็บปวด ปัญหาสุขภาพ หรืออุบัติเหตุ",
};

/**
 * Lookup tables สำหรับ interactions (ตามตำรามาตรฐาน)
 */

// 冲 (Clash) - 6 pairs (opposite branches)
const CLASH_PAIRS: Record<string, string> = {
  子: "午",
  丑: "未",
  寅: "申",
  卯: "酉",
  辰: "戌",
  巳: "亥",
  // Reverse (symmetric)
  午: "子",
  未: "丑",
  申: "寅",
  酉: "卯",
  戌: "辰",
  亥: "巳",
};

// 合六合 (Six Harmonies / 6 Combine) - 6 pairs
const SIX_HARMONY_COMBINE: Record<string, string> = {
  子: "丑",
  寅: "亥",
  卯: "戌",
  辰: "酉",
  巳: "申",
  午: "未",
  // Reverse (symmetric)
  丑: "子",
  亥: "寅",
  戌: "卯",
  酉: "辰",
  申: "巳",
  未: "午",
};

// 害 (Harm / 六害) - 6 pairs
const HARM_PAIRS: Record<string, string> = {
  子: "未",
  丑: "午",
  寅: "巳",
  卯: "辰",
  申: "亥",
  酉: "戌",
  // Reverse (symmetric)
  未: "子",
  午: "丑",
  巳: "寅",
  辰: "卯",
  亥: "申",
  戌: "酉",
};

// 刑 (Punishment) - 3 categories
// 1. 三刑: 寅-巳-申 (3-way punishment)
// 2. Two-way: 丑-戌
// 3. Self-punishment: 辰-辰, 午-午, 酉-酉, 亥-亥
const PUNISHMENT_TRIPLE = ["寅", "巳", "申"] as const;
const PUNISHMENT_TWO_WAY: Record<string, string> = {
  丑: "戌",
  戌: "丑",
};
const PUNISHMENT_SELF = ["辰", "午", "酉", "亥"] as const;

/**
 * ตรวจสอบ interaction ระหว่าง 2 branches
 *
 * @param branch1 - ชื่อ branch ตัวแรก
 * @param branch2 - ชื่อ branch ตัวสอง
 * @returns BranchInteractionType | null - null ถ้าไม่มี interaction
 */
function detectInteractionBetween(
  branch1: string,
  branch2: string
): BranchInteractionType | null {
  // 1. ตรวจ 冲 (clash)
  if (CLASH_PAIRS[branch1] === branch2) {
    return "冲";
  }

  // 2. ตรวจ 六合 (six harmony combine)
  if (SIX_HARMONY_COMBINE[branch1] === branch2) {
    return "合";
  }

  // 3. ตรวจ 害 (harm)
  if (HARM_PAIRS[branch1] === branch2) {
    return "害";
  }

  // 4. ตรวจ 刑 (punishment)
  // 4.1 Three-way punishment (寅-巳-申)
  if (
    PUNISHMENT_TRIPLE.includes(branch1 as typeof PUNISHMENT_TRIPLE[number]) &&
    PUNISHMENT_TRIPLE.includes(branch2 as typeof PUNISHMENT_TRIPLE[number]) &&
    branch1 !== branch2
  ) {
    return "刑";
  }

  // 4.2 Two-way punishment (丑-戌)
  if (PUNISHMENT_TWO_WAY[branch1] === branch2) {
    return "刑";
  }

  // 4.3 Self-punishment (辰-辰, etc.)
  if (branch1 === branch2 && PUNISHMENT_SELF.includes(branch1 as typeof PUNISHMENT_SELF[number])) {
    return "刑";
  }

  // No interaction
  return null;
}

/**
 * แปลง pillar position → ชื่อภาษาไทย
 *
 * @param position - "year" | "month" | "day" | "hour"
 * @returns ชื่อไทย
 */
function positionToThai(position: string): string {
  const map: Record<string, string> = {
    year: "ปี",
    month: "เดือน",
    day: "วัน",
    hour: "ชั่วโมง",
  };
  return map[position] || position;
}

/**
 * วิเคราะห์ interactions ทั้งหมดใน BaZi Chart
 *
 * Algorithm:
 * 1. รวบชื่อ branches ทั้งหมด (year/month/day/hour)
 * 2. ตรวจทุกคู่ (year-month, year-day, ..., day-hour) - 6 pairs สำหรับ 4 pillars
 * 3. ตรวจสอบ interaction type (冲/合/害/刑)
 * 4. สรุปเป็น BranchInteraction[]
 *
 * @param chart - BaZi chart ที่ต้องการวิเคราะห์
 * @returns BranchInteraction[] - interactions ทั้งหมด (เรียงตามความสำคัญ: 冲 > 刑 > 害 > 合)
 *
 * @example
 * const chart = calculateBaZi(profile);
 * const interactions = analyzeInteractions(chart);
 * console.log(interactions); // [{ type: "冲", branches: ["子", "午"], ... }]
 */
export function analyzeInteractions(chart: BaZiChart): BranchInteraction[] {
  const interactions: BranchInteraction[] = [];

  // รวบ pillars (skip hour ถ้าไม่ทราบเวลา)
  const pillars = [
    { pillar: chart.year, position: "year" },
    { pillar: chart.month, position: "month" },
    { pillar: chart.day, position: "day" },
  ];

  if (chart.hour) {
    pillars.push({ pillar: chart.hour, position: "hour" });
  }

  // ตรวจทุกคู่ (combination)
  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const { pillar: pillar1, position: pos1 } = pillars[i];
      const { pillar: pillar2, position: pos2 } = pillars[j];

      const branch1 = pillar1.branch.name;
      const branch2 = pillar2.branch.name;

      // ตรวจ interaction
      const interactionType = detectInteractionBetween(branch1, branch2);

      if (interactionType) {
        interactions.push({
          type: interactionType,
          branches: [branch1, branch2],
          positions: [pos1, pos2] as [string, string],
          description: INTERACTION_DESCRIPTION[interactionType],
          nameTh: INTERACTION_TYPE_THAI[interactionType],
        });
      }
    }
  }

  // เรียงลำดับตามความสำคัญ:
  // 1. 冲 (clash) - สำคัญที่สุด - สร้างความไม่สงบ
  // 2. 刑 (punishment) - สำคัญมาก - สร้างความเจ็บปวด
  // 3. 害 (harm) - สำคัญปานกลาง - ปัญหาซ่อนเร้น
  // 4. 合 (combine) - สำคัญน้อยสุด - มังคล
  const priorityOrder: Record<BranchInteractionType, number> = {
    冲: 0,
    刑: 1,
    害: 2,
    合: 3,
  };

  interactions.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

  return interactions;
}

/**
 * สรุป interactions เป็น string ภาษาไทย (สำหรับ context)
 *
 * @param interactions - ผล from analyzeInteractions()
 * @returns string - สรุปภาษาไทย
 */
export function summarizeInteractions(interactions: BranchInteraction[]): string {
  if (interactions.length === 0) {
    return "ไม่มีปฏิสัมพันธ์พิเศษ (冲合害刑) ระหว่าง地支ใน chart - chart สงบสุข";
  }

  const parts: string[] = [];

  // จัดกลุ่มตาม type
  const byType: Record<BranchInteractionType, BranchInteraction[]> = {
    冲: [],
    合: [],
    害: [],
    刑: [],
  };

  for (const interaction of interactions) {
    byType[interaction.type].push(interaction);
  }

  // 1. 冲 (clash) - สำคัญที่สุด
  if (byType.冲.length > 0) {
    const clashes = byType.冲.map((i) => {
      const [pos1, pos2] = i.positions;
      const posTh1 = positionToThai(pos1);
      const posTh2 = positionToThai(pos2);
      return `${posTh1} (${i.branches[0]}) ชงกับ ${posTh2} (${i.branches[1]})`;
    });
    parts.push(`⚠️ ชง (冲): ${clashes.join(", ")} - สร้างความไม่สงบ การเปลี่ยนแปลงฉับพลัน`);
  }

  // 2. 刑 (punishment)
  if (byType.刑.length > 0) {
    const punishments = byType.刑.map((i) => {
      const [pos1, pos2] = i.positions;
      const posTh1 = positionToThai(pos1);
      const posTh2 = positionToThai(pos2);
      return `${posTh1} (${i.branches[0]}) ลงโทษกับ ${posTh2} (${i.branches[1]})`;
    });
    parts.push(`⚠️ ลงโทษ (刑): ${punishments.join(", ")} - อาจสร้างปัญหาสุขภาพ หรืออุบัติเหตุ`);
  }

  // 3. 害 (harm)
  if (byType.害.length > 0) {
    const harms = byType.害.map((i) => {
      const [pos1, pos2] = i.positions;
      const posTh1 = positionToThai(pos1);
      const posTh2 = positionToThai(pos2);
      return `${posTh1} (${i.branches[0]}) ระยำกับ ${posTh2} (${i.branches[1]})`;
    });
    parts.push(`⚠️ ระยำ (害): ${harms.join(", ")} - สร้างปัญหาซ่อนเร้น ความสัมพันธ์ซับซ้อน`);
  }

  // 4. 合 (combine) - มังคล
  if (byType.合.length > 0) {
    const combines = byType.合.map((i) => {
      const [pos1, pos2] = i.positions;
      const posTh1 = positionToThai(pos1);
      const posTh2 = positionToThai(pos2);
      return `${posTh1} (${i.branches[0]}) ร่วมกับ ${posTh2} (${i.branches[1]})`;
    });
    parts.push(`✨ ร่วม (合): ${combines.join(", ")} - สร้างความกลมกลืน อาจ transform element`);
  }

  return parts.join("\n");
}
