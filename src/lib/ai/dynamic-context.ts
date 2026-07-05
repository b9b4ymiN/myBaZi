/**
 * Dynamic Context Builder — คำนวณข้อมูลเพิ่มสำหรับวัน/ปีอื่น (Layer 2)
 *
 * เมื่อ user ถามเรื่องวัน/ปีอื่น → เรียก engine calc ที่แม่นยำ 100%
 * แล้วแปลงเป็น context ภาษาไทย ใส่ใน system prompt
 *
 * ห้ามให้ AI คำนวณเอง — ใช้เครื่องมือฝั่งเซิร์ฟเวอร์เท่านั้น
 */

import type { Profile } from "@/types/profile";
import { calculateBaZi } from "@/lib/bazi/calculate";
import { analyzeLuck } from "@/lib/bazi/luck";
import { getTongShuDayInfo } from "@/lib/tongshu/day-info";
import { STEM_THAI, BRANCH_THAI } from "@/lib/bazi/pinyin";
import { ELEMENT_THAI, YINYANG_THAI } from "@/lib/bazi/types";
import { TEN_GOD_THAI } from "@/types/bazi-gods-stars";
import type { DetectedIntent } from "./intent-detector";

export interface DynamicContextResult {
  /** Context เพิ่ม ภาษาไทย (ใส่ใน system message) */
  text: string;
  /** true ถ้า compute ได้, false ถ้าไม่ support/ไม่มีข้อมูล */
  computed: boolean;
}

/**
 * Build dynamic context สำหรับ intent ที่ต้องการคำนวณเพิ่ม
 *
 * @param profile - ข้อมูลผู้ใช้ (required)
 * @param intent - ผลลัพธ์จาก detectIntent()
 * @param currentYear - ปีปัจจุบัน (ค.ศ.)
 * @returns DynamicContextResult
 */
export async function buildDynamicContext(
  profile: Profile,
  intent: DetectedIntent,
  currentYear: number
): Promise<DynamicContextResult> {
  // ถ้าไม่มี extracted data → ไม่ compute
  if (!intent.extracted) {
    return {
      text: "",
      computed: false,
    };
  }

  const { extracted } = intent;

  // ===== Case 1: future_year =====
  if (intent.intent === "future_year" && extracted.year) {
    return buildFutureYearContext(profile, extracted.year);
  }

  // ===== Case 2: future_month =====
  if (intent.intent === "future_month") {
    return buildFutureMonthContext(profile, extracted.month, currentYear);
  }

  // ===== Case 3: future_day =====
  if (intent.intent === "future_day") {
    return buildFutureDayContext(profile, extracted, currentYear);
  }

  // ===== Default: ไม่ support =====
  return {
    text: "",
    computed: false,
  };
}

/**
 * Build context สำหรับปีหน้า/ปีอื่น (future_year)
 */
function buildFutureYearContext(
  profile: Profile,
  targetYear: number,
): DynamicContextResult {
  // 1. คำนวณ BaZi chart
  const chart = calculateBaZi(profile);

  // 2. วิเคราะห์ luck ของปีเป้าหมาย
  const luckAnalysis = analyzeLuck(profile, chart, targetYear);

  // 3. สร้าง context ภาษาไทย
  const sections: string[] = [];

  sections.push("## ข้อมูลปีเป้าหมาย (สำหรับการทำนาย)");
  sections.push(`ปีเป้าหมาย: ${targetYear} ค.ศ.`);

  if (luckAnalysis.currentAnnual) {
    const annual = luckAnalysis.currentAnnual;
    const yearStem = annual.sixtyCycleName[0];
    const yearBranch = annual.sixtyCycleName[1];
    const stemThai = STEM_THAI[yearStem] || yearStem;
    const branchThai = BRANCH_THAI[yearBranch] || yearBranch;

    // แปลง stem → element และ yinYang
    const STEM_ELEMENT: Record<string, "木" | "火" | "土" | "金" | "水"> = {
      "甲": "木", "乙": "木",
      "丙": "火", "丁": "火",
      "戊": "土", "己": "土",
      "庚": "金", "辛": "金",
      "壬": "水", "癸": "水",
    };
    const STEM_YINYANG: Record<string, "阴" | "阳"> = {
      "甲": "阳", "乙": "阴",
      "丙": "阳", "丁": "阴",
      "戊": "阳", "己": "阴",
      "庚": "阳", "辛": "阴",
      "壬": "阳", "癸": "阴",
    };
    const BRANCH_ZODIAC: Record<string, string> = {
      "子": "หนู", "丑": "วัว", "寅": "เสือ", "卯": "กระต่าย",
      "辰": "มังกร", "巳": "งู", "午": "ม้า", "未": "แพะ",
      "申": "ลิง", "酉": "ไก่", "戌": "สุนัข", "亥": "หมู"
    };

    const elementThai = ELEMENT_THAI[STEM_ELEMENT[yearStem] as keyof typeof ELEMENT_THAI];
    const yinYangThai = YINYANG_THAI[STEM_YINYANG[yearStem] as keyof typeof YINYANG_THAI];
    const zodiacThai = BRANCH_ZODIAC[yearBranch] || yearBranch;
    const tenGodName = annual.tenGod as string | undefined;
    const tenGodThai = tenGodName ? (TEN_GOD_THAI[tenGodName as keyof typeof TEN_GOD_THAI] || tenGodName) : "ไม่ทราบ";

    sections.push(`\n### ปีเป้าหมาย (${targetYear} ค.ศ.)`);
    sections.push(`六十花甲: ${annual.sixtyCycleName} (${stemThai}${branchThai})`);
    sections.push(`生肖: ${zodiacThai}`);
    sections.push(`ธาตุปี: ธาตุ${elementThai} ${yinYangThai}`);
    sections.push(`10 God: ${tenGodName || "ไม่ทราบ"} (${tenGodThai})`);
    sections.push(`ความหมาย: ${getTenGodMeaning(tenGodName)}`);
  }

  if (luckAnalysis.currentPillar) {
    const pillar = luckAnalysis.currentPillar;
    const stemThai = STEM_THAI[pillar.stem.name] || pillar.stem.name;
    const branchThai = BRANCH_THAI[pillar.branch.name] || pillar.branch.name;
    const tenGodName = pillar.tenGod as string | undefined;
    const tenGodThai = tenGodName ? (TEN_GOD_THAI[tenGodName as keyof typeof TEN_GOD_THAI] || tenGodName) : "ไม่ทราบ";

    sections.push(`\n### ช่วง Luck Pillar ที่ครอบคลุมปีเป้าหมาย`);
    sections.push(`ช่วงอายุ ${pillar.startAge}-${pillar.endAge} ปี`);
    sections.push(`大运: ${pillar.sixtyCycleName} (${stemThai}${branchThai})`);
    sections.push(`10 God: ${tenGodName || "ไม่ทราบ"} (${tenGodThai})`);
    sections.push(`ความหมาย: ${getTenGodMeaning(tenGodName)}`);
  }

  // 4. เติมคำแนะนำสรุป
  sections.push(`\n### คำแนะนำสำหรับการตอบคำถาม`);
  sections.push(`- ใช้ข้อมูลข้างต้นเป็นหลักในการตอบคำถามเรื่องปี ${targetYear}`);
  sections.push(`- อ้างอิงทั้ง 10 God ของปีและ Luck Pillar ที่ครอบคลุม`);
  sections.push(`- วิเคราะห์ความเชื่อมโยงกับ Useful God, Strength, และ Structure จาก Natal Context`);
  sections.push(`- ให้คำแนะนำเชิงปฏิบัติสำหรับปีนี้โดยเฉพาะ`);
  sections.push(`- ห้ามคำนวณหรือเดาข้อมูลเพิ่มเติม — ใช้เฉพาะที่ให้มา`);

  const text = sections.join("\n");

  return {
    text,
    computed: true,
  };
}

/**
 * Build context สำหรับเดือนหน้า/เดือนอื่น (future_month)
 * NOTE: BaZi engine ไม่มี monthly luck calculation → ใช้ annual luck + Tong Shu
 */
function buildFutureMonthContext(
  profile: Profile,
  targetMonth: number | undefined,
  currentYear: number
): DynamicContextResult {
  const sections: string[] = [];

  sections.push("## ข้อมูลเดือนเป้าหมาย (สำหรับการทำนาย)");

  if (targetMonth) {
    sections.push(`เดือนเป้าหมาย: ${targetMonth}`);

    // คำนวณ BaZi chart เพื่อดู annual luck
    const chart = calculateBaZi(profile);
    const luckAnalysis = analyzeLuck(profile, chart, currentYear);

    if (luckAnalysis.currentAnnual) {
      const annual = luckAnalysis.currentAnnual;
      const yearStem = annual.sixtyCycleName[0];
      const yearBranch = annual.sixtyCycleName[1];
      const stemThai = STEM_THAI[yearStem] || yearStem;
      const branchThai = BRANCH_THAI[yearBranch] || yearBranch;
      const tenGodName = annual.tenGod as string | undefined;
      const tenGodThai = tenGodName ? (TEN_GOD_THAI[tenGodName as keyof typeof TEN_GOD_THAI] || tenGodName) : "ไม่ทราบ";

      sections.push(`\n### ปีที่ครอบคลุม (${currentYear} ค.ศ.)`);
      sections.push(`六十花甲: ${annual.sixtyCycleName} (${stemThai}${branchThai})`);
      sections.push(`10 God: ${tenGodName || "ไม่ทราบ"} (${tenGodThai})`);
    }

    sections.push(`\n### คำแนะนำสำหรับการตอบคำถาม`);
    sections.push(`- ใช้ข้อมูลปี ${currentYear} เป็นฐานในการตอบคำถามเดือน ${targetMonth}`);
    sections.push(`- BaZi ไม่มี monthly luck calculation ที่แม่นยำ → ใช้ annual luck เป็นหลัก`);
    sections.push(`- ตอบคำถามให้เป็นไปได้ (probabilistic) มากกว่าฟันธง`);
    sections.push(`- ถ้าต้องการข้อมูลละเอียด → แนะนำให้ถามเป็น "วันที่เฉพาะเจาะจง" แทน`);
  } else {
    sections.push(`เดือนเป้าหมาย: ไม่ระบุชัดเจน`);
    sections.push(`\n### คำแนะนำสำหรับการตอบคำถาม`);
    sections.push(`- ใช้ annual luck ของปี ${currentYear} เป็นฐาน`);
    sections.push(`- ตอบแบบเป็นไปได้ (probabilistic) ไม่ฟันธง`);
    sections.push(`- แนะนำให้ถามเป็น "วันที่เฉพาะเจาะจง" ถ้าต้องการคำตอบแม่นยำ`);
  }

  const text = sections.join("\n");

  return {
    text,
    computed: true,
  };
}

/**
 * Build context สำหรับวันที่เฉพาะเจาะจง (future_day)
 * ใช้ Tong Shu day info + personal resonance (ถ้ามี)
 */
function buildFutureDayContext(
  profile: Profile,
  extracted: DetectedIntent["extracted"],
  currentYear: number
): DynamicContextResult {
  const sections: string[] = [];

  // Guard: ถ้าไม่มี extracted → return
  if (!extracted) {
    return {
      text: "",
      computed: false,
    };
  }

  // 1. หาวันเป้าหมาย (YYYY-MM-DD)
  let targetDate: Date | null = null;

  if (extracted.relativeDay !== undefined) {
    // Relative day (today, tomorrow, etc.)
    const today = new Date();
    today.setDate(today.getDate() + extracted.relativeDay);
    targetDate = today;
  } else if (extracted.day) {
    // วันที่เฉพาะเจาะจง (เช่น "วันที่ 15") → ใช้เดือน/ปีปัจจุบัน
    const today = new Date();
    targetDate = new Date(currentYear, today.getMonth(), extracted.day);
  }

  if (!targetDate) {
    return {
      text: "",
      computed: false,
    };
  }

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1; // 1-12
  const day = targetDate.getDate();

  // 2. เรียก Tong Shu engine
  const tongShuInfo = getTongShuDayInfo(year, month, day);

  // 3. แปลงเป็น context ภาษาไทย
  sections.push("## ข้อมูลวันเป้าหมาย (สำหรับการทำนาย)");
  sections.push(`วันเป้าหมาย: ${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`);

  // Day Officer
  sections.push(`\n### 12 Day Officers (十二值日)`);
  sections.push(`Day Officer: ${tongShuInfo.dayOfficer.nameTh} (${tongShuInfo.dayOfficer.auspicious ? "มงคล" : "อัปมงคล"})`);
  sections.push(`ความหมาย: ${tongShuInfo.dayOfficer.meaning || "ไม่ระบุ"}`);

  // Yellow/Black Belt Star
  sections.push(`\n### ดาวเข็มขัดเหลือง/ดำ (黄黑星)`);
  sections.push(`ดาว: ${tongShuInfo.yellowBlackStar.nameTh} (${tongShuInfo.yellowBlackStar.auspicious ? "มงคล" : "อัปมงคล"})`);

  // 28 Constellations
  sections.push(`\n### 28 ดาวแซ่ (二十八宿)`);
  sections.push(`ดาว: ${tongShuInfo.constellation28.nameTh} (${tongShuInfo.constellation28.auspicious ? "มงคล" : "อัปมงคล"})`);

  // Nine Star
  sections.push(`\n### 9 ดาว (九星)`);
  sections.push(`ดาว: ${tongShuInfo.nineStar.nameTh}`);

  // Gods/Spirits
  if (tongShuInfo.gods.length > 0) {
    sections.push(`\n### เทพเจ้า/วิญญาณ (神煞)`);
    for (const god of tongShuInfo.gods) {
      sections.push(`- ${god.nameTh} (${god.auspicious ? "มงคล" : "อัปมงคล"})`);
    }
  }

  // Recommended/Avoid Activities
  if (tongShuInfo.recommends.length > 0) {
    sections.push(`\n### กิจกรรมที่ควรทำ (宜)`);
    for (const rec of tongShuInfo.recommends.slice(0, 5)) {
      sections.push(`- ${rec.nameTh}`);
    }
  }

  if (tongShuInfo.avoids.length > 0) {
    sections.push(`\n### กิจกรรมที่ควรหลีกเลี่ยง (忌)`);
    for (const avoid of tongShuInfo.avoids.slice(0, 5)) {
      sections.push(`- ${avoid.nameTh}`);
    }
  }

  // 4. Personal resonance (ถ้ามี profile)
  sections.push(`\n### ความเชื่อมโยงกับดวงส่วนตัว`);
  sections.push(`- ใช้ BaZi Natal Context + ข้อมูลวันนี้ วิเคราะห์ความเหมาะสม`);
  sections.push(`- ดูว่า Day Officer, ดาวต่างๆ ช่วย/ขัดกับ Useful God, Strength หรือไม่`);
  sections.push(`- ให้คำแนะนำเชิงปฏิบัติสำหรับวันนี้โดยเฉพาะ`);
  sections.push(`- ห้ามคำนวณหรือเดาข้อมูลเพิ่มเติม — ใช้เฉพาะที่ให้มา`);

  const text = sections.join("\n");

  return {
    text,
    computed: true,
  };
}

/**
 * แปลง 10 God name → ความหมายสั้นๆ
 */
function getTenGodMeaning(tenGodName: string | undefined): string {
  const meanings: Record<string, string> = {
    正财: "รายได้หลักที่มั่นคง เหมาะกับการหารายได้จากงานประจำ",
    偏财: "รายได้เสริม โชคลาภ การลงทุน เงินไหลมาเอง",
    正官: "อำนาจ การงาน การเป็นผู้นำ เหมาะกับตำแหน่งหัวหน้า",
    七杀: "ความทะเยอทะยาน ความก้าวหน้า แต่ต้องระวังความขัดแย้ง",
    正印: "การศึกษา ผู้ใหญ่คุ้มครอง ความรู้ เหมาะกับการเรียน",
    偏印: "ความคิดสร้างสรรค์ ศาสตร์ลึกลับ ทักษะพิเศษ",
    食神: "ความสุข การแสดง ศิลปะ การเอื้ออารี เสน่ห์แรง",
    伤官: "พรสวรรค์ การแสดง การสื่อสาร แต่ต้องระมัดระวังการพูด",
    劫财: "เพื่อนฝูง การร่วมมือ แต่ต้องระวังเรื่องเงิน",
    比肩: "เพื่อนร่วมงาน คู่แข่ง ความเท่าเทียม",
  };

  if (!tenGodName) {
    return "ไม่ระบุ";
  }

  return meanings[tenGodName] || "ไม่ระบุความหมาย";
}
