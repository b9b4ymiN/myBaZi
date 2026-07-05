export type Gender = "male" | "female";
export type BirthTimeKnown = "known" | "unknown";

export interface Profile {
  id: string;                // crypto.randomUUID()
  name: string;              // ชื่อเล่น/ชื่อ (required, trim)
  gender: Gender;            // สำคัญต่อ Luck Pillar ทิศ
  birthDate: string;         // "YYYY-MM-DD" (required)
  birthTime: string | null;  // "HH:mm" (null ถ้า unknown)
  birthTimeKnown: BirthTimeKnown;  // "known" | "unknown"
  timezone: string;          // IANA tz, default "Asia/Bangkok"
  birthLongitude?: number;   // ลองจิจูดของสถานที่เกิด (degrees, -180 ถึง 180) เช่น 100.5 สำหรับกทม.
  useTrueSolarTime?: boolean; // default true (TST แม่นกว่า). false = Beijing standard time
  note?: string;             // หมายเหตุ (optional)
  createdAt: string;         // ISO
  updatedAt: string;         // ISO
}
