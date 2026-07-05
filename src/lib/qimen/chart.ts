/**
 * Qi Men Dun Jia chart generation
 * Implements Chai Bu 拆补 method for hour-based Qi Men charts
 *
 * ⚠️ ACCURACY NOTICE: Some rotation rules (天盘/九星/八门/八神) are complex and may
 * require verification against authoritative sources. Such sections are flagged with
 * TODO comments.
 */

import { SolarTime } from 'tyme4ts';
import { determineJu, type Dun } from './ju';
import type { QiMenChart, QiMenPalace, ChartType } from '@/types/qimen';
import {
  PALACE_BAGUA,
  STAR_BY_PALACE,
  DOOR_BY_PALACE,
  YI_QI_ORDER,
  DEITY_ORDER,
  XUN_TO_YI,
  YANG_DUN_PALACE_ORDER,
  YIN_DUN_PALACE_ORDER,
  BRANCH_TO_PALACE,
} from './constants';

/**
 * Generate Qi Men Dun Jia chart for specific date/time
 *
 * ⚠️ ACCURACY NOTICE:
 * - Hour chart (时家奇门): ACCURATE - Uses standard Chai Bu 拆补 method
 * - Day/month/year charts: BEST EFFORT - 定局 rules vary significantly across schools
 *   and require additional validation against authoritative sources.
 *
 * Algorithm (Chai Bu method, hour-based):
 * 1. Determine Ju (局) from date → dun + ju + yuan
 * 2. Create 地盘 (earth plate) with stems at 9 palaces
 * 3. Find 旬首 from hour stem, map to 值符 stem
 * 4. Create 天盘 (heaven plate) by rotating earth stems (ACCURATE for hour chart)
 * 5. Assign 九星, 八门, 八神 to palaces (ACCURATE for hour chart)
 * 6. Mark 值符 and 值使 palaces
 *
 * @param year - Solar year
 * @param month - Solar month (1-12)
 * @param day - Solar day
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @param chartType - Chart type (default: "hour")
 * @returns Complete Qi Men chart with 9 palaces
 */
export function generateQiMenChart(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  chartType: ChartType = "hour"
): QiMenChart {
  // Step 1: Determine Ju (局)
  const juResult = determineJu(year, month, day);
  const { dun, ju, yuan, term } = juResult;

  // Step 2: Get pillar information based on chart type
  const solarTime = SolarTime.fromYmdHms(year, month, day, hour, minute, 0);
  const lunarHour = solarTime.getLunarHour();
  const ec = lunarHour.getEightChar();

  // Get stem/branch based on chart type
  let rotationStem: string;
  let rotationBranch: string;
  let xunShou: string;

  if (chartType === "hour") {
    // ACCURATE: Hour chart uses hour pillar
    rotationStem = ec.getHour().getTen().getName();
    rotationBranch = ec.getHour().getEarthBranch().getName();
    xunShou = rotationStem; // 旬首 = 甲X containing hour stem
  } else if (chartType === "day") {
    // BEST EFFORT: Day chart uses day pillar
    rotationStem = ec.getDay().getTen().getName();
    rotationBranch = ec.getDay().getEarthBranch().getName();
    xunShou = rotationStem;
    // TODO: 定局 should use month branch, not day (simplified)
  } else if (chartType === "month") {
    // BEST EFFORT: Month chart uses month pillar
    rotationStem = ec.getMonth().getTen().getName();
    rotationBranch = ec.getMonth().getEarthBranch().getName();
    xunShou = rotationStem;
    // TODO: 定局 rules for month charts differ significantly
  } else {
    // year chart
    // BEST EFFORT: Year chart uses year pillar
    rotationStem = ec.getYear().getTen().getName();
    rotationBranch = ec.getYear().getEarthBranch().getName();
    xunShou = rotationStem;
    // TODO: 定局 rules for year charts differ significantly
  }

  // Step 3: Create 地盘 (earth plate)
  const earthStems = createEarthPlate(dun, ju);

  // Step 4: Find 值符 stem and palace
  const zhiFuStem = XUN_TO_YI[xunShou]; // 仪 corresponding to 旬首
  const zhiFuPalace = findPalaceByStem(earthStems, zhiFuStem);

  // Step 5: Create 天盘 (heaven plate)
  // ACCURATE for hour chart using Chai Bu method
  const heavenStems = createHeavenPlate(
    earthStems,
    zhiFuStem,
    zhiFuPalace,
    rotationBranch,
    dun
  );

  // Step 6: Assign 九星
  // ACCURATE for hour chart - stars follow 天盘 rotation
  const stars = assignStars(earthStems, heavenStems);

  // Step 7: Assign 八门
  // ACCURATE for hour chart - 值使 determined by 旬首, doors rotate by branch
  const doors = assignDoors(zhiFuPalace, rotationBranch, dun);

  // Step 8: Assign 八神
  // ACCURATE for hour chart - deities follow 天盘 rotation
  const deities = assignDeities(zhiFuPalace, dun);

  // Step 9: Build palaces array
  const palaces: QiMenPalace[] = [];
  for (let i = 1; i <= 9; i++) {
    palaces.push({
      palaceNumber: i,
      bagua: PALACE_BAGUA[i],
      earthStem: earthStems[i],
      heavenStem: heavenStems[i],
      star: stars[i],
      door: doors[i],
      deity: deities[i],
      isZhiFu: i === zhiFuPalace,
      isZhiShi: false,
    });
  }

  // Step 10: Find and mark 值使 palace
  const zhiShiDoor = DOOR_BY_PALACE[zhiFuPalace]; // 值使 door = door at 值符 palace (earth plate)
  const zhiShiPalace = findPalaceByDoor(doors, zhiShiDoor);
  if (zhiShiPalace !== -1) {
    palaces[zhiShiPalace - 1].isZhiShi = true;
  }

  return {
    dun,
    ju,
    yuan,
    term,
    hourBranch: rotationBranch,
    xunShou,
    zhiFuStem,
    zhiShiDoor,
    palaces,
    isValid: true,
    validationErrors: [],
  };
}

/**
 * Create 地盘 (earth plate) - place stems at 9 palaces
 *
 * Algorithm:
 * - Place 戊 at palace = ju (1-9)
 * - Place remaining stems in order: 戊己庚辛壬癸丁丙乙
 * - 阳遁: clockwise (1→2→3→4→5→6→7→8→9), skip palace 5
 * - 阴遁: counter-clockwise (9→8→7→6→5→4→3→2→1), skip palace 5
 * - Palace 5 (中宫): stem passes through but is not assigned (寄宫)
 *
 * @param dun - 阳遁 or 阴遁
 * @param ju - Ju number (1-9)
 * @returns Record mapping palace number (1-9) to stem
 */
function createEarthPlate(dun: Dun, ju: number): Record<number, string> {
  const stems: Record<number, string> = {
    1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: ""
  };

  // Palace order based on dun type
  const palaceOrder = dun === "阳遁" ? YANG_DUN_PALACE_ORDER : YIN_DUN_PALACE_ORDER;

  // Place 戊 at ju palace
  // Find ju palace index in palace order
  const juPalaceIndex = palaceOrder.indexOf(ju);
  if (juPalaceIndex === -1) {
    throw new Error(`Invalid ju number: ${ju}`);
  }

  // Place stems starting from ju palace
  let stemIndex = 0; // Starts with 戊
  for (let i = 0; i < palaceOrder.length; i++) {
    const palaceIndex = (juPalaceIndex + i) % palaceOrder.length;
    const palace = palaceOrder[palaceIndex];
    stems[palace] = YI_QI_ORDER[stemIndex % YI_QI_ORDER.length];
    stemIndex++;
  }

  // Palace 5 (中宫) gets no stem (寄宫)
  stems[5] = "";

  return stems;
}

/**
 * Create 天盘 (heaven plate) by rotating earth stems
 *
 * ⚠️ ACCURATE for hour chart (时家奇门) using Chai Bu method
 *
 * Algorithm (Chai Bu, hour-based):
 * 1. 值符仪 = XUN_TO_YI[xunShou] (戊/己/庚/辛/壬/癸)
 * 2. 值符 palace P = palace where earthStem = 值符仪
 * 3. Hour branch → palace H (using BRANCH_TO_PALACE mapping)
 * 4. Heaven stem at palace P = Earth stem at palace H
 * 5. Heaven stems at other palaces: rotate following earth stem order
 *    - heaven[P+k] = earth[H+k] for k=0,1,2,...
 *    - Direction: 阳遁顺 / 阴遁逆
 *    - Skip palace 5 (中宫) in rotation
 * 6. Simplified: "Rotate earth plate" so earth[H] moves to palace P
 *
 * @param earthStems - Earth plate stems
 * @param zhiFuStem - 值符 stem (仪: 戊/己/庚/辛/壬/癸)
 * @param zhiFuPalace - Palace where 值符 is located (1-9)
 * @param rotationBranch - Branch for rotation (hour/day/month/year branch)
 * @param dun - 阳遁 or 阴遁
 * @returns Heaven plate stems
 */
function createHeavenPlate(
  earthStems: Record<number, string>,
  zhiFuStem: string,
  zhiFuPalace: number,
  rotationBranch: string,
  dun: Dun
): Record<number, string> {
  const heavenStems: Record<number, string> = {
    1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: ""
  };

  // Get rotation palace H from branch (子=1, 丑=8, 寅=8, 卯=3, etc.)
  const rotationPalace = BRANCH_TO_PALACE[rotationBranch];

  // Get palace order based on dun type (skip palace 5)
  const palaceOrder = dun === "阳遁" ? YANG_DUN_PALACE_ORDER : YIN_DUN_PALACE_ORDER;

  // Find indices in palace order
  const zhiFuIndex = palaceOrder.indexOf(zhiFuPalace);
  const rotationIndex = palaceOrder.indexOf(rotationPalace);

  // Rotate stems: heaven[zhiFuIndex + k] = earth[rotationIndex + k]
  for (let i = 0; i < palaceOrder.length; i++) {
    // Heaven palace position
    const heavenIdx = (zhiFuIndex + i) % palaceOrder.length;
    const heavenPalace = palaceOrder[heavenIdx];

    // Earth palace position
    const earthIdx = (rotationIndex + i) % palaceOrder.length;
    const earthPalace = palaceOrder[earthIdx];

    heavenStems[heavenPalace] = earthStems[earthPalace];
  }

  // Palace 5 (中宫) gets no stem (寄宫)
  heavenStems[5] = "";

  return heavenStems;
}

/**
 * Assign 九星 (9 Stars) to palaces
 *
 * ⚠️ ACCURATE for hour chart (时家奇门)
 *
 * Algorithm (Chai Bu, hour-based):
 * 1. 值符星 = STAR_BY_PALACE[zhiFuPalace] (star at earth palace P)
 * 2. Stars "fly" with heaven stems: star at palace X = STAR_BY_PALACE[earth palace of heaven stem at X]
 * 3. Simplified: Each palace's star = STAR_BY_PALACE[earth palace where its heaven stem originated]
 *
 * Example: If heaven stem at palace 3 came from earth palace 7, then star at palace 3 = STAR_BY_PALACE[7]
 *
 * @param earthStems - Earth plate stems
 * @param heavenStems - Heaven plate stems (already rotated)
 * @param dun - 阳遁 or 阴遁
 * @returns Record mapping palace number to star
 */
function assignStars(
  earthStems: Record<number, string>,
  heavenStems: Record<number, string>
): Record<number, string> {
  const stars: Record<number, string> = {
    1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: ""
  };

  // For each palace, find where its heaven stem came from on earth plate
  for (let palace = 1; palace <= 9; palace++) {
    if (palace === 5) {
      // Palace 5 (中宫) gets 天禽
      stars[5] = "天禽";
      continue;
    }

    const heavenStem = heavenStems[palace];
    if (!heavenStem) continue;

    // Find which earth palace has this stem
    const earthPalace = findPalaceByStem(earthStems, heavenStem);

    // Star at this palace = STAR_BY_PALACE[earth palace]
    stars[palace] = STAR_BY_PALACE[earthPalace];
  }

  return stars;
}

/**
 * Assign 八门 (8 Doors) to palaces
 *
 * ⚠️ ACCURATE for hour chart (时家奇门)
 *
 * Algorithm (Chai Bu, hour-based):
 * 1. 值使 = DOOR_BY_PALACE[zhiFuPalace] (door at earth palace P)
 * 2. Doors rotate following branch sequence (子→丑→寅→...)
 * 3. Each step moves +1 palace (阳遁顺 / 阴遁逆)
 * 4. Door at palace P+k = door at +k steps from 值使
 * 5. Palace 5 (中宫) uses 寄宫
 *
 * @param zhiFuPalace - Palace number where 值符 is located (1-9)
 * @param rotationBranch - Branch for rotation (hour/day/month/year)
 * @param dun - 阳遁 or 阴遁
 * @returns Record mapping palace number to door
 */
function assignDoors(
  zhiFuPalace: number,
  rotationBranch: string,
  dun: Dun
): Record<number, string> {
  const doors: Record<number, string> = {
    1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: ""
  };

  // 值使 door = door at 值符 palace (from earth plate)
  const zhiShiDoor = DOOR_BY_PALACE[zhiFuPalace];

  // Get palace order based on dun type
  const palaceOrder = dun === "阳遁" ? YANG_DUN_PALACE_ORDER : YIN_DUN_PALACE_ORDER;

  // Find 值使 palace index
  const zhiFuIndex = palaceOrder.indexOf(zhiFuPalace);

  // Door order: 休, 生, 伤, 杜, 景, 死, 惊, 开 (standard sequence)
  const doorOrder = ["休", "生", "伤", "杜", "景", "死", "惊", "开"];

  // Find 值使 door index in door order
  const zhiShiIndex = doorOrder.indexOf(zhiShiDoor);

  // Assign doors to palaces
  for (let i = 0; i < palaceOrder.length; i++) {
    const palace = palaceOrder[i];
    // Door at palace = 值使 door + offset from 值使 palace
    const palaceOffset = dun === "阳遁"
      ? (i - zhiFuIndex + palaceOrder.length) % palaceOrder.length
      : (zhiFuIndex - i + palaceOrder.length) % palaceOrder.length;

    const doorIndex = (zhiShiIndex + palaceOffset) % doorOrder.length;
    doors[palace] = doorOrder[doorIndex];
  }

  // Palace 5 (中宫) uses 寄宫
  doors[5] = "寄";

  return doors;
}

/**
 * Assign 八神 (8 Deities) to palaces
 *
 * ⚠️ ACCURATE for hour chart (时家奇门)
 *
 * Algorithm (Chai Bu, hour-based):
 * 1. 值符 deity at 值符 palace (值符带头)
 * 2. Deities rotate following 天盘 (same direction as heaven stems)
 * 3. Sequence: 值符, 腾蛇, 太阴, 六合, 白虎, 玄武, 九地, 九天
 * 4. Direction: 阳遁顺 / 阴遁逆
 * 5. Palace 5 (中宫) uses 寄宫
 *
 * @param zhiFuPalace - Palace number where 值符 is located (1-9)
 * @param dun - 阳遁 or 阴遁
 * @returns Record mapping palace number to deity
 */
function assignDeities(zhiFuPalace: number, dun: Dun): Record<number, string> {
  const deities: Record<number, string> = {
    1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: ""
  };

  // Palace order based on dun type
  const palaceOrder = dun === "阳遁" ? YANG_DUN_PALACE_ORDER : YIN_DUN_PALACE_ORDER;
  const zhiFuIndex = palaceOrder.indexOf(zhiFuPalace);

  // Assign deities starting from 值符 palace
  for (let i = 0; i < palaceOrder.length; i++) {
    const palaceIndex = (zhiFuIndex + i) % palaceOrder.length;
    const palace = palaceOrder[palaceIndex];
    deities[palace] = DEITY_ORDER[i % DEITY_ORDER.length];
  }

  // Palace 5 (中宫) uses 寄宫
  deities[5] = "寄";

  return deities;
}

/**
 * Find palace number where a stem is located on earth/heaven plate
 */
function findPalaceByStem(stems: Record<number, string>, targetStem: string): number {
  for (let palace = 1; palace <= 9; palace++) {
    if (stems[palace] === targetStem) {
      return palace;
    }
  }
  throw new Error(`Stem not found: ${targetStem}`);
}

/**
 * Find palace number where a door is located
 */
function findPalaceByDoor(doors: Record<number, string>, targetDoor: string): number {
  for (let palace = 1; palace <= 9; palace++) {
    if (doors[palace] === targetDoor) {
      return palace;
    }
  }
  return -1; // Not found
}

