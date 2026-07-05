/**
 * Content Library schema — typed structures สำหรับ content ปาจื้อ
 * ทั้งหมดเป็น deterministic data (no AI) อิงตำรา 子平真诠/滴天髓
 *
 * ไฟล์ content จริงอยู่ใน:
 *   ten-god-meanings.ts       (C.2)
 *   palace-meanings.ts        (C.3)
 *   element-health.ts         (C.3)
 *   useful-god-application.ts (C.4)
 *   luck-phase.ts             (C.4)
 */

import type { ElementName } from "../types";
import type { TenGodName } from "../../../types/bazi-gods-stars";
import type {
  RelationshipType,
} from "../../../types/bazi-useful-god";

/** Domain ของชีวิตที่ใช้สร้าง narrative */
export type LifeDomain =
  | "personality" // บุคลิก
  | "career" // การงาน
  | "wealth" // การเงิน
  | "relationship" // ความรัก/คู่
  | "health" // สุขภาพ
  | "timing" // จังหวะเวลา
  | "family"; // ครอบครัว

/** ความหมายของ 1 ten god (C.2) */
export interface TenGodMeaning {
  name: TenGodName;
  /** ชื่อไทย */
  nameTh: string;
  /** ความหมายแกนกลาง (1-2 ประโยค) */
  essence: string;
  /** บุคลิกเมื่อเด่น */
  personality: string[];
  /** แนวโน้มการงาน */
  career: string[];
  /** แนวโน้มการเงิน */
  wealth: string[];
  /** แนวโน้มความสัมพันธ์ */
  relationship: string[];
  /** บุคคลตัวแทน (six relatives: พ่อ/แม่/พี่น้อง/คู่/ลูก/ผู้บังคับ) */
  representatives: string[];
  /** ข้อควรระวังเมื่อเด่นเกินหรือขาด */
  caution: string;
}

/** ความหมาย palace (C.3) */
export interface PalaceMeaning {
  position: "year" | "month" | "day" | "hour";
  lifeDomain: string;
  /** คำอธิบายเมื่อ ten god ใดๆ อยู่ใน palace นี้ (key = ten god) */
  byTenGod: Partial<Record<TenGodName, string>>;
}

/** สุขภาพตามธาตุ (C.3) — กรอบระวัง ไม่ฟันธงโรค */
export interface ElementHealth {
  element: ElementName;
  /** อวัยวะ/ระบบที่ธาตุนี้ดูแลตามการแพทย์จีน */
  organs: string[];
  /** สิ่งที่ควรสังเกตเมื่อธาตุนี้เสีย/ขาด (probabilistic framing) */
  whenImbalanced: string;
}

/** การประยุกต์ใช้ relationship เป็น 用神 (C.4) */
export interface RelationshipApplication {
  relationship: RelationshipType;
  /** ความหมายเมื่อ relationship นี้เป็น 用神 */
  asUsefulGod: string;
  /** จังหวะเด่น (เมื่อไร relationship นี้สำคัญ) */
  timingNote: string;
}

/** ความหมาย luck phase (C.4) */
export interface LuckPhaseMeaning {
  favorability: "favorable" | "neutral" | "unfavorable";
  /** คำอธิบายช่วง */
  description: string;
  /** คำแนะนำ */
  advice: string;
}
