/**
 * BaZi Useful God Analysis Types (用神 / Yong Shen)
 * ประเภทข้อมูลสำหรับวิเคราะห์ธาตุที่เป็นประโยชน์ (用神) และธาตุที่ควรหลีกเลี่ยง (忌神)
 */

import type { ElementName } from "@/lib/bazi/types";

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
 * ผลการวิเคราะห์ Useful God (用神)
 */
export interface UsefulGodAnalysis {
  /** ธาตุหลักที่เป็นประโยชน์ที่สุด (用神) */
  primaryElement: ElementName;

  /** ความสัมพันธ์ระหว่าง day master กับ primary element */
  primaryRelationship: RelationshipType;

  /** ธาตุรองที่เป็นประโยชน์ (喜神 — ช่วยเสริม) */
  secondaryElements: ElementName[];

  /** ธาตุที่ควรหลีกเลี่ยง (忌神 — ทำลาย useful god) */
  avoidElements: ElementName[];

  /** ภาษาไทย เช่น "ธาตุไฟ (ทรัพย์)" */
  label: string;

  /** ภาษาจีน เช่น "用神：火（正财）" */
  labelCn: string;

  /** อธิบายทำไมธาตุนี้จึงเป็นประโยชน์ */
  description: string;

  /** รายละเอียดทีละข้อ ภาษาไทย */
  reasons: string[];

  /** คำแนะนำเบาๆ เช่น "เหมาะกับอาชีพการเงิน สีแดง/ม่วง" */
  applicationTips: string;
}

/**
 * Map Relationship Type → ภาษาไทย (十神)
 */
export const RELATIONSHIP_TYPE_THAI: Record<RelationshipType, string> = {
  resource: "印 (แหล่งพลังงาน)",
  companion: "比 (เพื่อนร่วมธาตุ)",
  output: "食伤 (การแสดงออก)",
  wealth: "财 (ทรัพย์สิน)",
  power: "官杀 (อำนาจ)",
};

/**
 * Map Relationship Type → ภาษาจีน (十神)
 */
export const RELATIONSHIP_TYPE_CN: Record<RelationshipType, string> = {
  resource: "印",
  companion: "比",
  output: "食伤",
  wealth: "财",
  power: "官杀",
};
