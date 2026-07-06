/**
 * 三合 (Three-way Harmony) และ 半三合 (Half Three-way Harmony)
 * การผนึกกันของ地支 (Earthly Branches) 3 ตัว หรือ 2 ตัว ที่สร้างธาตุ
 *
 * กฎ 三合: branches 3 ตัวที่ระบุจะผนึกกันและแปรสภาพเป็นธาตุที่กำหนด
 * กฎ 半三合: branches 2 ตัวจากชุดเดียวกันยังคงสร้างความกลมกลืน (แต่อ่อนกว่า)
 *
 * สำคัญมากสำหรับ 合婚 (การดูความเข้ากันของดวงคู่):
 * - ถ้ามี三合หรือ半三合ระหว่าง地支ในดวงคู่ → สัญญาณความสามัคคีสูงมาก
 * - แตกต่างจาก 六合 (pair-harmony ใน interactions.ts) ที่เป็นเพียงคู่เดียว
 *
 * ⚠️ โมดูลนี้เสริม interactions.ts (六ḫคู่เดียว) โดยไม่ซ้ำซ้อน
 *    interactions.ts: คู่ harmony (六合) เช่น 子丑 → 土
 *    three-harmony.ts: ทริปเปิล harmony (三合) เช่น 申子辰 → 水
 */

import type { ElementName } from "./types";

/**
 * ชื่อ地支 (Earthly Branch) ทั้ง 12 ตัว
 * (ใช้ local type เนื่องจาก BranchInfo.name ใน types.ts เป็น string ทั่วไป)
 */
export type BranchName = "子" | "丑" | "寅" | "卯" | "辰" | "巳" | "午" | "未" | "申" | "酉" | "戌" | "亥";

/**
 * ชื่อ三合ทั้ง 4 แบบ (ตามลำดับมาตรฐาน)
 */
export type HarmonyFrame = "申子辰" | "亥卯未" | "寅午戌" | "巳酉丑";

/**
 * ความแรงของ半三合 (Half Harmony)
 * - strong: รวม middle branch (子/卯/午/酉 - 帝旺 peak branch) → 旺半合
 * - weak: เฉพาะ start + end (no middle) → 拱 (arch) half
 */
export type HarmonyStrength = "strong" | "weak";

/**
 * ผลลัพธ์การตรวจสอบ三合/半三合
 */
export interface ThreeHarmonyResult {
  /** พบ harmony (full หรือ half) หรือไม่ */
  found: boolean;
  /** ประเภท: "full" = 3 ตัวครบ, "half" = 2 ตัว, "none" = ไม่มี */
  type: "full" | "half" | "none";
  /** ชื่อ frame (มีค่าก็ต่อเมื่อ found === true) */
  frame?: HarmonyFrame;
  /** ธาตุที่แปรสภาพ (มีค่าก็ต่อเมื่อ found === true) */
  transformElement?: ElementName;
  /** ความแรงของ half harmony (มีความหมายเมื่อ type === "half") */
  strength?: HarmonyStrength;
  /** branches ของ frame ที่มีอยู่ใน input */
  presentBranches: BranchName[];
  /** branches ของ frame ที่ไม่มีใน input */
  missingBranches: BranchName[];
}

/**
 * ตาราง三合 (Three-way Harmony Frames) - คู่ที่ผนึกและธาตุที่แปรสภาพ
 *
 * | Frame (局) | Branches | Transform Element | Middle Branch (帝旺) |
 * |------------|----------|-------------------|----------------------|
 * | 水局 (Water frame) | 申 · 子 · 辰 | 水 (Water) | 子 |
 * | 木局 (Wood frame)  | 亥 · 卯 · 未 | 木 (Wood)  | 卯 |
 * | 火局 (Fire frame)  | 寅 · 午 · 戌 | 火 (Fire)  | 午 |
 * | 金局 (Metal frame) | 巳 · 酉 · 丑 | 金 (Metal) | 酉 |
 *
 * หมายเหตุ:
 * - ลำดับไม่สำคัญ: ["申","子","辰"] === ["辰","子","申"]
 * - Middle branch (帝旺) = จุดแข็งสุดของธาตุ → 半三合ที่รวม middle เรียก "旺半合" (strong)
 * - Half โดยไม่มี middle (เช่น 申+辰) เรียก "拱" (arch) → weak half harmony
 * - Branches จาก frame ต่างกันไม่形成三合/半三合
 * - Duplicates ใน input ถูกย่อย (เช่น [子,子,辰] ยังคงเป็น half, ไม่ใช่ full)
 */
const HARMONY_FRAMES: Array<{
  frame: HarmonyFrame;
  branches: [BranchName, BranchName, BranchName]; // [start, middle, end]
  transformElement: ElementName;
  middle: BranchName;
}> = [
  {
    frame: "申子辰",
    branches: ["申", "子", "辰"], // start, middle, end
    transformElement: "水",
    middle: "子", // 帝旺 peak of Water
  },
  {
    frame: "亥卯未",
    branches: ["亥", "卯", "未"],
    transformElement: "木",
    middle: "卯", // 帝旺 peak of Wood
  },
  {
    frame: "寅午戌",
    branches: ["寅", "午", "戌"],
    transformElement: "火",
    middle: "午", // 帝旺 peak of Fire
  },
  {
    frame: "巳酉丑",
    branches: ["巳", "酉", "丑"],
    transformElement: "金",
    middle: "酉", // 帝旺 peak of Metal
  },
];

/**
 * ตรวจสอบ三合/半三合 จาก collection ของ branches
 *
 * @param branches - array ของชื่อ地支 (เช่น ทั้ง 4 ของ chart, หรือรวมสอง chart สำหรับ 合婚)
 * @returns ผลลัพธ์การตรวจสอบ (found + type + frame + transformElement + ...)
 *
 * Best-match precedence (ถ้าหลาย frame match):
 * 1. Full harmony (3 ตัว) มีความสำคัญสูงสุด
 * 2. Half harmony ที่ strong (includes middle) สำคัญกว่า weak
 * 3. กรณี tie → เลือก frame ตามลำดับมาตรฐาน (申子辰, 亥卯未, 寅午戌, 巳酉丑)
 *
 * @example
 * detectThreeHarmony(["申", "子", "辰"])
 * // {
 * //   found: true,
 * //   type: "full",
 * //   frame: "申子辰",
 * //   transformElement: "水",
 * //   presentBranches: ["申", "子", "辰"],
 * //   missingBranches: []
 * // }
 *
 * detectThreeHarmony(["子", "辰"])
 * // {
 * //   found: true,
 * //   type: "half",
 * //   frame: "申子辰",
 * //   transformElement: "水",
 * //   strength: "strong", // includes middle (子)
 * //   presentBranches: ["子", "辰"],
 * //   missingBranches: ["申"]
 * // }
 *
 * detectThreeHarmony(["申", "辰"])
 * // {
 * //   found: true,
 * //   type: "half",
 * //   frame: "申子辰",
 * //   transformElement: "水",
 * //   strength: "weak", // start+end only, no middle
 * //   presentBranches: ["申", "辰"],
 * //   missingBranches: ["子"]
 * // }
 *
 * detectThreeHarmony(["子", "丑"])
 * // {
 * //   found: false,
 * //   type: "none",
 * //   presentBranches: [],
 * //   missingBranches: []
 * // }
 */
export function detectThreeHarmony(branches: BranchName[]): ThreeHarmonyResult {
  // Deduplicate input (เช่น [子,子,辰] → [子,辰])
  const uniqueBranches = [...new Set(branches)];

  // ตรวจทุก frame และเก็บผลลัพธ์ที่ match
  const matches: Array<{
    frame: HarmonyFrame;
    transformElement: ElementName;
    type: "full" | "half";
    strength?: HarmonyStrength;
    presentBranches: BranchName[];
    missingBranches: BranchName[];
  }> = [];

  for (const { frame, branches: frameBranches, transformElement, middle } of HARMONY_FRAMES) {
    const present = frameBranches.filter((b) => uniqueBranches.includes(b));
    const missing = frameBranches.filter((b) => !uniqueBranches.includes(b));

    // Full harmony (3 ตัวครบ)
    if (present.length === 3) {
      matches.push({
        frame,
        transformElement,
        type: "full",
        presentBranches: present,
        missingBranches: missing,
      });
    }
    // Half harmony (2 ตัว)
    else if (present.length === 2) {
      const strength: HarmonyStrength = present.includes(middle) ? "strong" : "weak";
      matches.push({
        frame,
        transformElement,
        type: "half",
        strength,
        presentBranches: present,
        missingBranches: missing,
      });
    }
  }

  // ไม่มี harmony เลย
  if (matches.length === 0) {
    return {
      found: false,
      type: "none",
      presentBranches: [],
      missingBranches: [],
    };
  }

  // เลือก match ที่ดีที่สุด (precedence: full > strong-half > weak-half, tie = canonical order)
  matches.sort((a, b) => {
    // 1. Full beats half
    if (a.type === "full" && b.type !== "full") return -1;
    if (b.type === "full" && a.type !== "full") return 1;

    // 2. Both halves: strong beats weak
    if (a.type === "half" && b.type === "half") {
      if (a.strength === "strong" && b.strength === "weak") return -1;
      if (a.strength === "weak" && b.strength === "strong") return 1;
    }

    // 3. Tie: canonical frame order (申子辰, 亥卯未, 寅午戌, 巳酉丑)
    const frameOrder: Record<HarmonyFrame, number> = {
      申子辰: 0,
      亥卯未: 1,
      寅午戌: 2,
      巳酉丑: 3,
    };
    return frameOrder[a.frame] - frameOrder[b.frame];
  });

  const best = matches[0];

  return {
    found: true,
    type: best.type,
    frame: best.frame,
    transformElement: best.transformElement,
    strength: best.strength,
    presentBranches: best.presentBranches,
    missingBranches: best.missingBranches,
  };
}

/**
 * ตรวจสอบอย่างย่อว่ามี三合/半三合 หรือไม่ (boolean wrapper)
 *
 * @param branches - array ของชื่อ地支
 * @returns true ถ้าพบ full หรือ half harmony
 *
 * @example
 * hasThreeHarmony(["申", "子", "辰"]) // true (full)
 * hasThreeHarmony(["子", "辰"])      // true (half)
 * hasThreeHarmony(["子", "丑"])      // false
 */
export function hasThreeHarmony(branches: BranchName[]): boolean {
  return detectThreeHarmony(branches).found;
}
