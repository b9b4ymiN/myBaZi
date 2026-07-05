/**
 * BaZi calculator - คำนวณ 4 pillars จาก profile
 * ใช้ tyme4ts แปลงเป็น pure data objects ปลอดภัย
 */

import type { Profile } from "@/types/profile";
import type { BaZiChart, Pillar, StemInfo, BranchInfo, HiddenStemInfo } from "./types";
import { SolarTime, YinYang, type HeavenStem, type EarthBranch, type EightChar, type HideHeavenStem } from 'tyme4ts';
import { toBaZiTime, toBaZiTimeUnknown } from './time';

/**
 * คำนวณ BaZi chart จาก profile
 *
 * @param profile - ข้อมูลผู้ใช้ (name, gender, birthDate, birthTime, timezone)
 * @returns BaZiChart - 4 pillars + day master + hidden stems
 */
export function calculateBaZi(profile: Profile): BaZiChart {
  // 1. แปลง timezone → Beijing time หรือ TST
  let baZiTime: { year: number; month: number; day: number; hour: number; minute: number };

  // TST options: default true ถ้ามี longitude
  const options = {
    longitude: profile.birthLongitude,
    useTrueSolarTime: profile.useTrueSolarTime ?? true, // default TST
  };

  if (profile.birthTimeKnown === 'unknown' || profile.birthTime === null) {
    // ไม่ทราบเวลา → ใช้ 12:00 น. (hour pillar จะเป็น null ใน output)
    baZiTime = toBaZiTimeUnknown(profile.birthDate, profile.timezone, options);
  } else {
    // ทราบเวลา → แปลง timezone อย่างแม่นยำ
    baZiTime = toBaZiTime(profile.birthDate, profile.birthTime, profile.timezone, options);
  }

  // 2. สร้าง SolarTime และคำนวณ EightChar
  const solarTime = SolarTime.fromYmdHms(
    baZiTime.year,
    baZiTime.month,
    baZiTime.day,
    baZiTime.hour,
    baZiTime.minute,
    0 // second = 0
  );

  const lunarHour = solarTime.getLunarHour();
  const ec: EightChar = lunarHour.getEightChar();

  // 3. แปลงเป็น Pillars
  const year = toPillar('year', ec.getYear());
  const month = toPillar('month', ec.getMonth());
  const day = toPillar('day', ec.getDay());
  const hour = profile.birthTimeKnown === 'known' && profile.birthTime !== null
    ? toPillar('hour', ec.getHour())
    : null;

  // 4. สร้าง BaZiChart
  return {
    birthTimeKnown: profile.birthTimeKnown === 'known',
    year,
    month,
    day,
    hour,
    dayMaster: day.stem, // Day Master = คือ day stem
  };
}

/**
 * แปลง tyme4ts SixtyCycle เป็น Pillar
 *
 * @param position - "year" | "month" | "day" | "hour"
 * @param sixtyCycle - ผลลัพธ์จาก ec.getYear()/getMonth()/getDay()/getHour()
 * @returns Pillar - pure data object
 */
function toPillar(
  position: "year" | "month" | "day" | "hour",
  sixtyCycle: { getHeavenStem(): HeavenStem; getEarthBranch(): EarthBranch; getName(): string } // tyme4ts ไม่ export type SixtyCycle ชัดเจน
): Pillar {
  const heavenStem = sixtyCycle.getHeavenStem();
  const earthBranch = sixtyCycle.getEarthBranch();

  return {
    position,
    sixtyCycleName: sixtyCycle.getName(),
    stem: toStemInfo(heavenStem),
    branch: toBranchInfo(earthBranch),
  };
}

/**
 * แปลง tyme4ts HeavenStem เป็น StemInfo
 *
 * @param stem - HeavenStem จาก tyme4ts
 * @returns StemInfo - pure data object
 */
function toStemInfo(stem: HeavenStem): StemInfo {
  // หา index จากชื่อ stem (甲=0, 乙=1, ..., 壬=8, 癸=9)
  const stemName = stem.getName();
  const stemIndex = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(stemName);

  // YinYang เป็น enum (YIN=0, YANG=1) ไม่มี getName() method
  const yinYangEnum = stem.getYinYang();
  const yinYangName = yinYangEnum === YinYang.YANG ? '阳' : '阴';

  return {
    name: stemName,
    element: stem.getElement().getName() as "木" | "火" | "土" | "金" | "水",
    yinYang: yinYangName as "阳" | "阴",
    index: stemIndex >= 0 ? stemIndex : 0,
  };
}

/**
 * แปลง tyme4ts EarthBranch เป็น BranchInfo (รวม hidden stems)
 *
 * @param branch - EarthBranch จาก tyme4ts
 * @returns BranchInfo - pure data object พร้อม hidden stems
 */
function toBranchInfo(branch: EarthBranch): BranchInfo {
  // ดึง hidden stems
  const hideHeavenStems: HideHeavenStem[] = branch.getHideHeavenStems();
  const hiddenStems: HiddenStemInfo[] = hideHeavenStems.map(hs => {
    const heavenStem = hs.getHeavenStem();
    const stemName = heavenStem.getName();
    const stemIndex = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(stemName);

    // YinYang enum → Chinese name
    const yinYangEnum = heavenStem.getYinYang();
    const yinYangName = yinYangEnum === YinYang.YANG ? '阳' : '阴';

    return {
      stem: {
        name: stemName,
        element: heavenStem.getElement().getName() as "木" | "火" | "土" | "金" | "水",
        yinYang: yinYangName as "阳" | "阴",
        index: stemIndex >= 0 ? stemIndex : 0,
      },
      type: hs.getType() === 2 ? 'main' : hs.getType() === 1 ? 'middle' : 'residual',
    };
  });

  return {
    name: branch.getName(),
    element: branch.getElement().getName() as "木" | "火" | "土" | "金" | "水",
    zodiac: branch.getZodiac().getName(),
    direction: branch.getDirection().getName(),
    hiddenStems,
  };
}

/**
 * ดึง raw EightChar object จาก profile (สำหรับ advanced analysis)
 * ใช้กรณีต้องการเข้าถึง tyme4ts methods โดยตรง
 *
 * @param profile - ข้อมูลผู้ใช้
 * @returns EightChar - raw object จาก tyme4ts
 */
export function getRawEightChar(profile: Profile): EightChar {
  let baZiTime: { year: number; month: number; day: number; hour: number; minute: number };

  // TST options: default true ถ้ามี longitude
  const options = {
    longitude: profile.birthLongitude,
    useTrueSolarTime: profile.useTrueSolarTime ?? true,
  };

  if (profile.birthTimeKnown === 'unknown' || profile.birthTime === null) {
    baZiTime = toBaZiTimeUnknown(profile.birthDate, profile.timezone, options);
  } else {
    baZiTime = toBaZiTime(profile.birthDate, profile.birthTime, profile.timezone, options);
  }

  const solarTime = SolarTime.fromYmdHms(
    baZiTime.year,
    baZiTime.month,
    baZiTime.day,
    baZiTime.hour,
    baZiTime.minute,
    0
  );

  const lunarHour = solarTime.getLunarHour();
  return lunarHour.getEightChar();
}
