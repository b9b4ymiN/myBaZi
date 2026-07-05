/**
 * Thai label mappings for Tong Shu (通勝) data
 * Lookup tables for translating Chinese almanac terms to Thai
 */

// 12 Day Officers (建除十二神) - 12 Day Officers
export const DAY_OFFICER_THAI: Record<string, { nameTh: string; auspicious: boolean; meaning: string }> = {
  "建": { nameTh: "สร้าง", auspicious: true, meaning: "เริ่มต้นสิ่งใหม่, ก่อสร้าง, เปิดกิจการ" },
  "除": { nameTh: "กำจัด", auspicious: true, meaning: "ขจัดสิ่งชั่วร้าย, ทำความสะอาด, รักษาโรค" },
  "满": { nameTh: "เต็ม", auspicious: true, meaning: "สำเร็จสมบูรณ์, เก็บเกี่ยวผล, จัดงานมงคล" },
  "平": { nameTh: "สม่ำเสมอ", auspicious: true, meaning: "กิจกรรมประจำ, ซื้อขาย, ทำสัญญา" },
  "定": { nameTh: "สงบ", auspicious: true, meaning: "วางแผน, ตัดสินใจ, ทำสัญญา, แต่งงาน" },
  "执": { nameTh: "ยึดมั่น", auspicious: true, meaning: "ดำเนินการ, จัดการ, บริหาร" },
  "破": { nameTh: "ทำลาย", auspicious: false, meaning: "หลีกเลี่ยงการเริ่มกิจใหม่, อาจเสียหาย" },
  "危": { nameTh: "อันตราย", auspicious: false, meaning: "ระมัดระวัง, หลีกเลี่ยงกิจสำคัญ" },
  "成": { nameTh: "สำเร็จ", auspicious: true, meaning: "สำเร็จลุล่วง, เก็บเกี่ยวผล, แต่งงาน" },
  "收": { nameTh: "เก็บเกี่ยว", auspicious: false, meaning: "เก็บของ, ปิดบัญชี, หลีกเลี่ยงเริ่มกิจใหม่" },
  "开": { nameTh: "เปิด", auspicious: true, meaning: "เปิดกิจการ, เริ่มต้นสิ่งใหม่, แต่งงาน" },
  "闭": { nameTh: "ปิด", auspicious: false, meaning: "ปิดกิจการ, หยุดกิจกรรม, ซ่อมแซม" }
};

// 12 Yellow/Black Belt Stars (黄黑道十二星) - from getTwelveStar()
export const YELLOW_BLACK_STAR_THAI: Record<string, { nameTh: string; auspicious: boolean }> = {
  "青龙": { nameTh: "มังกรเขียว", auspicious: true }, // Azure Dragon - most auspicious
  "明堂": { nameTh: "ห้องสว่าง", auspicious: true }, // Bright Hall - auspicious
  "天刑": { nameTh: "โทษสวรรค์", auspicious: false }, // Heavenly Punishment - inauspicious
  "朱雀": { nameTh: "นกสีชาด", auspicious: false }, // Vermilion Bird - inauspicious
  "金匮": { nameTh: "หีบทอง", auspicious: true }, // Golden Chest - auspicious
  "天德": { nameTh: "คุณธรรมสวรรค์", auspicious: true }, // Heavenly Virtue - very auspicious
  "白虎": { nameTh: "เสือขาว", auspicious: false }, // White Tiger - inauspicious
  "玉堂": { nameTh: "ห้องหยก", auspicious: true }, // Jade Hall - auspicious
  "天牢": { nameTh: "คุกสวรรค์", auspicious: false }, // Heavenly Prison - inauspicious
  "玄武": { nameTh: "นักรบดำ", auspicious: false }, // Black Tortoise - inauspicious
  "司命": { nameTh: "เทพโชคชะตา", auspicious: true }, // Director of Fate - auspicious
  "勾陈": { nameTh: "ขุนนางวน", auspicious: false } // Coiled Serpent - inauspicious
};

// 28 Constellations (二十八宿)
export const CONSTELLATION_28_THAI: Record<string, { nameTh: string; auspicious: boolean }> = {
  // Eastern Azure Dragon (东方青龙七宿)
  "角": { nameTh: "เขามังกร", auspicious: true },
  "亢": { nameTh: "คอนักรบ", auspicious: false },
  "氐": { nameTh: "รากฐาน", auspicious: true },
  "房": { nameTh: "ที่พัก", auspicious: true },
  "心": { nameTh: "หัวใจ", auspicious: true },
  "尾": { nameTh: "หางมังกร", auspicious: true },
  "箕": { nameTh: "ตะแกงอ้น", auspicious: true },

  // Northern Black Tortoise (北方玄武七宿)
  "斗": { nameTh: "ดาวนกเขา", auspicious: true },
  "牛": { nameTh: "วัว", auspicious: true },
  "女": { nameTh: "สาวใช้", auspicious: false },
  "虚": { nameTh: "ความว่างเปล่า", auspicious: false },
  "危": { nameTh: "อันตราย", auspicious: false },
  "室": { nameTh: "ห้อง", auspicious: true },
  "壁": { nameTh: "กำแพง", auspicious: true },

  // Western White Tiger (西方白虎七宿)
  "奎": { nameTh: "ตะแกรง", auspicious: true },
  "娄": { nameTh: "ดาวดาว", auspicious: true },
  "胃": { nameTh: "กระเพาะ", auspicious: true },
  "昴": { nameTh: "กลุ่มดาวพลูโท", auspicious: true },
  "毕": { nameTh: "ตาข่าย", auspicious: true },
  "觜": { nameTh: "ปากเต่า", auspicious: false },
  "参": { nameTh: "สามดาว", auspicious: true },

  // Southern Red Bird (南方朱雀七宿)
  "井": { nameTh: "บ่อน้ำ", auspicious: true },
  "鬼": { nameTh: "วิญญาณ", auspicious: false },
  "柳": { nameTh: "ต้นหลิว", auspicious: true },
  "星": { nameTh: "ดาว", auspicious: true },
  "张": { nameTh: "ตาข่ายใหญ่", auspicious: true },
  "翼": { nameTh: "ปีก", auspicious: true },
  "轸": { nameTh: "รถม้า", auspicious: true }
};

// 9 Stars (九星)
export const NINE_STAR_THAI: Record<string, { nameTh: string }> = {
  "天枢": { nameTh: "เสาสวรรค์" },
  "天璇": { nameTh: "เสาเหลือง" },
  "天玑": { nameTh: "เสามรกต" },
  "天权": { nameTh: "เสาอำนาจ" },
  "玉衡": { nameTh: "เสาหยก" },
  "开阳": { nameTh: "เสาแห่งความสุข" },
  "摇光": { nameTh: "เสาแสงสว่าง" },
  "洞明": { nameTh: "แสงสว่างลึกซึ้ง" },
  "隐元": { nameTh: "หยกซ่อน" }
};

// Gods and Spirits (神煞)
export const GODS_THAI: Record<string, { nameTh: string; auspicious: boolean }> = {
  // Auspicious gods (吉神)
  "月德": { nameTh: "คุณธรรมประจำเดือน", auspicious: true },
  "天德": { nameTh: "คุณธรรมสวรรค์", auspicious: true },
  "天德合": { nameTh: "ความกลมกลืนแห่งสวรรค์", auspicious: true },
  "月德合": { nameTh: "ความกลมกลืนแห่งเดือน", auspicious: true },
  "天乙贵人": { nameTh: "องค์อุปถัมภ์สวรรค์", auspicious: true },
  "三奇": { nameTh: "สามสิ่งประเสริฐ", auspicious: true },
  "月恩": { nameTh: "พระเคราะห์ประจำเดือน", auspicious: true },
  "天恩": { nameTh: "พระเคราะห์สวรรค์", auspicious: true },
  "天赦": { nameTh: "การอภัยสวรรค์", auspicious: true },
  "五富": { nameTh: "ห้าความมั่งคั่ง", auspicious: true },
  "喜神": { nameTh: "เทพแห่งความปีติ", auspicious: true },
  "禄": { nameTh: "โชคลาภ", auspicious: true },
  "文昌": { nameTh: "ดาวแห่งการศึกษา", auspicious: true },
  "天马": { nameTh: "ม้าสวรรค์", auspicious: true },
  "驿马": { nameTh: "ม้าเดินทาง", auspicious: true },
  "桃花": { nameTh: "ดอกไม้ล้ำ", auspicious: true },
  "六合": { nameTh: "หกความกลมกลืน", auspicious: true },
  "金堂": { nameTh: "ห้องทอง", auspicious: true },
  "宝光": { nameTh: "แสงหยก", auspicious: true },
  "天喜": { nameTh: "ความสุขสวรรค์", auspicious: true },
  "天官": { nameTh: "ขุนนางสวรรค์", auspicious: true },
  "福星": { nameTh: "ดาวแห่งโชคลาภ", auspicious: true },
  "长生": { nameTh: "ความเจริญยาวนาน", auspicious: true },
  "帝旺": { nameTh: "ความรุ่งเรืองสูงสุด", auspicious: true },
  "相生": { nameTh: "การกำเนิดร่วมกัน", auspicious: true },

  // Inauspicious spirits (凶煞)
  "月破": { nameTh: "พระจันทร์แตก", auspicious: false },
  "大耗": { nameTh: "การสูญเสียใหญ่", auspicious: false },
  "小耗": { nameTh: "การสูญเสียน้อย", auspicious: false },
  "天贼": { nameTh: "โจรสวรรค์", auspicious: false },
  "地贼": { nameTh: "โจรโลก", auspicious: false },
  "月煞": { nameTh: "พระจันทร์มรณะ", auspicious: false },
  "月害": { nameTh: "อันตรายประจำเดือน", auspicious: false },
  "月刑": { nameTh: "โทษประจำเดือน", auspicious: false },
  "五鬼": { nameTh: "ห้าวิญญาณ", auspicious: false },
  "往亡": { nameTh: "การจากไป", auspicious: false },
  "归忌": { nameTh: "การหวนกลับ", auspicious: false },
  "死神": { nameTh: "เทพแห่งความตาย", auspicious: false },
  "病符": { nameTh: "ตราโรค", auspicious: false },
  "灾煞": { nameTh: "ภัยพิบัติ", auspicious: false },
  "月空": { nameTh: "ความว่างเปล่า", auspicious: false },
  "朱雀": { nameTh: "นกสีชาด", auspicious: false },
  "白虎": { nameTh: "เสือขาว", auspicious: false },
  "勾陈": { nameTh: "ขุนนางวน", auspicious: false }
};

// Recommended activities (宜)
export const RECOMMEND_THAI: Record<string, { nameTh: string }> = {
  // Daily activities
  "祭祀": { nameTh: "ทำบุญ, สักการะเทพเจ้า" },
  "祈福": { nameTh: "ขอพร, สวดมนต์" },
  "求嗣": { nameTh: "ขอพรให้มีบุตร" },
  "开光": { nameTh: "เปิดเครื่องรูปภาพเทพเจ้า" },
  "塑绘": { nameTh: "สร้างรูปเครื่องรูป" },
  "出行": { nameTh: "เดินทาง" },
  "出火": { nameTh: "จุดไฟใหม่" },
  "移徙": { nameTh: "ย้ายที่อยู่" },
  "修造": { nameTh: "ก่อสร้าง, ซ่อมแซม" },
  "动土": { nameTh: "ขุดดิน, เริ่มก่อสร้าง" },
  "上梁": { nameTh: "ติดตั้งคาน" },
  "安门": { nameTh: "ติดตั้งประตู" },
  "修饰": { nameTh: "ตกแต่ง, ปรับปรุง" },
  "竖柱": { nameTh: "ตั้งเสา" },
  "盖屋": { nameTh: "สร้างบ้าน" },
  "作灶": { nameTh: "สร้างเตา" },
  "安床": { nameTh: "ติดตั้งเตียง" },
  "开渠": { nameTh: "ขุดคลอง" },
  "穿井": { nameTh: "ขุดบ่อน้ำ" },
  "补垣": { nameTh: "ซ่อมกำแพง" },
  "塞穴": { nameTh: "อุดรู" },

  // Major life events
  "嫁娶": { nameTh: "แต่งงาน" },
  "订婚": { nameTh: "หมั้นหมาย" },
  "纳采": { nameTh: "ทำสัญญาแต่งงาน" },
  "问名": { nameTh: "ถามชื่อคู่" },
  "纳吉": { nameTh: "ขอความเป็นสิริมงคล" },
  "纳征": { nameTh: "มอบของหมั้น" },
  "请期": { nameTh: "กำหนดวันแต่งงาน" },
  "安葬": { nameTh: "ฝังศพ" },
  "破土": { nameTh: "ขุดหลุงศพ" },
  "成服": { nameTh: "สวมชุดไว้อาลัย" },
  "除服": { nameTh: "ถอดชุดไว้อาลัย" },
  "移柩": { nameTh: "ย้ายโลงศพ" },
  "启攒": { nameTh: "เปิดโลงศพ" },

  // Business and legal
  "开市": { nameTh: "เปิดกิจการ" },
  "交易": { nameTh: "ค้าขาย, ทำธุรกิจ" },
  "立券": { nameTh: "ทำสัญญา" },
  "纳财": { nameTh: "รับเงิน" },
  "挂匾": { nameTh: "แขวนป้าย" },
  "纳畜": { nameTh: "รับสัตว์เลี้ยง" },
  "牧养": { nameTh: "เลี้ยงสัตว์" },

  // Education and career
  "入学": { nameTh: "เข้าเรียน" },
  "习艺": { nameTh: "ฝึกศิลปะ, ฝีมือ" },
  "上任": { nameTh: "เข้ารับตำแหน่ง" },
  "见士": { nameTh: "พบผู้ใหญ่" },
  "进人口": { nameTh: "รับคนเข้าบ้าน" },

  // Health and daily life
  "治病": { nameTh: "รักษาโรค" },
  "针灸": { nameTh: "ฝังเข็ม" },
  "服药": { nameTh: "ทานยา" },
  "沐浴": { nameTh: "อาบน้ำ" },
  "剃头": { nameTh: "โกนผม" },
  "整手足甲": { nameTh: "ตัดเล็บ" },
  "扫舍": { nameTh: "ทำความสะอาดบ้าน" },
  "修厨": { nameTh: "ซ่อมครัว" },
  "修门": { nameTh: "ซ่อมประตู" }
};

// Activities to avoid (忌)
// Note: These entries combine both recommend and avoid translations
// Some activities appear in both RECOMMEND_THAI and AVOID_THAI
export const AVOID_THAI: Record<string, { nameTh: string }> = {
  "祭祀": { nameTh: "ทำบุญ, สักการะเทพเจ้า" },
  "祈福": { nameTh: "ขอพร, สวดมนต์" },
  "开光": { nameTh: "เปิดเครื่องรูปภาพเทพเจ้า" },
  "嫁娶": { nameTh: "แต่งงาน" },
  "订婚": { nameTh: "หมั้นหมาย" },
  "纳采": { nameTh: "ทำสัญญาแต่งงาน" },
  "安葬": { nameTh: "ฝังศพ" },
  "破土": { nameTh: "ขุดหลุงศพ" },
  "修造": { nameTh: "ก่อสร้าง, ซ่อมแซม" },
  "动土": { nameTh: "ขุดดิน, เริ่มก่อสร้าง" },
  "上梁": { nameTh: "ติดตั้งคาน" },
  "出行": { nameTh: "เดินทาง" },
  "移徙": { nameTh: "ย้ายที่อยู่" },
  "开市": { nameTh: "เปิดกิจการ" },
  "交易": { nameTh: "ค้าขาย, ทำธุรกิจ" },
  "纳财": { nameTh: "รับเงิน" },
  "立券": { nameTh: "ทำสัญญา" },
  "安门": { nameTh: "ติดตั้งประตู" },
  "安床": { nameTh: "ติดตั้งเตียง" },
  "作灶": { nameTh: "สร้างเตา" },
  "盖屋": { nameTh: "สร้างบ้าน" },
  "穿井": { nameTh: "ขุดบ่อน้ำ" },
  "治病": { nameTh: "รักษาโรค" },
  "针灸": { nameTh: "ฝังเข็ม" },
  "入学": { nameTh: "เข้าเรียน" },
  "上任": { nameTh: "เข้ารับตำแหน่ง" },
  "进人口": { nameTh: "รับคนเข้าบ้าน" },
  "纳畜": { nameTh: "รับสัตว์เลี้ยง" },
  "移柩": { nameTh: "ย้ายโลงศพ" },
  "启攒": { nameTh: "เปิดโลงศพ" },
  "沐浴": { nameTh: "อาบน้ำ" },
  "剃头": { nameTh: "โกนผม" }
};

// Hour names (十二时辰)
export const HOUR_THAI: Record<string, { nameTh: string; timeRange: string }> = {
  "子时": { nameTh: "ช่วงราตรี", timeRange: "23:00-01:00" },
  "丑时": { nameTh: "ช่วงเที่ยงคืน", timeRange: "01:00-03:00" },
  "寅时": { nameTh: "ช่วงปลายรุ่ง", timeRange: "03:00-05:00" },
  "卯时": { nameTh: "ช่วงรุ่งอรุณ", timeRange: "05:00-07:00" },
  "辰时": { nameTh: "ช่วงเช้า", timeRange: "07:00-09:00" },
  "巳时": { nameTh: "ช่วงกลางวัน", timeRange: "09:00-11:00" },
  "午时": { nameTh: "ช่วงเที่ยง", timeRange: "11:00-13:00" },
  "未时": { nameTh: "ช่วงบ่าย", timeRange: "13:00-15:00" },
  "申时": { nameTh: "ช่วงบ่ายโมง", timeRange: "15:00-17:00" },
  "酉时": { nameTh: "ช่วงเย็น", timeRange: "17:00-19:00" },
  "戌时": { nameTh: "ช่วงหัวค่ำ", timeRange: "19:00-21:00" },
  "亥时": { nameTh: "ช่วงค่ำ", timeRange: "21:00-23:00" }
};
