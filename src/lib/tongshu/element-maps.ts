/**
 * Element mappings for Heavenly Stems and Earthly Branches
 * Used to extract elements from pillars for Personal Resonance analysis
 */

import type { ElementName } from "@/lib/bazi/types";

/**
 * Map each Heavenly Stem (天干) to its element
 * 木→火→土→金→水 (Wood→Fire→Earth→Metal→Water)
 */
export const STEM_ELEMENTS: Record<string, ElementName> = {
  "甲": "木", // Jia - Yang Wood
  "乙": "木", // Yi - Yin Wood
  "丙": "火", // Bing - Yang Fire
  "丁": "火", // Ding - Yin Fire
  "戊": "土", // Wu - Yang Earth
  "己": "土", // Ji - Yin Earth
  "庚": "金", // Geng - Yang Metal
  "辛": "金", // Xin - Yin Metal
  "壬": "水", // Ren - Yang Water
  "癸": "水", // Gui - Yin Water
};

/**
 * Map each Earthly Branch (地支) to its primary element
 */
export const BRANCH_ELEMENTS: Record<string, ElementName> = {
  "子": "水", // Zi - Rat (Water)
  "丑": "土", // Chou - Ox (Earth)
  "寅": "木", // Yin - Tiger (Wood)
  "卯": "木", // Mao - Rabbit (Wood)
  "辰": "土", // Chen - Dragon (Earth)
  "巳": "火", // Si - Snake (Fire)
  "午": "火", // Wu - Horse (Fire)
  "未": "土", // Wei - Goat (Earth)
  "申": "金", // Shen - Monkey (Metal)
  "酉": "金", // You - Rooster (Metal)
  "戌": "土", // Xu - Dog (Earth)
  "亥": "水", // Hai - Pig (Water)
};

/**
 * Get element from a Heavenly Stem
 * @param stem - Single Chinese character stem (甲, 乙, 丙, etc.)
 * @returns Element name (木, 火, 土, 金, 水)
 */
export function getStemElement(stem: string): ElementName {
  const element = STEM_ELEMENTS[stem];
  if (!element) {
    throw new Error(`Unknown stem: ${stem}`);
  }
  return element;
}

/**
 * Get element from an Earthly Branch
 * @param branch - Single Chinese character branch (子, 丑, 寅, etc.)
 * @returns Element name (木, 火, 土, 金, 水)
 */
export function getBranchElement(branch: string): ElementName {
  const element = BRANCH_ELEMENTS[branch];
  if (!element) {
    throw new Error(`Unknown branch: ${branch}`);
  }
  return element;
}

/**
 * Extract stem and branch elements from a sixty cycle (干支)
 * @param sixtyCycle - Two-character string like "丙辰"
 * @returns Object with stem element and branch element
 */
export function getPillarElements(sixtyCycle: string): {
  stemElement: ElementName;
  branchElement: ElementName;
} {
  if (sixtyCycle.length !== 2) {
    throw new Error(`Invalid sixtyCycle: ${sixtyCycle} (must be 2 characters)`);
  }

  const stem = sixtyCycle[0];
  const branch = sixtyCycle[1];

  return {
    stemElement: getStemElement(stem),
    branchElement: getBranchElement(branch),
  };
}
