# myBaZi — ดวงจีนครบวงจร

> **รวมทุกศาสตร์จีนในแอปเดียว** — ดวงจีน (ปาจื้อ/BaZi), ปฏิทินมงคล (Tong Shu), ฉีเหมือนตุ้นเจี่ย (Qi Men Dun Jia), และ天机 (เทียนจี) AI ที่ปรึกษา
>
> เป้าหมาย: **แม่นยำ 100% ใช้งานได้ทุกวัน** — engine คำนวณดวงจีนที่ผ่านการ validate ด้วยหลาย methods อิสระ + external almanac

ภาษา UI: **ไทย** เป็นหลัก + ตัวจีน + พินอญ

---

## ✨ Features (4 โมดูล)

### 1. BaZi 八字 (ปาจื้อ — ดวงสี่เสา)
- **Natal Chart**: 4 เสา (ปี/เดือน/วัน/ชั่วโมง) พร้อม Heavenly Stems & Earthly Branches + Hidden Stems
- **Day Master Insight**: วิเคราะห์บุคลิกจากเจ้าวัน + 10 Archetypes
- **Strength of Day Master**: ประเมินความแข็ง/อ่อน (4 ระดับ) พร้อม score breakdown
- **Structure Analysis**: จำแนก Normal/Follower/Vibrant/Special
- **Useful God (用神)**: ธาตุประโยชน์ + คำแนะนำเชิงปฏิบัติ (สี/ทิศ/อาชีพ)
- **Destiny Matrix**: แดชบอร์ดรวม Archetypes + Elements overview
- **Luck Pillars**: เสาโชค 10 ปี + ดวงรายปี + Transit
- **Stars (神煞)**: ดาวมงคล/อัปมงคล + 10 Gods (十神)

### 2. Tong Shu 通勝 (ปฏิทินมงคล)
- **Calendar View**: รายเดือน เลือกวัน พร้อม powerScore badge
- **12 Day Officers** (建除满平定执破危成收开闭)
- **Yellow/Black Belt** (黄黑道 12 ดาว) + **28 Constellations** (二十八宿) + **9 Star**
- **宜/忌** (กิจกรรมมงคล/อัปมงคล) + **Power Score** breakdown
- **XKDG** (玄空大卦) per day + **Personal Resonance** (day master vs วัน) + **Hour Pillars** (12 ช่วง scored)

### 3. Qi Men Dun Jia 奇門遁甲 (ฉีเหมือน)
- **9-Palace Grid** (ผัง 9 ช่อง Lo Shu) แสดง Star/Door/Deity/Stem ครบ
- **4 Chart Types**: รายชั่วโมง/รายวัน/รายเดือน/รายปี
- **Date/Time Picker** + Quick Navigation
- **Destiny View** + **Deity Insight** (8 神 พร้อมคำอธิบายไทย)
- ⚠️ hour chart (时家奇门) แม่นตามตำรา Chai Bu; day/month/year best-effort

### 4. 天机 (เทียนจี) — AI ที่ปรึกษาดวงจีน
- **Personalized Chat**: ถาม-ตอบเรื่องชีวิต (การเงิน/ความรัก/สุขภาพ/การงาน) โดย AI อ้างอิงดวงจริง
- **Zero Hallucination Engine** (3 ชั้น):
  1. Rich BaZi Context ฉีดเข้า prompt (4 เสา + ธาตุ + 10 gods + stars + interactions)
  2. server-side calc แม่น 100% สำหรับวัน/ปีอื่น (AI ไม่ต้องคำนวณเอง)
  3. system prompt ห้ามเดา + ห้ามฟันธงเรื่องร้ายแรง
- **Transit Forecasting**: ถามเรื่องอนาคต ("ปี 2026 เป็นยังไง", "เดือนหน้า")
- **OpenAI-compatible**: ใส่ endpoint + api_key ของคุณเอง (z.ai, OpenAI, Gemini-compat, ฯลฯ)

---

## 🛠 Tech Stack
- **Next.js 16** (App Router, Turbopack) + **TypeScript** (strict) + **Tailwind CSS v4** + **shadcn/ui**
- **tyme4ts** — engine คำนวณดวงจีน (BaZi/Tong Shu/JieQi/60-cycle)
- **zustand** (state + localStorage) + **next-themes** + **lucide-react** + **date-fns-tz**
- **Pure fetch** OpenAI-compatible client (no SDK)

---

## 🚀 Getting Started

### สิ่งที่ต้องการ (Prerequisites)
- Node.js 24+ (ทดสอบบน v24.14)
- pnpm 9+

### ติดตั้ง & รัน
```bash
git clone <repo-url>
cd myBaZi
pnpm install
pnpm dev
```
เปิด **http://localhost:3000**

### Build สำหรับ production
```bash
pnpm build
pnpm start
```

---

## 📖 วิธีใช้งาน

### 1. สร้าง Profile
- ไปที่ **Profile** (top bar) → เพิ่มโปรไฟล์
- กรอก: ชื่อ, เพศ, วันเวลาเกิด, โซนเวลา
- **(แนะนำ)** เปิด **True Solar Time (TST)** + ใส่ **longitude** เมืองเกิด (ค้นจาก Google Maps) เพื่อความแม่นยำสูงสุด

### 2. ใช้ 4 โมดูล
- **ปาจื้อ** (`/bazi`): ดวงสี่เสา + วิเคราะห์เชิงลึก
- **ปฏิทินมงคล** (`/tongshu`): เลือกวันดี/เลี่ยงวันร้าย
- **ฉีเหมือน** (`/qimen`): ผัง 9 ช่อง + เลือกทิศ/จังหวะ
- **天机 AI** (`/tianji`): คุยกับที่ปรึกษา AI

### 3. ตั้งค่า 天机 AI
- ไปที่ **ตั้งค่า** (`/settings`)
- ใส่:
  - **Endpoint**: เช่น `https://api.z.ai/api/coding/paas/v4/chat/completions`
  - **API Key**: ของคุณ (จาก provider)
  - **Model**: เช่น `glm-4.6`, `gpt-4o-mini`
- กด **ทดสอบการเชื่อมต่อ** → สำเร็จแล้วบันทึก
- คุยกับ天机 ได้เลยที่ `/tianji`

---

## 🧪 Testing

Engine ทุก module มี unit test (run ทั้งหมดก่อน deploy):
```bash
pnpm engine:validate   # tyme4ts core (18/18)
pnpm engine:audit      # day pillar 4-method verification
pnpm bazi:test         # calculator + timezone + hidden stems (21)
pnpm bazi:tst          # True Solar Time (25)
pnpm bazi:luck         # luck pillars (45)
pnpm tongshu:test      # Tong Shu engine
pnpm qimen:test        # Qi Men (30)
pnpm ai:hallucination  # Zero Hallucination logic
pnpm typecheck && pnpm lint && pnpm build
```

---

## 🎯 Accuracy & Validation

Engine BaZi ผ่านการ validate ความแม่นยำหลายชั้น:
- **4 methods อิสระ** สำหรับ day pillar (tyme4ts + lunar-javascript + 3 JDN math methods)
- **External almanac** (便民查询网 bmcx.com) confirm
- **Li Chun boundary** edge case แม่น
- **True Solar Time** (ดั่งเดิม) สำหรับ hour pillar แม่นกว่า Beijing standard

ดูรายงานเต็ม: [`docs/audit-report-1993.md`](docs/audit-report-1993.md) + [`docs/validation.md`](docs/validation.md)

---

## 🔒 Security Notes

- **ข้อมูลวันเกิด/เวลาเกิด**: เก็บใน **localStorage ของเบราว์เซอร์** (ไม่ส่งไป server ยกเว้น AI endpoint ที่คุณกำหนด)
- **AI api_key**: เก็บใน localStorage — ⚠️ **ห้ามใช้ในเครื่องสาธารณะ** และควรใช้ key ที่จำกัด usage
- ไม่มี analytics/tracking

---

## 📁 Architecture Overview

```
src/
├── app/                    # Routes (bazi/tongshu/qimen/tianji/settings/profiles)
├── lib/
│   ├── bazi/               # ★ BaZi engine (pure functions, แม่น 100%)
│   ├── tongshu/            # Tong Shu engine
│   ├── qimen/              # Qi Men engine (Chai Bu)
│   ├── ai/                 # 天机 AI (3-layer Zero Hallucination)
│   └── stores/             # zustand + persist
├── components/             # UI (1 folder ต่อ module)
└── types/                  # shared types
```

**หลักการ**: engine = pure functions (testable, deterministic). UI = client components (hydration-safe). ดู [`CLAUDE.md`](CLAUDE.md) สำหรับ conventions + gotchas ที่ละเอียด

---

## 🗺 Roadmap

- ✅ **Phase 0**: Foundation (Next.js + shadcn + profile + layout + theme)
- ✅ **Phase 1**: BaZi engine (4 pillars + strength + structure + useful god + 10 gods + stars + luck + XKDG + elements)
- ✅ **Phase 2**: BaZi UI (Destiny Matrix dashboard)
- ✅ **Phase 3**: Tong Shu (Calendar + Personal Resonance + HoursView)
- ✅ **Phase 4**: Qi Men Dun Jia (9-Palace Grid + 4 chart types)
- ✅ **Phase 5**: 天机 AI (Chat + Zero Hallucination)
- ⏳ **Phase 6**: Polish & Production (PWA + SEO + security review + deploy)

---

## 📜 License

MIT
