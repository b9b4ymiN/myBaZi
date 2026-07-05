// Locations (77 จังหวัดไทย) verification tests
import {
  BIRTH_LOCATIONS,
  findLocation,
  findLocationByName,
  getDefaultLocation,
  REGION_ORDER,
  REGION_THAI,
} from '../src/lib/bazi/locations.ts';
import { calculateBaZi } from '../src/lib/bazi/calculate.ts';

let pass = 0, fail = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(`${ok ? '✅' : '❌'} ${label}: ${JSON.stringify(actual)}${ok ? '' : ` (คาด ${JSON.stringify(expected)})`}`);
  if (ok) { pass++; } else { fail++; }
}
function checkTrue(label, cond, detail = '') {
  const ok = !!cond;
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? `: ${detail}` : ''}`);
  if (ok) { pass++; } else { fail++; }
}

console.log('═══ TEST A: Data integrity ═══');

// A.1 ครบ 77 จังหวัด
check('A.1 entries count = 77', BIRTH_LOCATIONS.length, 77);

// A.2 ไม่มี duplicate key
const keys = BIRTH_LOCATIONS.map((l) => l.key);
const dupKeys = keys.filter((k, i) => keys.indexOf(k) !== i);
checkTrue('A.2 no duplicate keys', dupKeys.length === 0, dupKeys.length ? `dupes: ${dupKeys.join(',')}` : '');

// A.3 ไม่มี duplicate code
const codes = BIRTH_LOCATIONS.map((l) => l.code);
const dupCodes = codes.filter((c, i) => codes.indexOf(c) !== i);
checkTrue('A.3 no duplicate codes', dupCodes.length === 0);

// A.4 ไม่มี duplicate nameTh
const namesTh = BIRTH_LOCATIONS.map((l) => l.nameTh);
const dupNames = namesTh.filter((n, i) => namesTh.indexOf(n) !== i);
checkTrue('A.4 no duplicate nameTh', dupNames.length === 0);

// A.5 longitude range: ทุกจังหวัดไทยอยู่ใน 97–106°E
const longitudes = BIRTH_LOCATIONS.map((l) => l.longitude);
const minLng = Math.min(...longitudes);
const maxLng = Math.max(...longitudes);
checkTrue('A.5 longitude range within 97–106°E', minLng >= 97 && maxLng <= 106, `min=${minLng} max=${maxLng}`);

// A.6 timezone ทุกจังหวัด = Asia/Bangkok
const allBangkokTz = BIRTH_LOCATIONS.every((l) => l.timezone === 'Asia/Bangkok');
checkTrue('A.6 all timezone = Asia/Bangkok', allBangkokTz);

// A.7 ทุก entry มี field ครบ + type ถูก
const allValid = BIRTH_LOCATIONS.every(
  (l) => typeof l.key === 'string' && l.key.length > 0
    && typeof l.nameTh === 'string' && l.nameTh.length > 0
    && typeof l.nameEn === 'string' && l.nameEn.length > 0
    && typeof l.code === 'number'
    && typeof l.longitude === 'number',
);
checkTrue('A.7 all entries have valid fields', allValid);

// A.8 region ครบทุกภาคที่ประกาศใน REGION_THAI
const regionsUsed = new Set(BIRTH_LOCATIONS.map((l) => l.region));
const allRegionsValid = [...regionsUsed].every((r) => r in REGION_THAI);
checkTrue('A.8 all regions mapped in REGION_THAI', allRegionsValid);

console.log('\n═══ TEST B: Helpers ═══');

// B.1 findLocation by key
const bkk = findLocation('bangkok');
check('B.1 findLocation("bangkok").nameTh', bkk?.nameTh, 'กรุงเทพมหานคร');
check('B.2 findLocation("bangkok").code', bkk?.code, 10);
check('B.3 findLocation("chiang-mai").longitude', findLocation('chiang-mai')?.longitude, 98.9833);

// B.4 findLocation unknown key → undefined
check('B.4 findLocation("nonexistent") = undefined', findLocation('nonexistent'), undefined);

// B.5 findLocationByName — Thai exact
check('B.5 findLocationByName("เชียงใหม่").key', findLocationByName('เชียงใหม่')?.key, 'chiang-mai');

// B.6 findLocationByName — English exact
check('B.6 findLocationByName("Phuket").key', findLocationByName('Phuket')?.key, 'phuket');

// B.7 findLocationByName — case-insensitive
check('B.7 findLocationByName("KHON KAEN").key', findLocationByName('KHON KAEN')?.key, 'khon-kaen');

// B.8 findLocationByName — empty/whitespace → undefined
check('B.8 findLocationByName("") = undefined', findLocationByName(''), undefined);
check('B.9 findLocationByName("   ") = undefined', findLocationByName('   '), undefined);

// B.10 findLocationByName — no match → undefined
check('B.10 findLocationByName("Tokyo") = undefined', findLocationByName('Tokyo'), undefined);

// B.11 getDefaultLocation = Bangkok
check('B.11 getDefaultLocation().key', getDefaultLocation().key, 'bangkok');

// B.12 REGION_ORDER ครบ 6 ภาค
check('B.12 REGION_ORDER length = 6', REGION_ORDER.length, 6);

console.log('\n═══ TEST C: Engine integration (location → longitude → BaZi hour pillar) ═══');
// เคสสำคัญ: derive profile จาก Bangkok location → calculateBaZi → hour pillar ต้องเป็น 甲午
// (เทียบเคียงกับ test-tst.mjs TEST C ที่ใช้ birthLongitude=100.5 → 甲午)
// 1993-10-12 12:55 กทม. + TST → 乙未? ไม่ — เอกสารไทยบอก 甲午 (午时 11-13)
// location.bangkok.longitude = 100.5167 (ใกล้ 100.5) → ต้องได้ hour pillar เดียวกับ TST test

const bangkok = findLocation('bangkok');
if (!bangkok) throw new Error('Bangkok location not found');
const profileFromLocation = {
  id: 't1', name: 'T', gender: 'male',
  birthDate: '1993-10-12', birthTime: '12:55', birthTimeKnown: 'known',
  timezone: bangkok.timezone,
  birthLongitude: bangkok.longitude, // derive จาก location (100.5167)
  useTrueSolarTime: true,
  birthLocationKey: bangkok.key,
  createdAt: '', updatedAt: '',
};

const result = calculateBaZi(profileFromLocation);
check('C.1 Bangkok-derived Year pillar', result.year.sixtyCycleName, '癸酉');
check('C.2 Bangkok-derived Day pillar (丙寅)', result.day.sixtyCycleName, '丙寅');
check('C.3 Bangkok-derived Hour pillar (甲午, 午时) - MUST MATCH DOC', result.hour.sixtyCycleName, '甲午');
check('C.4 Hour branch (午)', result.hour.branch.name, '午');

console.log('\n═══ TEST D: Coverage — ทุกภาคมีอย่างน้อย 1 จังหวัด ═══');
for (const region of REGION_ORDER) {
  const count = BIRTH_LOCATIONS.filter((l) => l.region === region).length;
  checkTrue(`D.${region} has ≥1 province`, count >= 1, `count=${count}`);
}

// D.summary นับจังหวัดต่อภาค
console.log('\n═══ Summary: จำนวนจังหวัดต่อภาค ═══');
for (const region of REGION_ORDER) {
  const count = BIRTH_LOCATIONS.filter((l) => l.region === region).length;
  console.log(`  ${REGION_THAI[region]}: ${count} จังหวัด`);
}

console.log(`\n═══ RESULT: ${pass} passed, ${fail} failed ═══`);
process.exit(fail > 0 ? 1 : 0);
