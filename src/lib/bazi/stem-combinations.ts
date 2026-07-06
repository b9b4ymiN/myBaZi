/**
 * 天干五合 (Five Stem Combinations) - การผนึกกันของ天干สิบตัว
 *
 * ในตำราดวงจีน (เฉพาะ 六亲/八字), 天干 (Heavenly Stems) บางคู่สามารถ "ผนึก" กันเป็นธาตุอื่น
 * กฎพื้นฐาน: stems ที่ห่างกัน 5 ตำแหน่ง (index difference = 5) จะผนึกกันและแปรสภาพเป็นธาตุที่กำหนด
 *
 * สำคัญมากสำหรับ 合婚 (การดูความเข้ากันของดวงคู่):
 * - ถ้า Day Stem ของคู่หูสองคน 五合 (ผนึกกัน) → สัญญาณความสามัคคีสูงมาก
 * - ถ้ามีการผนึก → ต้องตรวจสอบธาตุที่แปรสภาพด้วย (transform element)
 *
 * ก่อนหน้านี้โมดูลนี้ไม่มีใน codebase (0 grep hits for "五合")
 * ทำให้การคำนวณความเข้ากันระหว่างดวงไม่สมบูรณ์
 */

import type { ElementName } from "./types";
import type { BaZiChart, Pillar } from "./types";

/**
 * ชื่อ天干 (Heavenly Stem) ทั้ง 10 ตัว
 */
export type HeavenStemName = "甲" | "乙" | "丙" | "丁" | "戊" | "己" | "庚" | "辛" | "壬" | "癸";

/**
 * ผลลัพธ์การตรวจสอบ天干五合 (Stem Combination)
 */
export interface StemCombinationResult {
  /** เป็นคู่ที่ผนึกกันหรือไม่ */
  combines: boolean;
  /** ธาตุที่เกิดจากการผนึก (มีค่าก็ต่อเมื่อ combines === true) */
  transformElement?: ElementName;
}

/**
 * ตาราง天干五合 (Five Stem Combinations) - คู่ที่ผนึกและธาตุที่แปรสภาพ
 *
 * | Pair | Combines? | Transform Element |
 * |------|-----------|-------------------|
 * | 甲 + 己 | yes | 土 (Earth) |
 * | 乙 + 庚 | yes | 金 (Metal) |
 * | 丙 + 辛 | yes | 水 (Water) |
 * | 丁 + 壬 | yes | 木 (Wood) |
 * | 戊 + 癸 | yes | 火 (Fire) |
 *
 * หมายเหตุ:
 * - ลำดับไม่สำคัญ: 甲+ย === 己+甲 (order-independent)
 * - คู่อื่น ๆ ที่ไม่อยู่ในตารางนี้ ไม่ผนึกกัน (เช่น 甲+乙, 甲+丙, 己+庚, ฯลฯ)
 */
const STEM_COMBINATION_MAP: Record<string, { stem: HeavenStemName; transform: ElementName }> = {
  "甲": { stem: "己", transform: "土" },   // 甲 + 己 → 土
  "己": { stem: "甲", transform: "土" },   // 己 + 甲 → 土 (same pair, reverse)
  "乙": { stem: "庚", transform: "金" },   // 乙 + 庚 → 金
  "庚": { stem: "乙", transform: "金" },   // 庚 + 乙 → 金 (same pair, reverse)
  "丙": { stem: "辛", transform: "水" },   // 丙 + 辛 → 水
  "辛": { stem: "丙", transform: "水" },   // 辛 + 丙 → 水 (same pair, reverse)
  "丁": { stem: "壬", transform: "木" },   // 丁 + 壬 → 木
  "壬": { stem: "丁", transform: "木" },   // 壬 + 丁 → 木 (same pair, reverse)
  "戊": { stem: "癸", transform: "火" },   // 戊 + 癸 → 火
  "癸": { stem: "戊", transform: "火" },   // 癸 + 戊 → 火 (same pair, reverse)
};

/**
 * ตรวจสอบว่า天干สองตัวผนึกกันตามกฎ天干五合หรือไม่
 *
 * @param stemA - 天干ตัวแรก
 * @param stemB - 天干ตัวสอง
 * @returns ผลลัพธ์การตรวจสอบ (combines + transformElement ถ้าผนึกกัน)
 *
 * @example
 * detectStemCombination("甲", "己")
 * // { combines: true, transformElement: "土" }
 *
 * detectStemCombination("乙", "庚")
 * // { combines: true, transformElement: "金" }
 *
 * detectStemCombination("甲", "乙")
 * // { combines: false }
 *
 * detectStemCombination("己", "甲")
 * // { combines: true, transformElement: "土" } (order-independent)
 */
export function detectStemCombination(
  stemA: HeavenStemName,
  stemB: HeavenStemName
): StemCombinationResult {
  const mapping = STEM_COMBINATION_MAP[stemA];

  if (!mapping || mapping.stem !== stemB) {
    return { combines: false };
  }

  return {
    combines: true,
    transformElement: mapping.transform,
  };
}

/**
 * ตรวจสอบอย่างย่อว่า天干สองตัวผนึกกันหรือไม่ (boolean wrapper)
 *
 * @param stemA - 天干ตัวแรก
 * @param stemB - 天干ตัวสอง
 * @returns true ถ้าผนึกกันตามกฎ天干五合
 *
 * @example
 * stemsCombine("甲", "己")  // true
 * stemsCombine("甲", "乙")  // false
 * stemsCombine("丁", "壬")  // true
 */
export function stemsCombine(stemA: HeavenStemName, stemB: HeavenStemName): boolean {
  return detectStemCombination(stemA, stemB).combines;
}

/**
 * คู่天干ที่ผนึกกัน (五合) ที่พบใน 4 เสาของดวง
 * ตรวจทุกคู่ระหว่าง year/month/day/hour stems (6 คู่) ว่าผนึกกันและแปรสภาพเป็นธาตุอะไร
 */
export interface StemCombinationMatch {
  /** คู่ stems ที่ผนึกกัน */
  pair: [HeavenStemName, HeavenStemName];
  /** ตำแหน่งเสาของแต่ละ stem */
  positions: [Pillar["position"], Pillar["position"]];
  /** ธาตุที่แปรสภาพจากการผนึก */
  transformElement: ElementName;
}

/**
 * วิเคราะห์คู่天干五合ทั้งหมดในดวง (ระหว่าง 4 เสา)
 *
 * @param chart - แผนผัง BaZi 4 เสา
 * @returns คู่ที่ผนึกกัน (อาจว่าง ถ้าไม่มีคู่ใดผนึก)
 */
export function analyzeStemCombinations(chart: BaZiChart): StemCombinationMatch[] {
  const pillars: Pillar[] = [chart.year, chart.month, chart.day, chart.hour].filter(
    (p): p is Pillar => p !== null
  );
  const matches: StemCombinationMatch[] = [];
  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const a = pillars[i];
      const b = pillars[j];
      const sa = a.stem.name as HeavenStemName;
      const sb = b.stem.name as HeavenStemName;
      const r = detectStemCombination(sa, sb);
      if (r.combines && r.transformElement) {
        matches.push({
          pair: [sa, sb],
          positions: [a.position, b.position],
          transformElement: r.transformElement,
        });
      }
    }
  }
  return matches;
}