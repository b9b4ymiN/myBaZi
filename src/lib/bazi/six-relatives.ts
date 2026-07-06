/**
 * 六亲 (Six Relatives) - ดาวครอบครัวแบบมีเพศ (Gendered Family Stars)
 *
 * ตามตำรา 子平真诠 (Ziping Zhenquan) - แหล่งข้อมูลดั้งเดิมของการอ่านดวงจีน
 * แผนที่ดาวครอบครัว → 10 Gods ขึ้นอยู่กับเพศของ Day Master เสมอ
 *
 * นี่คือ foundation สำคัญที่สุดสำหรับการอ่านความสัมพันธ์ทั้งหมด:
 * - คู่ (spouse) = ภรรยา/สามีในแผนภูมิ
 * - บิดา (father) = ดาวบิดา
 * - มารดา (mother) = ดาวมารดา
 * - บุตรชาย (son) = ดาวบุตรชาย
 * - บุตรี (daughter) = ดาวบุตรี
 * - พี่น้อง (sibling) = ดาวพี่น้อง
 *
 * หลักการ (ตาม子平真诠):
 * - 财 (Wealth) = สิ่งที่ Day Master ควบคุม/ครอบครอง → ภรรยา (male), บิดา (ดาวเงินรอง)
 * - 官杀 (Power) = สิ่งที่ควบคุม Day Master → สามี (female), บุตรชาย (male)
 * - 印 (Resource) = สิ่งที่ generate Day Master → มารดา
 * - 食伤 (Output) = สิ่งที่ Day Master generate → บุตร (female)
 * - 比劫 (Companion) = ธาตุเดียวกัน → พี่น้อง (ทั้งสองเพศ)
 *
 * ⚠️ CRITICAL: เพศของ Day Master กำหนดแผนที่ทั้งหมด ไม่ใช่เพศของคนในชีวิตจริง
 *    Day Master เพศชาย → ภรรยา = 财, บุตร = 官杀
 *    Day Master เพศหญิง → สามี = 官杀, บุตร = 食伤
 */

import type { Gender } from "../../types/profile";
import type { TenGodName } from "../../types/bazi-gods-stars";

/**
 * บทบาทครอบครัวทั้ง 6 ใน 六亲
 */
export type RelativeRole = "spouse" | "father" | "mother" | "son" | "daughter" | "sibling";

/**
 * ตาราง六亲แบบมีเพศ (Gendered Six Relatives Table)
 *
 * role     | male day master | female day master
 * ---------|-----------------|-------------------
 * spouse   | 偏财, 正财      | 七杀, 正官
 * father   | 偏财            | 正财
 * mother   | 正印            | 偏印
 * son      | 七杀            | 食神
 * daughter | 正官            | 伤官
 * sibling  | 比肩, 劫财      | 比肩, 劫财
 *
 * คำอธิบาย:
 * - Male Day Master:
 *   - ภรรยา (spouse) = 财 (Wealth) - สิ่งที่เขาควบคุม/ครอบครอง: 正财=ภรรยาหลัก, 偏财=ภรรยารอง
 *   - บิดา (father) = 偏财 - "ดาวเงินรอง" ตามตำราดั้งเดิม
 *   - มารดา (mother) = 正印 - สิ่งที่ generate เขา
 *   - บุตรชาย (son) = 七杀 - สิ่งที่ควบคุมเขา
 *   - บุตรี (daughter) = 正官 - สิ่งที่ควบคุมเขา (เบากว่า)
 *   - พี่น้อง (sibling) = 比劫 - ธาตุเดียวกัน
 *
 * - Female Day Master:
 *   - สามี (spouse) = 官杀 (Power) - สิ่งที่ควบคุมเธอ: 正官=สามีหลัก, 七杀=สามีรอง/ชู้สาว
 *   - บิดา (father) = 正财 - ดาวเงินหลัก (เพศหญิงเห็นบิดาเป็น正财)
 *   - มารดา (mother) = 偏印 - สิ่งที่ generate เธอ (เพศหญิงเห็นมารดาเป็น偏印ตาม子平真诠)
 *   - บุตรชาย (son) = 食神 - สิ่งที่เธอ generate
 *   - บุตรี (daughter) = 伤官 - สิ่งที่เธอ generate (เบากว่า)
 *   - พี่น้อง (sibling) = 比劫 - ธาตุเดียวกัน
 */
const SIX_RELATIVES_MAP: Record<Gender, Record<RelativeRole, TenGodName[]>> = {
  male: {
    spouse: ["偏财", "正财"],
    father: ["偏财"],
    mother: ["正印"],
    son: ["七杀"],
    daughter: ["正官"],
    sibling: ["比肩", "劫财"],
  },
  female: {
    spouse: ["七杀", "正官"],
    father: ["正财"],
    mother: ["偏印"],
    son: ["食神"],
    daughter: ["伤官"],
    sibling: ["比肩", "劫财"],
  },
};

/**
 * หาดาวคู่ (Spouse Star) ตามเพศของ Day Master
 *
 * @param gender - เพศของ Day Master ("male" หรือ "female")
 * @returns ดาวที่เป็นตัวแทนของคู่ (array 2 ตัว: หลัก, รอง)
 *
 * @example
 * getSpouseStar("male")   // ["偏财", "正财"] - ภรรยา
 * getSpouseStar("female") // ["七杀", "正官"] - สามี
 */
export function getSpouseStar(gender: Gender): TenGodName[] {
  return [...SIX_RELATIVES_MAP[gender].spouse];
}

/**
 * หาดาวครอบครัวตามบทบาทและเพศของ Day Master
 *
 * @param role - บทบาทครอบครัว ("spouse", "father", "mother", "son", "daughter", "sibling")
 * @param gender - เพศของ Day Master ("male" หรือ "female")
 * @returns ดาวที่เป็นตัวแทนของบุคคลในบทบาทนั้น (array 1-2 ตัว)
 *
 * @example
 * getRelativeStar("father", "male")   // ["偏财"]
 * getRelativeStar("father", "female") // ["正财"]
 * getRelativeStar("mother", "male")   // ["正印"]
 * getRelativeStar("mother", "female") // ["偏印"]
 * getRelativeStar("son", "male")      // ["七杀"]
 * getRelativeStar("son", "female")    // ["食神"]
 * getRelativeStar("daughter", "male")    // ["正官"]
 * getRelativeStar("daughter", "female")  // ["伤官"]
 * getRelativeStar("sibling", "male")   // ["比肩", "劫财"]
 * getRelativeStar("sibling", "female") // ["比肩", "劫财"]
 */
export function getRelativeStar(role: RelativeRole, gender: Gender): TenGodName[] {
  return [...SIX_RELATIVES_MAP[gender][role]];
}

/**
 * หาตาราง六亲ทั้งหมดตามเพศของ Day Master
 *
 * @param gender - เพศของ Day Master ("male" หรือ "female")
 * @returns Record ที่ map ทุกบทบาท → ดาวที่เป็นตัวแทน (array 1-2 ตัว)
 *
 * @example
 * getSixRelatives("male")
 * // {
 * //   spouse: ["偏财", "正财"],
 * //   father: ["偏财"],
 * //   mother: ["正印"],
 * //   son: ["七杀"],
 * //   daughter: ["正官"],
 * //   sibling: ["比肩", "劫财"],
 * // }
 *
 * getSixRelatives("female")
 * // {
 * //   spouse: ["七杀", "正官"],
 * //   father: ["正财"],
 * //   mother: ["偏印"],
 * //   son: ["食神"],
 * //   daughter: ["伤官"],
 * //   sibling: ["比肩", "劫财"],
 * // }
 */
export function getSixRelatives(gender: Gender): Record<RelativeRole, TenGodName[]> {
  const result: Record<RelativeRole, TenGodName[]> = {} as Record<RelativeRole, TenGodName[]>;

  for (const role of Object.keys(SIX_RELATIVES_MAP[gender]) as RelativeRole[]) {
    result[role] = [...SIX_RELATIVES_MAP[gender][role]];
  }

  return result;
}
