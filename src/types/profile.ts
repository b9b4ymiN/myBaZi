export type Gender = "male" | "female";
export type BirthTimeKnown = "known" | "unknown";

/**
 * ความสัมพันธ์ของ profile นี้กับ "เจ้าของ" (profile ที่เป็นตัวเอง)
 * ใช้ในระบบวิเคราะห์ความสัมพันธ์ (六亲 / 合婚) + AI context
 * optional — undefined = ยังไม่ระบุ (backward-compat สำหรับ profile เก่า)
 */
export type RelationshipRole =
  | "self"      // ตัวเอง / เจ้าของ
  | "spouse"    // คู่ครอง (สามี / ภรรยา)
  | "father"    // พ่อ
  | "mother"    // แม่
  | "son"       // ลูกชาย
  | "daughter"  // ลูกสาว
  | "sibling"   // พี่น้อง
  | "friend"    // เพื่อน
  | "other";    // อื่นๆ

export interface Profile {
  id: string;                // crypto.randomUUID()
  name: string;              // ชื่อเล่น/ชื่อ (required, trim)
  gender: Gender;            // สำคัญต่อ Luck Pillar ทิศ + 六亲 mapping
  relationship?: RelationshipRole; // ความสัมพันธ์กับเจ้าของ (optional — undefined = ยังไม่ระบุ)
  birthDate: string;         // "YYYY-MM-DD" (required)
  birthTime: string | null;  // "HH:mm" (null ถ้า unknown)
  birthTimeKnown: BirthTimeKnown;  // "known" | "unknown"
  timezone: string;          // IANA tz, default "Asia/Bangkok"
  birthLongitude?: number;   // ลองจิจูดของสถานที่เกิด (degrees, -180 ถึง 180) เช่น 100.5 สำหรับกทม.
  useTrueSolarTime?: boolean; // default true (TST แม่นกว่า). false = Beijing standard time
  birthLocationKey?: string; // key ของจังหวัดจาก BIRTH_LOCATIONS (เช่น "bangkok") — derive timezone+longitude อัตโนมัติ. undefined = กรอกเอง (กำหนดเอง mode)
  note?: string;             // หมายเหตุ (optional)
  createdAt: string;         // ISO
  updatedAt: string;         // ISO
}
