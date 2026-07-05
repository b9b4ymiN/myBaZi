import { SolarTime } from 'tyme4ts';
console.log('วันที่       | engine/tyme4ts | lunar-javascript | สอดคล้อง?');
console.log('-'.repeat(70));
for (let d = 10; d <= 14; d++) {
  const ec = SolarTime.fromYmdHms(1993, 10, d, 12, 0, 0).getLunarHour().getEightChar();
  const eng = ec.getDay().getName();
  const { Solar } = await import('/tmp/lunar-test/node_modules/lunar-javascript/index.js');
  const lib = Solar.fromYmd(1993, 10, d).getLunar().getEightChar().getDay();
  console.log(`1993-10-${d} | ${eng.padEnd(14)} | ${lib.padEnd(16)} | ${eng === lib ? '✅' : '❌'}`);
}
console.log('');
console.log('ถ้าเอกสาร 10-12 = 丙子 จริง → sequence ต้องเป็น: 乙亥, 丙子, 丁丑');
console.log('engine 2 libs sequence: 乙丑, 丙寅, 丁卯');
console.log('→ ต่างกัน 10 ตำแหน่งในรอบ 60');
