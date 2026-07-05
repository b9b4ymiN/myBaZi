// Basic tyme4ts sanity test (เก็บไว้สำหรับ engine:test)
// สำหรับ validation เต็มรูปแบบ ใช้ pnpm engine:validate
import { SolarTime } from 'tyme4ts';
const ec = SolarTime.fromYmdHms(1986, 5, 29, 12, 0, 0).getLunarHour().getEightChar();
const ok = ec.getYear().getName() === '丙寅' && ec.getDay().getName() === '癸酉';
console.log(ok ? '✅ engine basic test passed' : '❌ FAIL');
process.exit(ok ? 0 : 1);
