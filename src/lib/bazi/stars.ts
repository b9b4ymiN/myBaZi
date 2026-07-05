/**
 * Stars (神煞) Lookup - คำนวณดาวจาก day stem + branches
 */

import type { BaZiChart } from "./types";
import type { StarInfo } from "../../types/bazi-gods-stars";

/**
 * Lookup tables สำหรับดาวต่างๆ
 */

// 羊刃 (Yang Ren / Blade) - อัปมงคล - ดูจาก day stem
const YANG_REN_MAP: Record<string, string> = {
  "甲": "卯", // 甲→卯
  "乙": "辰", // 乙→辰
  "丙": "午", // 丙→午
  "丁": "未", // 丁→未
  "戊": "午", // 戊→午
  "己": "未", // 己→未
  "庚": "酉", // 庚→酉
  "辛": "戌", // 辛→戌
  "壬": "子", // 壬→子
  "癸": "丑", // 癸→丑
};

// 天乙贵人 (Nobility) - มงคล - ดูจาก day stem
const TIAN_YI_GUI_REN_MAP: Record<string, string[]> = {
  "甲": ["丑", "未"], // 甲戊庚→丑未
  "戊": ["丑", "未"], // 甲戊庚→丑未
  "庚": ["丑", "未"], // 甲戊庚→丑未
  "乙": ["子", "申"], // 乙己→子申
  "己": ["子", "申"], // 乙己→子申
  "丙": ["亥", "酉"], // 丙丁→亥酉
  "丁": ["亥", "酉"], // 丙丁→亥酉
  "辛": ["寅", "午"], // 辛→寅午
  "壬": ["卯", "巳"], // 壬癸→卯巳
  "癸": ["卯", "巳"], // 壬癸→卯巳
};

// 文昌 (Literature) - มงคล - ดูจาก day stem
const WEN_CHANG_MAP: Record<string, string> = {
  "甲": "巳", // 甲→巳
  "乙": "午", // 乙→午
  "丙": "申", // 丙戊→申
  "戊": "申", // 丙戊→申
  "丁": "酉", // 丁己→酉
  "己": "酉", // 丁己→酉
  "庚": "亥", // 庚→亥
  "辛": "子", // 辛→子
  "壬": "寅", // 壬→寅
  "癸": "卯", // 癸→卯
};

// 桃花 (Peach Blossom) - มงคลความรัก - ดูจาก day branch (หรือ year branch)
// ใช้ day branch เป็นหลัก
const PEACH_BLOSSOM_MAP: Record<string, string> = {
  "申": "酉", // 申子辰→酉
  "子": "酉", // 申子辰→酉
  "辰": "酉", // 申子辰→酉
  "巳": "午", // 巳酉丑→午
  "酉": "午", // 巳酉丑→午
  "丑": "午", // 巳酉丑→午
  "寅": "卯", // 寅午戌→卯
  "午": "卯", // 寅午戌→卯
  "戌": "卯", // 寅午戌→卯
  "亥": "子", // 亥卯未→子
  "卯": "子", // 亥卯未→子
  "未": "子", // 亥卯未→子
};

// 驿马 (Travel Horse/Sky Horse) - มงคลการเดินทาง - ดูจาก day branch
const YI_MA_MAP: Record<string, string> = {
  "申": "寅", // 申子辰→寅
  "子": "寅", // 申子辰→寅
  "辰": "寅", // 申子辰→寅
  "巳": "亥", // 巳酉丑→亥
  "酉": "亥", // 巳酉丑→亥
  "丑": "亥", // 巳酉丑→亥
  "寅": "申", // 寅午戌→申
  "午": "申", // 寅午戌→申
  "戌": "申", // 寅午戌→申
  "亥": "巳", // 亥卯未→巳
  "卯": "巳", // 亥卯未→巳
  "未": "巳", // 亥卯未→巳
};

// 华盖 (Canopy) - ดูจาก day branch
const HUA_GAI_MAP: Record<string, string> = {
  "申": "辰", // 申子辰→辰
  "子": "辰", // 申子辰→辰
  "辰": "辰", // 申子辰→辰
  "巳": "丑", // 巳酉丑→丑
  "酉": "丑", // 巳酉丑→丑
  "丑": "丑", // 巳酉丑→丑
  "寅": "戌", // 寅午戌→戌
  "午": "戌", // 寅午戌→戌
  "戌": "戌", // 寅午戌→戌
  "亥": "未", // 亥卯未→未
  "卯": "未", // 亥卯未→未
  "未": "未", // 亥卯未→未
};

/**
 * หาดาวทั้งหมดใน chart
 *
 * @param chart - BaZiChart ที่ต้องการคำนวณดาว
 * @returns StarInfo[] - ดาวทั้งหมดที่พบ
 */
export function findStars(chart: BaZiChart): StarInfo[] {
  const stars: StarInfo[] = [];
  const dayStem = chart.dayMaster.name;
  const dayBranch = chart.day.branch.name;

  // รวบรวม branches ทั้งหมดใน chart
  const branches: Array<{ name: string; position: "year" | "month" | "day" | "hour" }> = [
    { name: chart.year.branch.name, position: "year" },
    { name: chart.month.branch.name, position: "month" },
    { name: chart.day.branch.name, position: "day" },
  ];

  if (chart.hour) {
    branches.push({ name: chart.hour.branch.name, position: "hour" });
  }

  // 1. 羊刃 (Yang Ren / Blade) - อัปมงคล
  const yangRenBranch = YANG_REN_MAP[dayStem];
  if (yangRenBranch) {
    const found = branches.find((b) => b.name === yangRenBranch);
    if (found) {
      stars.push({
        name: "羊刃",
        nameTh: "羊刃 (เลื่อยควาย)",
        category: "inauspicious",
        position: found.position,
        description: "ดาวแห่งความรุนแรงและการตัดสินใจเด็ดขาด อาจนำมาซึ่งอุบัติเหตุหรือการบาดเจ็บ",
      });
    }
  }

  // 2. 天乙贵人 (Nobility) - มงคล
  const tianYiBranches = TIAN_YI_GUI_REN_MAP[dayStem] || [];
  for (const branchName of tianYiBranches) {
    const found = branches.find((b) => b.name === branchName);
    if (found) {
      stars.push({
        name: "天乙贵人",
        nameTh: "天乙贵人 (ผู้ใหญ่ผู้มีอุปการคุณ)",
        category: "auspicious",
        position: found.position,
        description: "ดาวแห่งโชคลาภและผู้อุปถัมภ์ ชีวิตได้รับความช่วยเหลือจากบุคคลผู้ใหญ่",
      });
    }
  }

  // 3. 文昌 (Literature) - มงคล
  const wenChangBranch = WEN_CHANG_MAP[dayStem];
  if (wenChangBranch) {
    const found = branches.find((b) => b.name === wenChangBranch);
    if (found) {
      stars.push({
        name: "文昌",
        nameTh: "文昌 (ดาวแห่งวัฒนธรรม)",
        category: "auspicious",
        position: found.position,
        description: "ดาวแห่งปัญญาและความฉลาด เหมาะกับการศึกษาและงานวิชาการ",
      });
    }
  }

  // 4. 桃花 (Peach Blossom) - มงคลความรัก
  const peachBlossomBranch = PEACH_BLOSSOM_MAP[dayBranch];
  if (peachBlossomBranch) {
    const found = branches.find((b) => b.name === peachBlossomBranch);
    if (found) {
      stars.push({
        name: "桃花",
        nameTh: "桃花 (ดอกท้อ)",
        category: "auspicious",
        position: found.position,
        description: "ดาวแห่งความรักและเสน่ห์ ดีมีความสุขในความสัมพันธ์และได้รับความนิยม",
      });
    }
  }

  // 5. 驿马 (Travel Horse) - มงคลการเดินทาง
  const yiMaBranch = YI_MA_MAP[dayBranch];
  if (yiMaBranch) {
    const found = branches.find((b) => b.name === yiMaBranch);
    if (found) {
      stars.push({
        name: "驿马",
        nameTh: "驿马 (ม้าออกท่อง)",
        category: "auspicious",
        position: found.position,
        description: "ดาวแห่งการเดินทางและการเปลี่ยนแปลง ชีวิตเคลื่อนไหวและมักจะไปไหนมาไหน",
      });
    }
  }

  // 6. 华盖 (Canopy)
  const huaGaiBranch = HUA_GAI_MAP[dayBranch];
  if (huaGaiBranch) {
    const found = branches.find((b) => b.name === huaGaiBranch);
    if (found) {
      stars.push({
        name: "华盖",
        nameTh: "华盖 (หลังคาเครื่องสูง)",
        category: "auspicious",
        position: found.position,
        description: "ดาวแห่งศาสนาและปรัชญา มีความสนใจในเรื่องลึกลับหรือศาสนา",
      });
    }
  }

  return stars;
}
