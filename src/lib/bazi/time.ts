/**
 * Timezone conversion สำหรับ BaZi
 *
 * tyme4ts `SolarTime.fromYmdHms()` รับค่าเป็น **local time ที่ผู้ใช้ระบุตรงๆ** ไม่มี timezone
 * conversion ภายใน → ต้องแปลงเวลาเกิดเป็น **Beijing time (UTC+8 fixed)** ก่อนส่ง
 * (มาตรฐาน BaZi สมัยใหม่ที่ผู้เชี่ยวชาญส่วนใหญ่ใช้)
 *
 * **True Solar Time (TST) Mode:**
 * เมื่อเปิดใช้ TST (default) และระบุ longitude → คำนวณเวลาแท้ตามตำแหน่งดวงอาทิตย์จริง
 * TST = standard time + (longitude − standard_meridian) × 4 นาที + Equation of Time
 * แล้วส่ง TST เป็น local solar time ให้ tyme4ts ตรงๆ (ไม่ต้อง +8h Beijing)
 *
 * ⚠️ สำคัญมาก (เรียนรู้จาก bug):
 * 1. ห้ามใช้ `new Date("YYYY-MM-DDTHH:mm")` ตรงๆ — มันตีความตาม timezone ของ host
 * 2. ห้ามใช้ `Intl.DateTimeFormat("Asia/Shanghai")` เพื่อ format Beijing time — มันใช้
 *    timezone ประวัติศาสตร์รวม DST ของจีน (1986-1991 = UTC+9 ฤดูร้อน)
 * 3. ห้ามใช้ `fromZonedTime(timezone)` โดยตรง — มันก็ใช้ historical offset รวม DST
 *
 * วิธีที่ถูก: คำนวณ **standard offset (non-DST)** ของ timezone จากฤดูหนาว (ม.ค.) ของปีนั้น
 * → แปลง birth local time → UTC ด้วย standard offset → +8h เป็น Beijing
 * (DST เป็นเรื่องการเมือง ผู้เชี่ยวชาญ BaZi ไม่นำมาคิด)
 */

export interface BaZiTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export interface BaZiTimeOptions {
  longitude?: number;           // ลองจิจูดของสถานที่เกิด (degrees, -180 ถึง 180)
  useTrueSolarTime?: boolean;   // default true (TST แม่นกว่า)
}

/** Beijing standard time = UTC+8 (fixed) */
const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;

/**
 * คำนวณ dayOfYear จากวันที่
 *
 * @param year - ปี ค.ศ.
 * @param month - เดือน (1-12)
 * @param day - วันที่
 * @returns dayOfYear (1-366)
 */
export function getDayOfYear(year: number, month: number, day: number): number {
  const date = new Date(Date.UTC(year, month - 1, day));
  const start = new Date(Date.UTC(year, 0, 1));
  return Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}

/**
 * คำนวณ Equation of Time (EoT) ในหน่วยนาที
 * ใช้สูตร NOAA approx มาตรฐาน
 *
 * @param year - ปี ค.ศ.
 * @param month - เดือน (1-12)
 * @param day - วันที่
 * @returns EoT ในหน่วยนาที (ค่าลบ = sun fast, ค่าบวก = sun slow)
 */
export function equationOfTime(year: number, month: number, day: number): number {
  const dayOfYear = getDayOfYear(year, month, day);
  const B = (2 * Math.PI / 365) * (dayOfYear - 81); // radians
  // EoT ในหน่วยนาที
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}

/**
 * หา standard meridian (degrees) ของ timezone จาก standard offset
 *
 * @param timezone - IANA timezone
 * @param year - ปี ค.ศ. (เผื่อกรณี timezone เปลี่ยน offset)
 * @returns standard meridian ในหน่วย degrees (เช่น UTC+7 → 105°E)
 */
export function getStandardMeridian(timezone: string, year: number): number {
  const offsetMs = getStandardOffsetMs(timezone, year);
  const offsetHours = offsetMs / (60 * 60 * 1000);
  return offsetHours * 15; // 15° per hour
}

/**
 * หา standard offset (non-DST) ของ timezone ในปีที่กำหนด
 * ใช้ offset ในฤดูหนาว (15 ม.ค.) ซึ่งเป็น standard time (no DST in northern hemisphere)
 *
 * @returns offset ในหน่วยมิลลิวินาที (เช่น Bangkok = +25,200,000 = +7 ชม.)
 */
function getStandardOffsetMs(timezone: string, year: number): number {
  // วันกลางฤดูหนาวของปีนั้น (เพื่อหลีก DST)
  const winter = new Date(Date.UTC(year, 0, 15, 12, 0, 0));
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  }).formatToParts(winter);
  const offsetStr =
    parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+00:00";
  // parse "GMT+08:00", "GMT+8", "GMT-05:30" → ms
  const m = offsetStr.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return 0;
  const sign = m[1] === "+" ? 1 : -1;
  const hours = parseInt(m[2], 10);
  const minutes = m[3] ? parseInt(m[3], 10) : 0;
  return sign * (hours * 60 + minutes) * 60 * 1000;
}

/**
 * แปลงวันเวลาเกิด (ใน timezone ของผู้ใช้) เป็น Beijing time (UTC+8 fixed)
 * หรือ True Solar Time (TST) ถ้าเปิดใช้และระบุ longitude
 *
 * @param birthDate - "YYYY-MM-DD"
 * @param birthTime - "HH:mm"
 * @param timezone - IANA timezone ของผู้ใช้ เช่น "Asia/Bangkok"
 * @param options - TST options (optional)
 */
export function toBaZiTime(
  birthDate: string,
  birthTime: string,
  timezone: string,
  options?: BaZiTimeOptions,
): BaZiTime {
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);

  // TST mode: default true ถ้ามี longitude
  const useTST = options?.useTrueSolarTime !== false && options?.longitude !== undefined;

  if (useTST) {
    // True Solar Time mode
    const longitude = options!.longitude!;

    // 1. หา standard meridian ของ timezone
    const standardMeridian = getStandardMeridian(timezone, year);

    // 2. คำนวณ EoT (นาที)
    const eotMinutes = equationOfTime(year, month, day);

    // 3. คำนวณ TST offset (นาที)
    const offsetMinutes = (longitude - standardMeridian) * 4 + eotMinutes;

    // 4. คำนวณ TST (local solar time)
    const birthMinuteOfDay = hour * 60 + minute;
    let tstMinuteOfDay = birthMinuteOfDay + offsetMinutes;

    // 5. Handle day rollover
    let tstYear = year;
    let tstMonth = month;
    let tstDay = day;

    if (tstMinuteOfDay < 0) {
      // Rollover ไปวันก่อนหน้า
      tstMinuteOfDay += 24 * 60;
      const tstDate = new Date(Date.UTC(tstYear, tstMonth - 1, tstDay));
      tstDate.setUTCDate(tstDate.getUTCDate() - 1);
      tstYear = tstDate.getUTCFullYear();
      tstMonth = tstDate.getUTCMonth() + 1;
      tstDay = tstDate.getUTCDate();
    } else if (tstMinuteOfDay >= 24 * 60) {
      // Rollover ไปวันถัดไป
      tstMinuteOfDay -= 24 * 60;
      const tstDate = new Date(Date.UTC(tstYear, tstMonth - 1, tstDay));
      tstDate.setUTCDate(tstDate.getUTCDate() + 1);
      tstYear = tstDate.getUTCFullYear();
      tstMonth = tstDate.getUTCMonth() + 1;
      tstDay = tstDate.getUTCDate();
    }

    const tstHour = Math.floor(tstMinuteOfDay / 60);
    const tstMinute = tstMinuteOfDay % 60;

    // TST คือ local solar time ของสถานที่ → ส่งให้ tyme4ts ตรงๆ (ไม่ต้อง +8h Beijing)
    return {
      year: tstYear,
      month: tstMonth,
      day: tstDay,
      hour: tstHour,
      minute: tstMinute,
    };
  } else {
    // Beijing standard mode (เดิม)
    // 1. standard offset ของ timezone (non-DST) สำหรับปีนั้น
    const offsetMs = getStandardOffsetMs(timezone, year);

    // 2. birth local time → UTC instant (ใช้ standard offset ไม่ DST)
    //    Date.UTC ให้ timestamp ของ birth local time ตีความเป็น UTC ก่อน แล้วลบ offset
    const utcMs = Date.UTC(year, month - 1, day, hour, minute, 0) - offsetMs;

    // 3. UTC → Beijing (UTC+8 fixed)
    const beijing = new Date(utcMs + BEIJING_OFFSET_MS);

    return {
      year: beijing.getUTCFullYear(),
      month: beijing.getUTCMonth() + 1,
      day: beijing.getUTCDate(),
      hour: beijing.getUTCHours(),
      minute: beijing.getUTCMinutes(),
    };
  }
}

/**
 * แปลงเวลาเกิดเป็น Beijing time สำหรับกรณีไม่ทราบเวลา
 * ใช้เวลา default 12:00 น. (เที่ยง) ของ timezone ผู้ใช้ — hour pillar จะเป็น null ใน output
 * แต่ year/month/day ต้องถูกต้องตาม timezone
 *
 * @param birthDate - "YYYY-MM-DD"
 * @param timezone - IANA timezone ของผู้ใช้
 * @param options - TST options (optional)
 */
export function toBaZiTimeUnknown(
  birthDate: string,
  timezone: string,
  options?: BaZiTimeOptions,
): BaZiTime {
  return toBaZiTime(birthDate, "12:00", timezone, options);
}
