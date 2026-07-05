# Baseline Snapshot — ก่อนยกเครื่อง content layer ของ /bazi + หน้าหลัก

> เก็บสภาพ **ก่อนแก้ (BEFORE)** ไว้เทียบ after. บันทึกวันที่ตรวจจากหน้าจริง localhost:3000/bazi
> ตรวจด้วย 2 profile: **น้องฝน** (หญิง, 22 มี.ค. 2537, 丁) = ที่ active ใน browser · **เคสอ้างอิง** (ชาย, 12 ต.ค. 2536 12:55 ลำปาง, 丙) = ที่ผู้ใช้ระบุ

## ไฟล์ในโฟลเดอร์นี้
- `engine-1993-male-lampang.json` — engine output เต็มของเคสอ้างอิง (chart/strength/structure/usefulGod/godsAndStars/luck/elements + narrative + AI context text). ดึงด้วย `pnpm tsx scripts/capture-baseline.mjs`

## Engine snapshot — เคสอ้างอิง (ชาย 1993-10-12 12:55 ลำปาง, TST long 99.5)
| field | ค่า |
|---|---|
| 4 เสา (ปี/เดือน/วัน/ชม.) | 癸酉 · 壬戌 · 丙寅 · 甲午 |
| เจ้าวัน | 丙 (Yang Fire / ไฟหยาง) |
| Strength | strong (score 1) |
| โครงสร้าง | 正格 (normal) |
| 用神 | 金 (wealth) · avoid 木火 |
| ธาตุเด่น/ขาด | 火 / ไม่ขาด |
| ดาว | 羊刃 (blade), 天乙贵人 (nobility), 华盖 (canopy) |
| Luck ปัจจุบัน | 戊午 · ปีนี้ 丙午 |

> หมายเหตุ: day 丙寅 ตรงกับ `docs/audit-report-1993.md` (ยืนยัน 6 แหล่ง). ลำปาง (99.5°) vs กทม. (100.5°) ต่าง 1° ≈ 4 นาที → ไม่พอเปลี่ยน hour pillar (ยัง 甲午)

## Problem Inventory (จากหน้าจริง)

### P0 — คุณภาพ/ความถูกต้อง (ผู้ใช้เห็นแล้วรู้สึก "หยาบ" ทันที)
| # | ปัญหา | หลักฐาน | จุดแก้ |
|---|---|---|---|
| P0-1 | typo ภาษาไทยเพียบใน archetype | "มังสวิกะกสูง", "เขาว่าย", "เบยอาจาระ", "โหม่ง", "ผู้พิพา" | `archetypes.ts` |
| P0-2 | คำแปล 10 Gods **ผิดความหมาย** ขัดกับ description ตัวเอง | 正印/偏印 = "ทรัพย์สินตรง/ทางอ้อม" (จริงคือ 印=ตรา/แม่/ความรู้), "七杀(七นักฆ่า)" ตัวจีนหลุด | `types/bazi-gods-stars.ts:98`, `ten-gods.ts:120` (ซ้ำ 2 ที่) |
| P0-3 | opening ซ้ำคำ | "เจ้าวันแข็ง**มาก: เจ้าวันแข็งมาก** มีพลัง..." | `narrative.ts` opening (levelThai+levelDesc ซ้ำ) |
| P0-4 | ตัวเลข float ดิบไม่ round | "3.5999999999999996 ครั้ง" | `element-composition-view` / weight display |
| P0-5 | applicationTips ยำ primary+secondary+avoid บรรทัดเดียว อ่านไม่รู้เรื่อง | "สีขาว\|ทิศตะวันตก\|อาชีพ...\|สีดำ\|ทิศเหนือ\|อาชีพ...\|หลีกเลี่ยง" | `useful-god.ts` generateApplicationTips |
| P0-6 | clash note ซ้ำ + รก โผล่ 3 ที่ | 戌卯 / 卯戌 พูดเรื่องเดียว 2 รอบ (cautions + summary + structure) | `strength.ts` analyzeClashesAndCombines |
| P0-7 | ดาวแปลผิด | "羊刃 (เลื่อยควาย)" — จริงคือ Blade/คมดาบ | `stars.ts` |
| P0-8 | structure desc ยัด strength.summary ทั้งก้อน + nested วงเล็บ | "Chart เป็นแบบปกติ (เจ้าวัน 丙 แข็ง เพราะ...ℹ️...) มีทั้ง support" | `structure.ts` |

### P1 — ตื้น / generic (ไม่ผูกดวงจริง)
| # | ปัญหา | หลักฐาน |
|---|---|---|
| P1-1 | บุคลิก/จุดแข็ง/จุดระวัง/อาชีพ = archetype ตาม day master ล้วน — คน 丙 ทุกคนเหมือนกัน | `narrative.ts` bullets = archetype.* |
| P1-2 | career intro ขัด bullets | intro "เน้นทรัพย์/ธุรกิจ" แต่ bullets = "นักบำบัด/พยาบาล/นักเขียน" |
| P1-3 | luck timeline มี ten god แต่ไม่ตีความดี/ร้าย (ทั้งที่รู้ 用神=金/水) | `luck-timeline` แสดง 甲子 正印 เฉยๆ |
| P1-4 | strength.factors[].details, stars, interactions, ten-god positions มีข้อมูลลึกแต่ไม่ถูกเล่าเป็น insight | narrative ใช้แค่ level + supporting/weakening |

### P2 — ขาดหัวข้อที่คนดูดวงอยากรู้
| # | หัวข้อที่ขาด | วัตถุดิบใน engine ที่ใช้ได้ |
|---|---|---|
| P2-1 | ความรัก/คู่ครอง | day branch (spouse palace), 桃花, wealth/officer god |
| P2-2 | การเงิน (เจาะ) | wealth god + strength + 用神 |
| P2-3 | สุขภาพ | element imbalance → อวัยวะ (มี tagline แต่ไม่ตีความ) |
| P2-4 | จังหวะเวลา (ปี/ช่วงไหนดี-ระวัง) | luck ten god vs 用神, annual |
| P2-5 | ครอบครัว (พ่อแม่/พี่น้อง/ลูก) | year/month/hour palace + ten gods |

## สรุปวินิจฉัย
Engine แม่น (4 เสา ตรง audit). ปัญหาอยู่ที่ **content/narrative layer**: P0 คุณภาพเนื้อหา → P1 ตื้น/generic → P2 ขาดหัวข้อ. หน้าหลัก (HomeHub) + /bazi ใช้ `buildBaZiNarrative` ตัวเดียว → แก้ layer นี้ได้ทั้ง 2 หน้า
