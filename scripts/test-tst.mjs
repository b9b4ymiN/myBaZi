// True Solar Time (TST) verification tests
import { calculateBaZi } from '../src/lib/bazi/calculate.ts';
import { equationOfTime, getStandardMeridian } from '../src/lib/bazi/time.ts';

let pass = 0, fail = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(`${ok ? '✅' : '❌'} ${label}: ${JSON.stringify(actual)}${ok ? '' : ` (คาด ${JSON.stringify(expected)})`}`);
  if (ok) { pass++; } else { fail++; }
}

console.log('═══ TEST A: EoT formula bounds (verify NOAA approx) ═══');
// EoT ในหน่วยนาที: ม.ค. ≈ -3 ถึง -10, ก.พ. ≈ -13 ถึง -16, ต.ค. ≈ +13 ถึง +14
const eotJan = equationOfTime(2024, 1, 15);
check('A.1 Jan EoT (should be negative, approx -3 to -10)', eotJan < -2 && eotJan > -12, true);
const eotFeb = equationOfTime(2024, 2, 15);
check('A.2 Feb EoT (should be most negative, approx -13 to -16)', eotFeb < -12 && eotFeb > -17, true);
const eotOct = equationOfTime(2024, 10, 12);
check('A.3 Oct EoT (should be positive, approx +13 to +14)', eotOct > 12 && eotOct < 15, true);
const eotOct12 = equationOfTime(1993, 10, 12);
check('A.4 1993-10-12 EoT (should be ~+14 min, matches almanac)', Math.abs(eotOct12 - 14) < 1, true);

console.log('\n═══ TEST B: Standard meridian calculation ═══');
const meridianBkk = getStandardMeridian('Asia/Bangkok', 1993);
check('B.1 Bangkok standard meridian (UTC+7 → 105°E)', meridianBkk, 105);
const meridianShanghai = getStandardMeridian('Asia/Shanghai', 1993);
check('B.2 Shanghai standard meridian (UTC+8 → 120°E)', meridianShanghai, 120);

console.log('\n═══ TEST C: TST calculation - Bangkok 12:55 1993-10-12 ═══');
// เคสสำคัญ: ชาย 12 ต.ค. 1993 12:55 กทม. → เอกสารไทยบอก 甲午 (午时 11-13)
// TST = 12:55 + (100.5 - 105) × 4 + EoT ≈ 12:55 - 18 + 14 = 12:51 → 午时 ✓
const profile1993BangkokTST = {
  id: 't1', name: 'T', gender: 'male',
  birthDate: '1993-10-12', birthTime: '12:55', birthTimeKnown: 'known',
  timezone: 'Asia/Bangkok',
  birthLongitude: 100.5, // กทม.
  useTrueSolarTime: true,
  createdAt: '', updatedAt: '',
};

const c1993TST = calculateBaZi(profile1993BangkokTST);
check('C.1 Year pillar', c1993TST.year.sixtyCycleName, '癸酉');
check('C.2 Month pillar', c1993TST.month.sixtyCycleName, '壬戌');
check('C.3 Day pillar', c1993TST.day.sixtyCycleName, '丙寅');
check('C.4 Hour pillar with TST (午时 → 甲午) - MUST MATCH DOC', c1993TST.hour.sixtyCycleName, '甲午');
check('C.5 Hour branch (午)', c1993TST.hour.branch.name, '午');
check('C.6 Hour stem (甲)', c1993TST.hour.stem.name, '甲');

console.log('\n═══ TEST D: Beijing mode (backward compat) - 1993-10-12 ═══');
// Beijing mode: 12:55 Bangkok → 13:55 Beijing → 未时 → 乙未
const profile1993BeijingMode = {
  ...profile1993BangkokTST,
  useTrueSolarTime: false,
  birthLongitude: undefined,
};

const c1993Beijing = calculateBaZi(profile1993BeijingMode);
check('D.1 Hour pillar Beijing mode (未时 → 乙未)', c1993Beijing.hour.sixtyCycleName, '乙未');
check('D.2 Hour branch (未)', c1993Beijing.hour.branch.name, '未');
check('D.3 Hour stem (乙)', c1993Beijing.hour.stem.name, '乙');

console.log('\n═══ TEST E: TST without longitude (offset=0, fallback to standard) ═══');
// ถ้าไม่ระบุ longitude → TST offset = 0 → ใช้ standard time เท่ากับ Beijing mode
const profile1993NoLong = {
  ...profile1993BangkokTST,
  birthLongitude: undefined,
  useTrueSolarTime: true,
};

const c1993NoLong = calculateBaZi(profile1993NoLong);
check('E.1 Hour pillar (no longitude → Beijing mode)', c1993NoLong.hour.sixtyCycleName, '乙未');

console.log('\n═══ TEST F: Shanghai 1986-05-29 with TST ═══');
// Shanghai 12:00 1986-05-29, longitude 121.4, TST → ยังคง year/month/day เดิม
const profile1986ShanghaiTST = {
  id: 't2', name: 'T', gender: 'male',
  birthDate: '1986-05-29', birthTime: '12:00', birthTimeKnown: 'known',
  timezone: 'Asia/Shanghai',
  birthLongitude: 121.4, // Shanghai
  useTrueSolarTime: true,
  createdAt: '', updatedAt: '',
};

const c1986TST = calculateBaZi(profile1986ShanghaiTST);
check('F.1 Year pillar (unchanged)', c1986TST.year.sixtyCycleName, '丙寅');
check('F.2 Month pillar (unchanged)', c1986TST.month.sixtyCycleName, '癸巳');
check('F.3 Day pillar (unchanged)', c1986TST.day.sixtyCycleName, '癸酉');
// Shanghai 12:00, longitude 121.4, May 29 EoT ≈ +3 min
// TST offset = (121.4 - 120) × 4 + 3 = 5.6 + 3 ≈ 9 min → 12:09 → ยัง午时

console.log('\n═══ TEST G: Profile backward compatibility ═══');
// Profile เดิมที่ไม่มี birthLongitude และ useTrueSolarTime → ต้องไม่ crash
const profileOld = {
  id: 't3', name: 'Old', gender: 'male',
  birthDate: '1990-01-01', birthTime: '10:00', birthTimeKnown: 'known',
  timezone: 'Asia/Bangkok',
  createdAt: '', updatedAt: '',
  // ไม่มี birthLongitude และ useTrueSolarTime → default TST แต่ offset=0
};

try {
  const cOld = calculateBaZi(profileOld);
  check('G.1 Old profile works (no crash)', true, true);
  check('G.2 Old profile hour pillar calculated', cOld.hour.sixtyCycleName !== '', true);
} catch (e) {
  check('G.1 Old profile works (no crash)', 'error: ' + e.message, true);
}

console.log('\n═══ TEST H: Day rollover TST (negative offset) ═══');
// เคสที่ TST offset เป็นลบมาก → rollover ไปวันก่อนหน้า
// ใช้ เวลาเกิด 00:30 และ offset -60 min → -30 min → 23:30 วันก่อนหน้า
const testProfile = {
  id: 't4', name: 'Rollover', gender: 'male',
  birthDate: '1993-10-12', birthTime: '00:30', birthTimeKnown: 'known',
  timezone: 'Asia/Bangkok',
  birthLongitude: 90.0, // far west Bangkok → large negative offset
  useTrueSolarTime: true,
  createdAt: '', updatedAt: '',
};

try {
  const cRollover = calculateBaZi(testProfile);
  check('H.1 Rollover profile works (no crash)', true, true);
  check('H.2 Rollover hour pillar calculated', cRollover.hour.sixtyCycleName !== '', true);
} catch (e) {
  check('H.1 Rollover profile works (no crash)', 'error: ' + e.message, true);
}

console.log('\n═══ TEST I: Lamang (ลำปาง) TST test ═══');
// ลำปาง longitude ≈ 99.9°E
const profileLampang = {
  id: 't5', name: 'Lampang', gender: 'male',
  birthDate: '1993-10-12', birthTime: '12:55', birthTimeKnown: 'known',
  timezone: 'Asia/Bangkok',
  birthLongitude: 99.9,
  useTrueSolarTime: true,
  createdAt: '', updatedAt: '',
};

const cLampang = calculateBaZi(profileLampang);
check('I.1 Lampang hour pillar (should also be 甲午)', cLampang.hour.sixtyCycleName, '甲午');

console.log('\n═══ TEST J: Cha-am (ชะอำ) TST test ═══');
// ชะอำ longitude ≈ 100.0°E
const profileChaam = {
  id: 't6', name: 'Cha-am', gender: 'male',
  birthDate: '1993-10-12', birthTime: '12:55', birthTimeKnown: 'known',
  timezone: 'Asia/Bangkok',
  birthLongitude: 100.0,
  useTrueSolarTime: true,
  createdAt: '', updatedAt: '',
};

const cChaam = calculateBaZi(profileChaam);
check('J.1 Cha-am hour pillar (should also be 甲午)', cChaam.hour.sixtyCycleName, '甲午');

console.log(`\n══════════════════════════════════════════`);
console.log(`สรุป TST Tests: ${pass} ผ่าน, ${fail} ตก จาก ${pass+fail}`);
console.log(`\n🎯 CRITICAL TEST: เคส 1993-10-12 12:55 กทม. + TST → hour 甲午 (ตรงเอกสารไทย)`);
console.log(`   Result: ${c1993TST.hour.sixtyCycleName === '甲午' ? '✅ PASSED' : '❌ FAILED'}`);
process.exit(fail > 0 ? 1 : 0);
