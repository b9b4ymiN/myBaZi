// Test day-bazi.ts: day ↔ natal BaZi linking helpers.
// Run: pnpm daybazi:test
import { calculateBaZi } from '../src/lib/bazi/calculate.ts';
import {
  extractNatalBranches,
  checkDayVsNatal,
  getPersonalizedRecommends,
} from '../src/lib/tongshu/day-bazi.ts';

// Validated 1993-10-12 male Bangkok → 4 pillars 癸酉/壬戌/丙寅/甲午
const profile = {
  id: 'test-1993',
  name: 'เทสต์ 1993',
  gender: 'male',
  birthDate: '1993-10-12',
  birthTime: '12:55',
  birthTimeKnown: 'known',
  timezone: 'Asia/Bangkok',
  birthLongitude: 100.5,
  useTrueSolarTime: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

let pass = true;
const check = (name, cond) => {
  console.log(`  ${cond ? '✓' : '✗'} ${name}`);
  if (!cond) pass = false;
};

const chart = calculateBaZi(profile);
const natal = extractNatalBranches(chart);

console.log('day-bazi — 1993 natal branches (expect 酉/戌/寅/午):');
check('4 natal branches', natal.length === 4);
check('year branch = 酉', natal[0].branch === '酉');
check('month branch = 戌', natal[1].branch === '戌');
check('day branch = 寅', natal[2].branch === '寅');
check('hour branch = 午', natal[3].branch === '午');

console.log('\ncheckDayVsNatal — 卯 day (卯冲酉 year + 卯合戌 month → 冲 first):');
const r1 = checkDayVsNatal('卯', natal);
check('2 interactions found (冲 + 合)', r1.length === 2);
check('first (highest priority) = 冲', r1[0]?.type === '冲');
check('first position = year (สาปี, 酉)', r1[0]?.position === 'year');
check('meaning mentions ผู้ใหญ่/ครอบครัว', /ผู้ใหญ่|ครอบครัว/.test(r1[0]?.meaningThai ?? ''));
check('second = 合 (month, 戌)', r1[1]?.type === '合' && r1[1]?.position === 'month');

console.log('\ncheckDayVsNatal — 子 day (子冲午 → 冲 สาเวลา):');
const r2 = checkDayVsNatal('子', natal);
check('1 interaction found', r2.length === 1);
check('type = 冲', r2[0]?.type === '冲');
check('position = hour (สาเวลา)', r2[0]?.position === 'hour');

console.log('\ncheckDayVsNatal — 辰 day (辰冲戌 month + 辰合酉 year → 冲 first by priority):');
const r3 = checkDayVsNatal('辰', natal);
check('2 interactions found', r3.length === 2);
check('first (highest priority) = 冲', r3[0]?.type === '冲');
check('first position = month (戌)', r3[0]?.position === 'month');
check('second = 合', r3[1]?.type === '合');
check('second position = year (酉)', r3[1]?.position === 'year');

console.log('\ncheckDayVsNatal — clean case (寅 day vs natal [子]):');
const r4 = checkDayVsNatal('寅', [{ position: 'year', branch: '子' }]);
check('no interaction (empty)', r4.length === 0);

console.log('\ngetPersonalizedRecommends — wealth goal highlights ค้าขาย:');
const mockDay = {
  recommends: [
    { name: '交易', nameTh: 'ค้าขาย' },
    { name: '剃头', nameTh: 'ตัดผม' },
    { name: '立券', nameTh: 'ทำสัญญา' },
  ],
};
const recs = getPersonalizedRecommends(mockDay, 'wealth');
check('3 recommends returned', recs.length === 3);
check('"ค้าขาย" highlighted', recs[0].highlighted === true);
check('"ตัดผม" NOT highlighted', recs[1].highlighted === false);

console.log('\ngetPersonalizedRecommends — null relationship (none highlighted):');
const recs2 = getPersonalizedRecommends(mockDay, null);
check('none highlighted when no relationship', recs2.every((r) => !r.highlighted));

console.log(pass ? '\nPASS' : '\nFAIL');
process.exit(pass ? 0 : 1);
