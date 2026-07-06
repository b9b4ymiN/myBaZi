/**
 * Character Asset Helper - mapping Heavenly Stem (天干) → chibi avatar asset path
 * สำหรับแสดง avatar ของแต่ละ stem (10 ตัว, ออกแบบตามธาตุ + yin/yang)
 * ต่างจาก elementAssetPath ที่ map ที่ระดับธาตุ (5 ตัว) — ที่นี่เฉพาะแต่ละ stem
 * ไฟล์สร้างโดย `pnpm assets:optimize` (PNG ดิบ → webp 256/512/1024)
 */

/** 10 Heavenly Stems (天干) */
export const CHARACTER_STEMS = [
  "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸",
] as const;

/** ขนาดที่ optimize ไว้ (webp srcset) */
export type CharacterSize = 256 | 512 | 1024;

/**
 * หา character avatar path จากชื่อ stem
 * @param stem - ชื่อ天干 (甲–癸) — ปกติจาก StemInfo.name / dayMaster.name
 * @param size - ขนาด webp (default 512)
 * @returns path ของ avatar (fallback 甲 ถ้า stem ไม่รู้จัก)
 */
export function characterAssetPath(stem: string, size: CharacterSize = 512): string {
  if (!(CHARACTER_STEMS as readonly string[]).includes(stem)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`characterAssetPath: unknown stem "${stem}", fallback to 甲`);
    }
    return `/assets/character/甲-${size}.webp`;
  }
  return `/assets/character/${stem}-${size}.webp`;
}
