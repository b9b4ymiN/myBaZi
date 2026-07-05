/**
 * ฐานข้อมูลสถานที่เกิด — 77 จังหวัดไทย
 *
 * ใช้สำหรับ Profile form: ผู้ใช้เลือกจังหวัด → derive longitude + timezone อัตโนมัติ
 * (แทนการกรอก longitude manual ที่คนทั่วไปไม่รู้จัก)
 *
 * **Source longitude**: coordinates ของเมืองหลวงของแต่ละจังหวัด (อำเภอเมือง/ศาลากลาง)
 * จาก simplemaps Thailand cities dataset (cross-check กับ Wikipedia infobox)
 * ยกเว้น Nonthaburi ที่ simplemaps ไม่มี → ใช้ค่าเมืองนนทบุรีจาก Wikipedia
 *
 * **Timezone**: ทุกจังหวัดไทยใช้ `Asia/Bangkok` (UTC+7) — ไทยมี timezone เดียว
 *
 * **ผลกระทบต่อ engine**: longitude ส่งให้ `toBaZiTime()` สำหรับคำนวณ True Solar Time (TST)
 * offset = (longitude − 105°) × 4 นาที + EoT. ค่าคลาดเคลื่อน < 0.5° = < 2 นาที ไม่กระทบ hour pillar
 *
 * เรียงตาม DOPA province code (10–96) ตามลำดับใน Wikipedia "Provinces of Thailand"
 * เพื่อง่ายต่อการนับและ verify ครบ 77
 */

export type ThaiRegion =
  | "central" // ภาคกลาง
  | "east" // ภาคตะวันออก
  | "west" // ภาคตะวันตก
  | "north" // ภาคเหนือ
  | "northeast" // ภาคตะวันออกเฉียงเหนือ (อีสาน)
  | "south"; // ภาคใต้

export interface BirthLocation {
  /** slug ภาษาอังกฤษ ใช้เป็น key ใน Profile.birthLocationKey */
  key: string;
  /** ชื่อจังหวัดภาษาไทย */
  nameTh: string;
  /** ชื่อจังหวัดภาษาอังกฤษ */
  nameEn: string;
  /** ภาค (6 ภาคมาตรฐาน) */
  region: ThaiRegion;
  /** รหัสจังหวัด DOPA (2 หลัก) — เก็บไว้สำหรับอ้างอิง */
  code: number;
  /** ลองจิจูดของเมืองหลวงจังหวัด (degrees East, ~97–105°E) */
  longitude: number;
  /** IANA timezone (ทุกจังหวัด = Asia/Bangkok) */
  timezone: string;
}

const BANGKOK_TZ = "Asia/Bangkok";

/**
 * 77 จังหวัดไทย + กรุงเทพมหานคร (special administrative area)
 * เรียงตาม DOPA code
 */
export const BIRTH_LOCATIONS: readonly BirthLocation[] = [
  // === ภาคกลาง (Central) — code 10-19, 26, 72-75 ===
  { key: "bangkok", nameTh: "กรุงเทพมหานคร", nameEn: "Bangkok", region: "central", code: 10, longitude: 100.5167, timezone: BANGKOK_TZ },
  { key: "samut-prakan", nameTh: "สมุทรปราการ", nameEn: "Samut Prakan", region: "central", code: 11, longitude: 100.5964, timezone: BANGKOK_TZ },
  { key: "nonthaburi", nameTh: "นนทบุรี", nameEn: "Nonthaburi", region: "central", code: 12, longitude: 100.50, timezone: BANGKOK_TZ },
  { key: "pathum-thani", nameTh: "ปทุมธานี", nameEn: "Pathum Thani", region: "central", code: 13, longitude: 100.5512, timezone: BANGKOK_TZ },
  { key: "phra-nakhon-si-ayutthaya", nameTh: "พระนครศรีอยุธยา", nameEn: "Phra Nakhon Si Ayutthaya", region: "central", code: 14, longitude: 100.5761, timezone: BANGKOK_TZ },
  { key: "ang-thong", nameTh: "อ่างทอง", nameEn: "Ang Thong", region: "central", code: 15, longitude: 100.4574, timezone: BANGKOK_TZ },
  { key: "lopburi", nameTh: "ลพบุรี", nameEn: "Lopburi", region: "central", code: 16, longitude: 100.6269, timezone: BANGKOK_TZ },
  { key: "sing-buri", nameTh: "สิงห์บุรี", nameEn: "Sing Buri", region: "central", code: 17, longitude: 100.4031, timezone: BANGKOK_TZ },
  { key: "chai-nat", nameTh: "ชัยนาท", nameEn: "Chai Nat", region: "central", code: 18, longitude: 100.1283, timezone: BANGKOK_TZ },
  { key: "saraburi", nameTh: "สระบุรี", nameEn: "Saraburi", region: "central", code: 19, longitude: 100.9114, timezone: BANGKOK_TZ },
  { key: "nakhon-nayok", nameTh: "นครนายก", nameEn: "Nakhon Nayok", region: "central", code: 26, longitude: 101.2150, timezone: BANGKOK_TZ },
  { key: "suphan-buri", nameTh: "สุพรรณบุรี", nameEn: "Suphan Buri", region: "central", code: 72, longitude: 100.1169, timezone: BANGKOK_TZ },
  { key: "nakhon-pathom", nameTh: "นครปฐม", nameEn: "Nakhon Pathom", region: "central", code: 73, longitude: 100.0581, timezone: BANGKOK_TZ },
  { key: "samut-sakhon", nameTh: "สมุทรสาคร", nameEn: "Samut Sakhon", region: "central", code: 74, longitude: 100.2775, timezone: BANGKOK_TZ },
  { key: "samut-songkhram", nameTh: "สมุทรสงคราม", nameEn: "Samut Songkhram", region: "central", code: 75, longitude: 100.0017, timezone: BANGKOK_TZ },

  // === ภาคตะวันออก (East) — code 20-25, 27 ===
  { key: "chonburi", nameTh: "ชลบุรี", nameEn: "Chonburi", region: "east", code: 20, longitude: 100.9850, timezone: BANGKOK_TZ },
  { key: "rayong", nameTh: "ระยอง", nameEn: "Rayong", region: "east", code: 21, longitude: 101.2789, timezone: BANGKOK_TZ },
  { key: "chanthaburi", nameTh: "จันทบุรี", nameEn: "Chanthaburi", region: "east", code: 22, longitude: 102.1039, timezone: BANGKOK_TZ },
  { key: "trat", nameTh: "ตราด", nameEn: "Trat", region: "east", code: 23, longitude: 102.5149, timezone: BANGKOK_TZ },
  { key: "chachoengsao", nameTh: "ฉะเชิงเทรา", nameEn: "Chachoengsao", region: "east", code: 24, longitude: 101.0703, timezone: BANGKOK_TZ },
  { key: "prachinburi", nameTh: "ปราจีนบุรี", nameEn: "Prachinburi", region: "east", code: 25, longitude: 101.3739, timezone: BANGKOK_TZ },
  { key: "sa-kaeo", nameTh: "สระแก้ว", nameEn: "Sa Kaeo", region: "east", code: 27, longitude: 102.0589, timezone: BANGKOK_TZ },

  // === ภาคตะวันออกเฉียงเหนือ (Northeast / อีสาน) — code 30-49 ===
  { key: "nakhon-ratchasima", nameTh: "นครราชสีมา", nameEn: "Nakhon Ratchasima", region: "northeast", code: 30, longitude: 102.0831, timezone: BANGKOK_TZ },
  { key: "buriram", nameTh: "บุรีรัมย์", nameEn: "Buriram", region: "northeast", code: 31, longitude: 103.1022, timezone: BANGKOK_TZ },
  { key: "surin", nameTh: "สุรินทร์", nameEn: "Surin", region: "northeast", code: 32, longitude: 103.4932, timezone: BANGKOK_TZ },
  { key: "sisaket", nameTh: "ศรีสะเกษ", nameEn: "Sisaket", region: "northeast", code: 33, longitude: 104.3291, timezone: BANGKOK_TZ },
  { key: "ubon-ratchathani", nameTh: "อุบลราชธานี", nameEn: "Ubon Ratchathani", region: "northeast", code: 34, longitude: 104.8594, timezone: BANGKOK_TZ },
  { key: "yasothon", nameTh: "ยโสธร", nameEn: "Yasothon", region: "northeast", code: 35, longitude: 104.1431, timezone: BANGKOK_TZ },
  { key: "chaiyaphum", nameTh: "ชัยภูมิ", nameEn: "Chaiyaphum", region: "northeast", code: 36, longitude: 102.0311, timezone: BANGKOK_TZ },
  { key: "amnat-charoen", nameTh: "อำนาจเจริญ", nameEn: "Amnat Charoen", region: "northeast", code: 37, longitude: 104.6223, timezone: BANGKOK_TZ },
  { key: "bueng-kan", nameTh: "บึงกาฬ", nameEn: "Bueng Kan", region: "northeast", code: 38, longitude: 103.6552, timezone: BANGKOK_TZ },
  { key: "nong-bua-lamphu", nameTh: "หนองบัวลำภู", nameEn: "Nong Bua Lamphu", region: "northeast", code: 39, longitude: 102.4444, timezone: BANGKOK_TZ },
  { key: "khon-kaen", nameTh: "ขอนแก่น", nameEn: "Khon Kaen", region: "northeast", code: 40, longitude: 102.8333, timezone: BANGKOK_TZ },
  { key: "udon-thani", nameTh: "อุดรธานี", nameEn: "Udon Thani", region: "northeast", code: 41, longitude: 102.7902, timezone: BANGKOK_TZ },
  { key: "loei", nameTh: "เลย", nameEn: "Loei", region: "northeast", code: 42, longitude: 101.7307, timezone: BANGKOK_TZ },
  { key: "nong-khai", nameTh: "หนองคาย", nameEn: "Nong Khai", region: "northeast", code: 43, longitude: 102.7467, timezone: BANGKOK_TZ },
  { key: "maha-sarakham", nameTh: "มหาสารคาม", nameEn: "Maha Sarakham", region: "northeast", code: 44, longitude: 103.3008, timezone: BANGKOK_TZ },
  { key: "roi-et", nameTh: "ร้อยเอ็ด", nameEn: "Roi Et", region: "northeast", code: 45, longitude: 103.6513, timezone: BANGKOK_TZ },
  { key: "kalasin", nameTh: "กาฬสินธุ์", nameEn: "Kalasin", region: "northeast", code: 46, longitude: 103.5000, timezone: BANGKOK_TZ },
  { key: "sakon-nakhon", nameTh: "สกลนคร", nameEn: "Sakon Nakhon", region: "northeast", code: 47, longitude: 104.1456, timezone: BANGKOK_TZ },
  { key: "nakhon-phanom", nameTh: "นครพนม", nameEn: "Nakhon Phanom", region: "northeast", code: 48, longitude: 104.7808, timezone: BANGKOK_TZ },
  { key: "mukdahan", nameTh: "มุกดาหาร", nameEn: "Mukdahan", region: "northeast", code: 49, longitude: 104.7228, timezone: BANGKOK_TZ },

  // === ภาคเหนือ (North) — code 50-58, 60-62, 64-67 ===
  { key: "chiang-mai", nameTh: "เชียงใหม่", nameEn: "Chiang Mai", region: "north", code: 50, longitude: 98.9833, timezone: BANGKOK_TZ },
  { key: "lamphun", nameTh: "ลำพูน", nameEn: "Lamphun", region: "north", code: 51, longitude: 99.0072, timezone: BANGKOK_TZ },
  { key: "lampang", nameTh: "ลำปาง", nameEn: "Lampang", region: "north", code: 52, longitude: 99.5000, timezone: BANGKOK_TZ },
  { key: "uttaradit", nameTh: "อุตรดิตถ์", nameEn: "Uttaradit", region: "north", code: 53, longitude: 100.0942, timezone: BANGKOK_TZ },
  { key: "phrae", nameTh: "แพร่", nameEn: "Phrae", region: "north", code: 54, longitude: 100.1417, timezone: BANGKOK_TZ },
  { key: "nan", nameTh: "น่าน", nameEn: "Nan", region: "north", code: 55, longitude: 100.7766, timezone: BANGKOK_TZ },
  { key: "phayao", nameTh: "พะเยา", nameEn: "Phayao", region: "north", code: 56, longitude: 99.9036, timezone: BANGKOK_TZ },
  { key: "chiang-rai", nameTh: "เชียงราย", nameEn: "Chiang Rai", region: "north", code: 57, longitude: 99.8275, timezone: BANGKOK_TZ },
  { key: "mae-hong-son", nameTh: "แม่ฮ่องสอน", nameEn: "Mae Hong Son", region: "north", code: 58, longitude: 97.9700, timezone: BANGKOK_TZ },
  { key: "nakhon-sawan", nameTh: "นครสวรรค์", nameEn: "Nakhon Sawan", region: "north", code: 60, longitude: 100.1353, timezone: BANGKOK_TZ },
  { key: "uthai-thani", nameTh: "อุทัยธานี", nameEn: "Uthai Thani", region: "north", code: 61, longitude: 100.0250, timezone: BANGKOK_TZ },
  { key: "kamphaeng-phet", nameTh: "กำแพงเพชร", nameEn: "Kamphaeng Phet", region: "north", code: 62, longitude: 99.5222, timezone: BANGKOK_TZ },
  { key: "sukhothai", nameTh: "สุโขทัย", nameEn: "Sukhothai", region: "north", code: 64, longitude: 99.8219, timezone: BANGKOK_TZ },
  { key: "phitsanulok", nameTh: "พิษณุโลก", nameEn: "Phitsanulok", region: "north", code: 65, longitude: 100.2636, timezone: BANGKOK_TZ },
  { key: "phichit", nameTh: "พิจิตร", nameEn: "Phichit", region: "north", code: 66, longitude: 100.3467, timezone: BANGKOK_TZ },
  { key: "phetchabun", nameTh: "เพชรบูรณ์", nameEn: "Phetchabun", region: "north", code: 67, longitude: 101.1533, timezone: BANGKOK_TZ },

  // === ภาคตะวันตก (West) — code 63, 70-71, 76-77 ===
  { key: "tak", nameTh: "ตาก", nameEn: "Tak", region: "west", code: 63, longitude: 99.1250, timezone: BANGKOK_TZ },
  { key: "ratchaburi", nameTh: "ราชบุรี", nameEn: "Ratchaburi", region: "west", code: 70, longitude: 99.8169, timezone: BANGKOK_TZ },
  { key: "kanchanaburi", nameTh: "กาญจนบุรี", nameEn: "Kanchanaburi", region: "west", code: 71, longitude: 99.5311, timezone: BANGKOK_TZ },
  { key: "phetchaburi", nameTh: "เพชรบุรี", nameEn: "Phetchaburi", region: "west", code: 76, longitude: 99.9458, timezone: BANGKOK_TZ },
  { key: "prachuap-khiri-khan", nameTh: "ประจวบคีรีขันธ์", nameEn: "Prachuap Khiri Khan", region: "west", code: 77, longitude: 99.7980, timezone: BANGKOK_TZ },

  // === ภาคใต้ (South) — code 80-86, 90-96 ===
  { key: "nakhon-si-thammarat", nameTh: "นครศรีธรรมราช", nameEn: "Nakhon Si Thammarat", region: "south", code: 80, longitude: 99.9630, timezone: BANGKOK_TZ },
  { key: "krabi", nameTh: "กระบี่", nameEn: "Krabi", region: "south", code: 81, longitude: 98.9189, timezone: BANGKOK_TZ },
  { key: "phang-nga", nameTh: "พังงา", nameEn: "Phang Nga", region: "south", code: 82, longitude: 98.5317, timezone: BANGKOK_TZ },
  { key: "phuket", nameTh: "ภูเก็ต", nameEn: "Phuket", region: "south", code: 83, longitude: 98.3975, timezone: BANGKOK_TZ },
  { key: "surat-thani", nameTh: "สุราษฎร์ธานี", nameEn: "Surat Thani", region: "south", code: 84, longitude: 99.3306, timezone: BANGKOK_TZ },
  { key: "ranong", nameTh: "ระนอง", nameEn: "Ranong", region: "south", code: 85, longitude: 98.6389, timezone: BANGKOK_TZ },
  { key: "chumphon", nameTh: "ชุมพร", nameEn: "Chumphon", region: "south", code: 86, longitude: 99.1800, timezone: BANGKOK_TZ },
  { key: "songkhla", nameTh: "สงขลา", nameEn: "Songkhla", region: "south", code: 90, longitude: 100.5967, timezone: BANGKOK_TZ },
  { key: "satun", nameTh: "สตูล", nameEn: "Satun", region: "south", code: 91, longitude: 100.0681, timezone: BANGKOK_TZ },
  { key: "trang", nameTh: "ตรัง", nameEn: "Trang", region: "south", code: 92, longitude: 99.6114, timezone: BANGKOK_TZ },
  { key: "phatthalung", nameTh: "พัทลุง", nameEn: "Phatthalung", region: "south", code: 93, longitude: 100.0778, timezone: BANGKOK_TZ },
  { key: "pattani", nameTh: "ปัตตานี", nameEn: "Pattani", region: "south", code: 94, longitude: 101.2508, timezone: BANGKOK_TZ },
  { key: "yala", nameTh: "ยะลา", nameEn: "Yala", region: "south", code: 95, longitude: 101.2811, timezone: BANGKOK_TZ },
  { key: "narathiwat", nameTh: "นราธิวาส", nameEn: "Narathiwat", region: "south", code: 96, longitude: 101.8231, timezone: BANGKOK_TZ },
];

/** Lookup map สำหรับหา location ด้วย key (O(1)) */
const LOCATION_BY_KEY: ReadonlyMap<string, BirthLocation> = new Map(
  BIRTH_LOCATIONS.map((loc) => [loc.key, loc]),
);

/** หา location ด้วย key */
export function findLocation(key: string): BirthLocation | undefined {
  return LOCATION_BY_KEY.get(key);
}

/**
 * หา location ด้วยชื่อ (nameTh หรือ nameEn) — exact match, case-insensitive
 * ใช้สำหรับจับค่าจาก datalist input ที่ผู้ใช้พิมพ์/เลือก
 */
export function findLocationByName(name: string): BirthLocation | undefined {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) return undefined;
  return BIRTH_LOCATIONS.find(
    (loc) =>
      loc.nameTh === name.trim() ||
      loc.nameEn.toLowerCase() === trimmed,
  );
}

/** Default location = Bangkok (ค่าเริ่มต้นสำหรับผู้ใช้ไทยส่วนใหญ่) */
export function getDefaultLocation(): BirthLocation {
  return BIRTH_LOCATIONS[0]; // Bangkok
}

/** ภาคทั้งหมด ตามลำดับที่ใช้แสดงใน UI */
export const REGION_ORDER: readonly ThaiRegion[] = [
  "central",
  "east",
  "west",
  "north",
  "northeast",
  "south",
];

/** ชื่อภาคภาษาไทย */
export const REGION_THAI: Readonly<Record<ThaiRegion, string>> = {
  central: "ภาคกลาง",
  east: "ภาคตะวันออก",
  west: "ภาคตะวันตก",
  north: "ภาคเหนือ",
  northeast: "ภาคตะวันออกเฉียงเหนือ",
  south: "ภาคใต้",
};
