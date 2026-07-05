/**
 * Tong Shu Hours with Personal Scoring
 * Extends basic hour info with personal resonance scoring
 */

import type { TongShuHour } from "@/types/tongshu";
import type { ScoredHour } from "@/types/tongshu";
import type { ElementName } from "@/lib/bazi/types";
import { getBranchElement } from "./element-maps";

/**
 * Score a single hour based on element alignment with user's useful god
 *
 * @param hour - Tong Shu hour information
 * @param usefulGodElement - User's useful god element (from BaZi analysis)
 * @returns ScoredHour with personal scoring
 */
function scoreHour(hour: TongShuHour, usefulGodElement: ElementName | null): ScoredHour {
  // 1. Extract hour branch element (from the second character of sixtyCycle)
  const sixtyCycle = hour.sixtyCycle; // e.g., "甲子"
  const branch = sixtyCycle[1]; // e.g., "子"
  const element = getBranchElement(branch); // e.g., "水"

  // 2. Check alignment with useful god
  const alignsWithUsefulGod = usefulGodElement !== null && element === usefulGodElement;

  // 3. Calculate personal score (-3 to +3)
  let personalScore = 0;

  if (usefulGodElement !== null) {
    if (element === usefulGodElement) {
      personalScore = 3; // Perfect match
    } else {
      // Check for friendly/neutral relationships
      // Same element or resource/companion is good
      const isSameElement = element === usefulGodElement;
      const isResource = doesElementSupport(element, usefulGodElement); // element generates useful god
      const isControlled = doesElementControl(element, usefulGodElement); // element controls useful god (bad)

      if (isSameElement || isResource) {
        personalScore = 1;
      } else if (isControlled) {
        personalScore = -2;
      } else {
        personalScore = 0; // Neutral
      }
    }
  } else {
    // No useful god info - base score on general auspiciousness
    personalScore = hour.auspicious ? 1 : 0;
  }

  // 4. Determine recommendation level
  const recommendation = getRecommendation(personalScore);

  return {
    ...hour,
    element,
    alignsWithUsefulGod,
    personalScore,
    recommendation,
  };
}

/**
 * Check if element A generates/element B (生) - good relationship */
function doesElementSupport(a: ElementName, b: ElementName): boolean {
  const generationMap: Record<ElementName, ElementName> = {
    木: "火", // Wood generates Fire
    火: "土", // Fire generates Earth
    土: "金", // Earth generates Metal
    金: "水", // Metal generates Water
    水: "木", // Water generates Wood
  };
  return generationMap[a] === b;
}

/**
 * Check if element A controls/element B (克) - bad relationship */
function doesElementControl(a: ElementName, b: ElementName): boolean {
  const controlMap: Record<ElementName, ElementName> = {
    木: "土", // Wood controls Earth
    火: "金", // Fire controls Metal
    土: "水", // Earth controls Water
    金: "木", // Metal controls Wood
    水: "火", // Water controls Fire
  };
  return controlMap[a] === b;
}

/**
 * Map personal score to recommendation level */
function getRecommendation(
  personalScore: number,
): ScoredHour["recommendation"] {
  if (personalScore >= 3) return "best";
  if (personalScore >= 1) return "good";
  if (personalScore >= 0) return "neutral";
  return "avoid";
}

/**
 * Score all hours for a specific day
 *
 * @param hours - Array of Tong Shu hours
 * @param usefulGodElement - User's useful god element (from BaZi analysis)
 * @returns Array of ScoredHour with personal scoring
 */
export function scoreHours(
  hours: TongShuHour[],
  usefulGodElement: ElementName | null,
): ScoredHour[] {
  return hours.map(hour => scoreHour(hour, usefulGodElement));
}

/**
 * Get best hours (recommendation = "best")
 * Useful for highlighting optimal time slots
 */
export function getBestHours(scoredHours: ScoredHour[]): ScoredHour[] {
  return scoredHours.filter(h => h.recommendation === "best");
}

/**
 * Get hours to avoid (recommendation = "avoid")
 * Useful for warning about challenging time slots
 */
export function getHoursToAvoid(scoredHours: ScoredHour[]): ScoredHour[] {
  return scoredHours.filter(h => h.recommendation === "avoid");
}
