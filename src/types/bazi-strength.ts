/**
 * BaZi Strength Analysis Types
 * ประเภทข้อมูลสำหรับวิเคราะห์ความแข็ง/อ่อนของ Day Master (แม่นที่สุด)
 */

import type { ElementName } from "@/lib/bazi/types";

/**
 * ระดับความแข็งของ Day Master (4 ระดับตาม PLAN.md)
 * - Very Strong: แข็งมาก (เก่งมาก, มีใช้แรงมาก)
 * - Strong: แข็ง (เก่ง, มีใช้แรงปานกลาง)
 * - Weak: อ่อน (อ่อนแอ, ต้องพึ่งพา)
 * - Very Weak: อ่อนมาก (อ่อนแอมาก, ต้องการค้ำยันสูง)
 */
export type StrengthLevel = "very_strong" | "strong" | "weak" | "very_weak";

/**
 * ประเภทความสัมพันธ์ 10 Gods (十神)
 * - resource: 印 (生我) - แหล่งพลังงาน, ค้ำยัน
 * - companion: 比 (同我) - เพื่อนร่วมธาตุ, เสริมกำลัง
 * - output: 食伤 (我生) - การแสดงออก, สร้างสรรค์
 * - wealth: 财 (我克) - ทรัพย์สิน, เงินทอง
 * - power: 官杀 (克我) - อำนาจ, ผู้บริหาร, คู่แข่ง
 */
export type RelationshipType = "resource" | "companion" | "output" | "wealth" | "power";

/**
 * ปัจจัยที่影响 strength แต่ละตัว
 */
export interface StrengthFactor {
  /** ชื่อปัจจัย เช่น "得令 (season)", "得地 (root)", "得势 (support)" */
  label: string;

  /** คำอธิบายภาษาไทย */
  description: string;

  /** คะแนน (+ หรือ -) */
  score: number;

  /** รายละเอียดเพิ่มเติม เช่น ["เดือน 巳 = ไฟ สร้างดิน..."] */
  details: string[];
}

/**
 * ผลการวิเคราะห์ strength ทั้งหมด
 */
export interface StrengthAnalysis {
  /** ระดับความแข็ง (very_strong/strong/weak/very_weak) */
  level: StrengthLevel;

  /** คะแนนรวม (ใช้ตัดสิน level) */
  score: number;

  /** Day Master (เจ้าวัน) */
  dayMaster: {
    /** ชื่อ天干 */
    name: string;
    /** ธาตุ */
    element: ElementName;
  };

  /** แต่ละปัจจัยที่ affect strength */
  factors: StrengthFactor[];

  /** ธาตุที่เสริม day master (resource + companion) */
  supportingElements: ElementName[];

  /** ธาตุที่ทำให้ day master อ่อน (output + wealth + power) */
  weakeningElements: ElementName[];

  /** หมายเหตุเรื่อง clash/combine ที่กระทบ strength */
  clashNotes: string[];

  /** สรุปภาษาไทย */
  summary: string;
}

/**
 * Map Strength Level → ภาษาไทย
 */
export const STRENGTH_LEVEL_THAI: Record<StrengthLevel, string> = {
  very_strong: "แข็งมาก",
  strong: "แข็ง",
  weak: "อ่อน",
  very_weak: "อ่อนมาก",
};

/**
 * Map Strength Level → อธิบายโดยย่อ (description ล้วย ไม่มี "เจ้าวันX" นำหน้า
 * เพราะผู้เรียกนำไปใช้ในรูป "เจ้าวัน{level}: {desc}" — ซ้ำคำถ้ามีนำหน้า)
 */
export const STRENGTH_LEVEL_DESC: Record<StrengthLevel, string> = {
  very_strong: "มีพลังเด็ดขาด แข็งแกร่งยิ่ง ไม่ต้องพึ่งพาคนอื่น",
  strong: "มีพลังเพียงพอ ค่อนข้างมั่นคง",
  weak: "ต้องพึ่งพาธาตุอื่นเสริม",
  very_weak: "ต้องการธาตุค้ำยันสูง",
};

/**
 * Map Relationship Type → ไทย (十神)
 */
export const RELATIONSHIP_TYPE_THAI: Record<RelationshipType, string> = {
  resource: "印 (แหล่งพลังงาน)",
  companion: "比 (เพื่อนร่วมธาตุ)",
  output: "食伤 (การแสดงออก)",
  wealth: "财 (ทรัพย์สิน)",
  power: "官杀 (อำนาจ)",
};

/**
 * Map Relationship Type → ไทย (สั้น)
 */
export const RELATIONSHIP_TYPE_SHORT: Record<RelationshipType, string> = {
  resource: "印",
  companion: "比",
  output: "食伤",
  wealth: "财",
  power: "官杀",
};
