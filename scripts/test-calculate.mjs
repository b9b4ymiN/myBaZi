// Verification ของผมเอง (ไม่เชื่อรายงาน executor) — ครอบ timezone + hidden + Li Chun + unknown
import { calculateBaZi } from '../src/lib/bazi/calculate.ts';
import { toBaZiTime } from '../src/lib/bazi/time.ts';

let pass = 0, fail = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(`${ok ? '✅' : '❌'} ${label}: ${JSON.stringify(actual)}${ok ? '' : ` (คาด ${JSON.stringify(expected)})`}`);
  if (ok) { pass++; } else { fail++; }
}

const profile1986Bangkok = {
  id: 't1', name: 'T', gender: 'male',
  birthDate: '1986-05-29', birthTime: '12:00', birthTimeKnown: 'known',
  timezone: 'Asia/Bangkok', createdAt: '', updatedAt: '',
};
const profile1986Shanghai = { ...profile1986Bangkok, timezone: 'Asia/Shanghai' };

console.log('═══ TEST A: timezone conversion (Bangkok UTC+7 vs Shanghai UTC+8) ═══');
// Bangkok 12:00 = Beijing 13:00 (ต่าง 1 ชม.)
const btBkk = toBaZiTime('1986-05-29', '12:00', 'Asia/Bangkok');
check('A.1 Bangkok 12:00 → Beijing hour', btBkk.hour, 13);
check('A.2 Bangkok 12:00 → Beijing day (เดิม)', btBkk.day, 29);
// Shanghai 12:00 = Beijing 12:00 (เดียวกัน UTC+8)
const btSh = toBaZiTime('1986-05-29', '12:00', 'Asia/Shanghai');
check('A.3 Shanghai 12:00 → Beijing hour', btSh.hour, 12);

console.log('\n═══ TEST B: 4 pillars เคส 1986 Shanghai (ตรงกับ validation) ═══');
const cSh = calculateBaZi(profile1986Shanghai);
check('B.1 Year (Shanghai)', cSh.year.sixtyCycleName, '丙寅');
check('B.2 Month (Shanghai)', cSh.month.sixtyCycleName, '癸巳');
check('B.3 Day (Shanghai)', cSh.day.sixtyCycleName, '癸酉');
check('B.4 Hour Shanghai 12:00 = 午时 → 戊午', cSh.hour.sixtyCycleName, '戊午');
check('B.5 Day Master', cSh.dayMaster.name + cSh.dayMaster.element, '癸水');

console.log('\n═══ TEST C: Bangkok → hour pillar ต้องต่างจาก Shanghai ═══');
const cBkk = calculateBaZi(profile1986Bangkok);
check('C.1 Year/Month/Day เหมือนกัน (Bkk)', `${cBkk.year.sixtyCycleName}/${cBkk.month.sixtyCycleName}/${cBkk.day.sixtyCycleName}`, '丙寅/癸巳/癸酉');
check('C.2 Bangkok hour pillar (未时 13-15) ≠ Shanghai (午时)', cBkk.hour.stem.name + cBkk.hour.branch.name, '己未');

console.log('\n═══ TEST D: unknown birth time → hour = null ═══');
const unknown = calculateBaZi({ ...profile1986Bangkok, birthTimeKnown: 'unknown', birthTime: null });
check('D.1 hour = null', unknown.hour, null);
check('D.2 birthTimeKnown = false', unknown.birthTimeKnown, false);
check('D.3 year/month/day ยังถูก', `${unknown.year.sixtyCycleName}/${unknown.month.sixtyCycleName}/${unknown.day.sixtyCycleName}`, '丙寅/癸巳/癸酉');

console.log('\n═══ TEST E: Hidden stems (day branch 酉 = 辛 main qi) ═══');
const dayBranch = cBkk.day.branch;
check('E.1 day branch', dayBranch.name, '酉');
check('E.2 hidden stems count (酉 มี 1)', dayBranch.hiddenStems.length, 1);
check('E.3 hidden stem ชื่อ', dayBranch.hiddenStems[0].stem.name, '辛');
check('E.4 hidden stem type = main', dayBranch.hiddenStems[0].type, 'main');

console.log('\n═══ TEST F: Li Chun boundary ผ่าน timezone Bangkok ═══');
// Bangkok 15:00 = Beijing 16:00 (ก่อน Li Chun 16:27) → 癸卯
const beforeLC = calculateBaZi({ ...profile1986Bangkok, birthDate: '2024-02-04', birthTime: '15:00' });
check('F.1 Bangkok 15:00 (ก่อน Li Chun) → year 癸卯', beforeLC.year.sixtyCycleName, '癸卯');
// Bangkok 17:00 = Beijing 18:00 (หลัง Li Chun) → 甲辰
const afterLC = calculateBaZi({ ...profile1986Bangkok, birthDate: '2024-02-04', birthTime: '17:00' });
check('F.2 Bangkok 17:00 (หลัง Li Chun) → year 甲辰', afterLC.year.sixtyCycleName, '甲辰');

console.log('\n═══ TEST G: Element maps + serializable ═══');
check('G.1 dayMaster.element 木火土金水', ['木','火','土','金','水'].includes(cBkk.dayMaster.element), true);
try { JSON.stringify(cBkk); check('G.2 serializable (JSON.stringify)', 'ok', 'ok'); } catch(e) { check('G.2 serializable', 'fail: '+e.message, 'ok'); }

console.log(`\n══════════════════════════════════════════`);
console.log(`สรุป: ${pass} ผ่าน, ${fail} ตก จาก ${pass+fail}`);
process.exit(fail > 0 ? 1 : 0);
