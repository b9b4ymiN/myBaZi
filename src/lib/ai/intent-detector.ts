/**
 * Intent Detector — ตรวจจับว่า user ถามเรื่องอะไร
 *
 * แยกประเภทคำถาม เพื่อใช้ใน Layer 2 (Dynamic Context)
 * - natal: ถามเรื่องดวงประจำตัว (นิสัย, ลักษณะ, จุดแข็ง/อ่อน)
 * - future_year: ถามเรื่องปีหน้า/ปีอื่น (เช่น "ปี 2026", "ปีหน้า")
 * - future_month: ถามเรื่องเดือนหน้า/เดือนอื่น
 * - future_day: ถามเรื่องวันที่เฉพาะเจาะจง (เช่น "วันที่ 15", "พรุ่งนี้")
 * - six_relative: ถามเรื่องความสัมพันธ์/คู่ครอง/ครอบครัว (六亲)
 * - general: คำถามทั่วไป (ไม่ต้องการคำนวณเพิ่ม)
 */

import type { RelationshipRole } from "@/types/profile";

export type Intent = "natal" | "future_year" | "future_month" | "future_day" | "six_relative" | "general";

/**
 * Role เป้าหมายที่ user ถามในคำถาม六亲
 * - RelationshipRole เฉพาะเจาะจง (spouse/mother/father/son/daughter/sibling)
 * - "any-relative": ถามกว้าง ("ครอบครัว", "พ่อแม่") — findRelativeProfile ใช้ priority
 * - "child": ถาม "ลูก" generic ไม่ระบุเพศ — findRelativeProfile หา son หรือ daughter
 */
export type SixRelativeTargetRole = RelationshipRole | "any-relative" | "child";

export interface DetectedIntent {
  intent: Intent;
  extracted?: {
    year?: number;
    month?: number;
    day?: number;
    relativeDay?: number; // 0=today, 1=tomorrow, -1=yesterday
    targetRole?: SixRelativeTargetRole; // ใช้เฉพาะ intent === "six_relative"
  };
}

/**
 * คำประกอบที่มี "พ่อ/แม่/ลูก" แต่ไม่ใช่ relative — sanitize ออกก่อน match
 * (ไทยไม่มี word-boundary → "พ่อค้า" จะถูก match เป็น "พ่อ" ถ้าไม่กำจัดก่อน)
 */
const RELATIVE_BLACKLIST_WORDS = [
  "พ่อค้า", "แม่ค้า", "พ่อแม่ค้า", "พ่อมด", "แม่มด", "แม่น้ำ", "แม่บ้าน", "แม่พิมพ์", "แม่แบบ", "แม่เหล็ก",
  "ลูกชิ้น", "ลูกน้ำ", "ลูกบาศก์", "ลูกตา", "ลูกศร", "ลูกเสียง", "ลูกโลก", "ลูกกรง", "ลูกจ้าง", "ลูกค้า",
  "ลูกผสม", "ลูกปัด", "ลูกกวาด", "ลูกกลิ้ง", "ลูกเต๋า", "ลูกสน", "ลูกกล้า",
];

const ANY_RELATIVE_KEYWORDS = [
  "พ่อแม่", "ครอบครัว", "ญาติพี่น้อง", "ญาติ", "คนในครอบครัว", "คนในบ้าน",
  "สมาชิกในครอบครัว", "สมาชิก", "พ่อแม่ลูก", "family", "relatives",
];

const SPOUSE_KEYWORDS = [
  "คู่ครอง", "คู่ชีวิต", "สามี", "ภรรยา", "แฟน", "คนรัก", "แต่งงาน", "ความรัก",
  "ดาวคู่ครอง", "ดาวคู่", "เนื้อคู่", "คู่แต่งงาน", "合婚", "compatibility",
  "spouse", "marriage", "marry", "partner", "husband", "wife", "fiance", "fiancee",
];

const SON_KEYWORDS = ["ลูกชาย", "บุตรชาย", "ลูกผู้ชาย"];
const DAUGHTER_KEYWORDS = ["ลูกสาว", "บุตรสาว", "ลูกผู้หญิง"];
const CHILD_KEYWORDS = ["ลูก", "บุตร", "children", "child"]; // generic — ไม่ระบุเพศ
const MOTHER_KEYWORDS = ["แม่", "mother"];
const FATHER_KEYWORDS = ["พ่อ", "father"];
const SIBLING_KEYWORDS = ["พี่น้อง", "พี่ชาย", "พี่สาว", "น้องชาย", "น้องสาว", "sibling", "brother", "sister"];

/**
 * Classify role เป้าหมายจากคำถาม六亲
 *
 * Priority: any-relative → spouse → son → daughter → child → mother → father → sibling
 * - ตรวจ "พ่อแม่"/"ครอบครัว" ก่อน specific (เพราะมีทั้ง father+mother คำในประโยคเดียว)
 * - son/daughter ก่อน child generic (เพราะ "ลูกชาย" มี "ลูก")
 * - sanitize blacklist ก่อนทุก match (กัน "พ่อค้า" → father)
 *
 * @param msg - ข้อความ normalized (lowercase, แปลงเลขไทยเป็นอาหรับแล้ว)
 * @returns SixRelativeTargetRole หรือ null ถ้าไม่ใช่คำถาม relative
 */
export function detectSixRelativeRole(msg: string): SixRelativeTargetRole | null {
  // Sanitize blacklist — กำจัดคำประกอบก่อน match role
  let sanitized = msg;
  for (const word of RELATIVE_BLACKLIST_WORDS) {
    sanitized = sanitized.split(word).join(" ");
  }

  const has = (keywords: string[]): boolean =>
    keywords.some((k) => sanitized.includes(k.toLowerCase()));

  if (has(ANY_RELATIVE_KEYWORDS)) return "any-relative";
  if (has(SPOUSE_KEYWORDS)) return "spouse";
  if (has(SON_KEYWORDS)) return "son";
  if (has(DAUGHTER_KEYWORDS)) return "daughter";
  if (has(CHILD_KEYWORDS)) return "child";
  if (has(MOTHER_KEYWORDS)) return "mother";
  if (has(FATHER_KEYWORDS)) return "father";
  if (has(SIBLING_KEYWORDS)) return "sibling";

  return null;
}

/**
 * Detect intent จาก user message
 *
 * @param userMessage - ข้อความของผู้ใช้
 * @param currentYear - ปีปัจจุบัน (ค.ศ.)
 * @returns DetectedIntent
 */
export function detectIntent(userMessage: string, currentYear: number): DetectedIntent {
  const msg = userMessage.toLowerCase().trim();

  // ===== Helper: แปลงเลขไทย → อาหรับ =====
  const thaiToArabic = (text: string): string => {
    return text.replace(/[๐-๙]/g, (digit) => {
      const thaiDigits = "๐๑๒๓๔๕๖๗๘๙";
      return thaiDigits.indexOf(digit).toString();
    });
  };

  const normalizedMsg = thaiToArabic(msg);

  // ===== Pattern 1: ถามเรื่องปี (future_year) =====
  const yearPatterns = [
    /ปี\s*(\d{4})/,  // "ปี 2026", "ปี2026"
    /ปี\s*(\d{1,2})\s*/,  // "ปี 67" (พ.ศ. 2567 = 2024, so 67 → 2024)
    /(\d{4})\s*เป็นไง/,  // "2026 เป็นยังไง"
    /(\d{4})\s*ดีไหม/,  // "2026 ดีไหม"
    /(\d{4})\s*มีอะไร/,  // "2026 มีอะไรเกิด"
    /ปีหน้า/,  // "ปีหน้า"
    /สองปีหน้า/,  // "สองปีหน้า"
    /สามปีหน้า/,  // "สามปีหน้า"
  ];

  for (const pattern of yearPatterns) {
    const match = normalizedMsg.match(pattern);
    if (match) {
      const yearOrText = match[1];

      // ถ้าเป็นเลข 4 หลัก → ใช้เลย (ค.ศ.)
      if (yearOrText && /^\d{4}$/.test(yearOrText)) {
        const year = parseInt(yearOrText, 10);
        if (year >= 1900 && year <= 2100) {
          return { intent: "future_year", extracted: { year } };
        }
      }

      // ถ้าเป็นเลข 2 หลัก → แปลงเป็น ค.ศ. (พ.ศ. - 543)
      if (yearOrText && /^\d{2}$/.test(yearOrText)) {
        const yearBE = parseInt(yearOrText, 10);
        if (yearBE >= 50 && yearBE <= 99) {
          const yearCE = 2500 + yearBE - 543;
          return { intent: "future_year", extracted: { year: yearCE } };
        }
      }

      // ถ้าเป็นข้อความ → คำนวณจากปีปัจจุบัน
      if (yearOrText === "หน้า") {
        return { intent: "future_year", extracted: { year: currentYear + 1 } };
      }
      if (yearOrText === "สองปีหน้า" || match[0] === "สองปีหน้า") {
        return { intent: "future_year", extracted: { year: currentYear + 2 } };
      }
      if (yearOrText === "สามปีหน้า" || match[0] === "สามปีหน้า") {
        return { intent: "future_year", extracted: { year: currentYear + 3 } };
      }
    }
  }

  // ===== Pattern 2: ถามเรื่องเดือน (future_month) =====
  const monthPatterns = [
    /เดือนหน้า/,
    /สองเดือนหน้า/,
    /สามเดือนหน้า/,
    /เดือน\s+([\dก-๙]+)/,  // "เดือน 12", "เดือน ธันวา"
  ];

  for (const pattern of monthPatterns) {
    const match = normalizedMsg.match(pattern);
    if (match) {
      const monthText = match[1] || match[0];

      // ถ้าเป็นเลข → แปลงเป็นตัวเลข
      if (match[1]) {
        const monthNum = parseInt(match[1], 10);
        if (monthNum >= 1 && monthNum <= 12) {
          return { intent: "future_month", extracted: { month: monthNum } };
        }
      }

      // ถ้าเป็นข้อความ → คำนวณจากเดือนปัจจุบัน (flag แต่ไม่ compute ละเอียด)
      if (monthText.includes("หน้า")) {
        return { intent: "future_month" }; // ไม่ระบุเดือนชัดเจน ให้ orchestrator จัดการ
      }
    }
  }

  // ===== Pattern 3: ถามเรื่องวันที่ (future_day) =====
  const dayPatterns = [
    /วันที่\s+(\d{1,2})/,  // "วันที่ 15", "วันที่15"
    /(\d{1,2})\s*([กนมธ]|พฤหัส|ศุกร์|เสาร์|อาทิตย์)/,  // "15 ก.พ.", "15 กพ"
    /พรุ่งนี้/,
    /มะรืนนี้/,
    /วันนี้/,
    /เมื่อวาน/,
    /วันพรุ่งนี้/,
    /สองวันหน้า/,
    /สามวันหน้า/,
  ];

  for (const pattern of dayPatterns) {
    const match = normalizedMsg.match(pattern);
    if (match) {
      const dayOrText = match[1] || match[0];

      // ถ้าเป็นเลข → วันที่เฉพาะเจาะจง
      if (match[1]) {
        const dayNum = parseInt(match[1], 10);
        if (dayNum >= 1 && dayNum <= 31) {
          return { intent: "future_day", extracted: { day: dayNum } };
        }
      }

      // ถ้าเป็นข้อความ relative → ใช้ relativeDay
      if (dayOrText === "พรุ่งนี้" || dayOrText.includes("พรุ่งนี้")) {
        return { intent: "future_day", extracted: { relativeDay: 1 } };
      }
      if (dayOrText === "มะรืนนี้") {
        return { intent: "future_day", extracted: { relativeDay: 2 } };
      }
      if (dayOrText === "วันนี้") {
        return { intent: "future_day", extracted: { relativeDay: 0 } };
      }
      if (dayOrText === "เมื่อวาน") {
        return { intent: "future_day", extracted: { relativeDay: -1 } };
      }
      if (dayOrText === "สองวันหน้า" || match[0] === "สองวันหน้า") {
        return { intent: "future_day", extracted: { relativeDay: 2 } };
      }
      if (dayOrText === "สามวันหน้า" || match[0] === "สามวันหน้า") {
        return { intent: "future_day", extracted: { relativeDay: 3 } };
      }
    }
  }

  // ===== Pattern 4: ถามเรื่อง六亲 (ความสัมพันธ์/คู่ครอง/ครอบครัว) =====
  // classify targetRole เพื่อ resolve relative profile ที่ตรงกับคำถาม (N=1)
  const sixRelativeRole = detectSixRelativeRole(normalizedMsg);
  if (sixRelativeRole) {
    return { intent: "six_relative", extracted: { targetRole: sixRelativeRole } };
  }

  // ===== Pattern 5: ถามเรื่อง natal (ดวงประจำตัว) =====
  const natalPatterns = [
    /นิสัย/,
    /ลักษณะ/,
    /บุคลิก/,
    /จุดแข็ง/,
    /จุดอ่อน/,
    /ฉันเป็นคนแบบไหน/,
    /ชีวิตฉัน/,
    /ดวงฉัน/,
    /ตัวฉัน/,
    /เจ้าวัน/,
    /day\s*master/i,
  ];

  for (const pattern of natalPatterns) {
    if (pattern.test(normalizedMsg)) {
      return { intent: "natal" };
    }
  }

  // ===== Default: general =====
  return { intent: "general" };
}
