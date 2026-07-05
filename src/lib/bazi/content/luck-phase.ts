/**
 * Luck Phase Meanings (大运阶段) — ความหมายของ รุ่ง/กลาง/ระวัง
 * Framing probabilistic — เป็นเคอร์เซอร์ "ช่วงไหนโฟกัส/ระวัง" ไม่ใช่พยากรณ์ร้ายแรง
 */

import type { LuckPhaseMeaning } from "./types";

export const LUCK_PHASE_MEANING: Record<
  "favorable" | "neutral" | "unfavorable",
  LuckPhaseMeaning
> = {
  favorable: {
    favorability: "favorable",
    description:
      "ช่วงที่ luck เติม 用神/喜神 — พลังดวงเด่น สบายขึ้น สิ่งต้านทานน้อยลง",
    advice:
      "โอกาสทอง — เหมาะทำสิ่งสำคัญ เช่น เริ่มธุรกิจ ตัดสินใจใหญ่ ลงทุน สานความสัมพันธ์ ย้ายงาน",
  },
  neutral: {
    favorability: "neutral",
    description:
      "luck ไม่ได้เติม 用/喜/忌 โดยตรง — ช่วงปกติ ทำเลี้ยงตัว ไม่มีแรงหนุนหรือต้านมาก",
    advice:
      "ใช้ช่วงนี้สะสม พักผ่อน เรียนรู้ และเตรียมตัว — ไม่ต้องเร่งสิ่งใหญ่ แต่อย่าปล่อยว่าง",
  },
  unfavorable: {
    favorability: "unfavorable",
    description:
      "ช่วงที่ luck เติม 忌神 — พลังดวงตก เจอแรงต้าน สิ่งกีดขวาง",
    advice:
      "ระวัง อย่าเสี่ยงใหญ่ อย่าตัดสินใจ impulsive — รักษา ๆ ไว้ สะสมพลัง และคอยจังหวะถัดไป (ช่วงนี้ผ่านไปเร็ว)",
  },
};
