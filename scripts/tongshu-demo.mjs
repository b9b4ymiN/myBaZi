import { getTongShuDayInfo, getTongShuHours } from '../src/lib/tongshu/day-info.js';

console.log('🌟 Tong Shu Engine Demo - 2024-06-21 (Summer Solstice)\n');

const dayInfo = getTongShuDayInfo(2024, 6, 21);

console.log('📅 Date Information:');
console.log(`  Solar: ${dayInfo.solarDate.year}-${dayInfo.solarDate.month}-${dayInfo.solarDate.day} (Weekday: ${dayInfo.solarDate.weekday})`);
console.log(`  Lunar: ${dayInfo.lunarDate.yearName} ${dayInfo.lunarDate.monthName}${dayInfo.lunarDate.dayName}`);

console.log('\n🔮 Pillars:');
console.log(`  Year:  ${dayInfo.yearPillar}`);
console.log(`  Month: ${dayInfo.monthPillar}`);
console.log(`  Day:   ${dayInfo.sixtyCycle}`);

console.log('\n⭐ Stars & Officers:');
console.log(`  Day Officer:    ${dayInfo.dayOfficer.name} (${dayInfo.dayOfficer.nameTh}) - ${dayInfo.dayOfficer.meaning}`);
console.log(`  Auspicious:     ${dayInfo.dayOfficer.auspicious ? '✅' : '❌'}`);
console.log(`  Yellow/Black:   ${dayInfo.yellowBlackStar.name} (${dayInfo.yellowBlackStar.nameTh})`);
console.log(`  Auspicious:     ${dayInfo.yellowBlackStar.auspicious ? '✅' : '❌'}`);
console.log(`  28 Constellation: ${dayInfo.constellation28.name} (${dayInfo.constellation28.nameTh})`);
console.log(`  Auspicious:     ${dayInfo.constellation28.auspicious ? '✅' : '❌'}`);
console.log(`  Nine Star:      ${dayInfo.nineStar.name} (${dayInfo.nineStar.nameTh})`);

console.log('\n🎭 Gods & Spirits (องค์เทพ/วิญญาณ):');
const auspiciousGods = dayInfo.gods.filter(g => g.auspicious);
const inauspiciousGods = dayInfo.gods.filter(g => !g.auspicious);
console.log(`  Auspicious (${auspiciousGods.length}): ${auspiciousGods.map(g => g.nameTh).join(', ')}`);
console.log(`  Inauspicious (${inauspiciousGods.length}): ${inauspiciousGods.map(g => g.nameTh).join(', ')}`);

console.log('\n✅ Suitable Activities (宜):');
dayInfo.recommends.slice(0, 5).forEach(r => {
  console.log(`  • ${r.nameTh} (${r.name})`);
});
if (dayInfo.recommends.length > 5) {
  console.log(`  ... และอีก ${dayInfo.recommends.length - 5} รายการ`);
}

console.log('\n❌ Activities to Avoid (忌):');
dayInfo.avoids.slice(0, 5).forEach(a => {
  console.log(`  • ${a.nameTh} (${a.name})`);
});
if (dayInfo.avoids.length > 5) {
  console.log(`  ... และอีก ${dayInfo.avoids.length - 5} รายการ`);
}

console.log('\n🌤️ Solar Term:');
console.log(`  ${dayInfo.solarTerm || 'ไม่มี节气ประจำวันนี้'}`);

console.log('\n📊 Power Score & Rating:');
console.log(`  Power Score: ${dayInfo.powerScore} (-50 to +50)`);
console.log(`  Rating:      ${dayInfo.rating}`);

console.log('\n📝 Summary:');
console.log(`  ${dayInfo.summary}`);

console.log('\n⏰ Hours (12 ช่วงเวลา):');
const hours = getTongShuHours(2024, 6, 21);
hours.slice(0, 6).forEach((h, i) => {
  const auspicious = h.auspicious ? '✅' : '❌';
  console.log(`  ${i + 1}. ${h.hourName} (${h.nameTh}) ${h.timeRange} - ${h.sixtyCycle} ${auspicious}`);
});
console.log(`  ... และอีก ${hours.length - 6} ช่วงเวลา`);
