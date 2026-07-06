@AGENTS.md

# myBaZi — ดวงจีนครบวงจร

เว็บแอปดวงจีน (BaZi/ปาจื้อ) 4 โมดูล: **BaZi** (ดวงสี่เสา), **Tong Shu** (ปฏิทินมงคล), **Qi Men Dun Jia** (ฉีเหมือน), **天机** (เทียนจี AI ที่ปรึกษา). เป้าหมาย: แม่นยำ 100% ใช้งานได้ทุกวัน. ภาษา UI ไทยเป็นหลัก + จีน + พินอญ.

## Tech Stack
- **Next.js 16** (App Router, Turbopack) + **TypeScript strict** + **Tailwind v4** + **shadcn/ui** (style `radix-nova`)
- **tyme4ts** — engine คำนวณดวงจีน (BaZi/Tong Shu/JieQi). API: `SolarTime.fromYmdHms()` → `getLunarHour()` → `getEightChar()` (รุ่น Tyme4 ใหม่ ไม่ใช่ `Solar`/`Lunar` แบบเก่า)
- **zustand** (state + localStorage persist) + **next-themes** + **lucide-react** + **date-fns-tz**
- **OpenAI-compatible client** (fetch ตรง ๆ ไม่ใช้ SDK — รองรับทุก endpoint: z.ai, OpenAI, Gemini-compat)

## คำสั่งที่ใช้บ่อย
```bash
pnpm dev              # dev server (port 3000)
pnpm build            # production build
pnpm typecheck        # tsc --noEmit (ต้องผ่านเสมอ)
pnpm lint             # eslint (ต้อง 0 errors)

# ทดสอบ engine (run ก่อน claim เสร็จ)
pnpm engine:validate  # tyme4ts 18/18 (4 pillars, Li Chun, JieQi)
pnpm engine:audit     # day pillar 4-method verification
pnpm engine:audit-seq # day pillar sequence regression
pnpm bazi:test        # calculator + timezone + hidden stems (21)
pnpm bazi:tst         # True Solar Time (25)
pnpm bazi:luck        # luck pillars (45)
pnpm tongshu:test     # Tong Shu engine
pnpm qimen:test       # Qi Men (30)
pnpm ai:hallucination # Zero Hallucination logic
pnpm ai:context       # BaZi context builder
```

## Architecture
```
src/
├── app/                    # Next.js App Router (1 route ต่อ module)
│   └── bazi/ tongshu/ qimen/ tianji/ settings/ profiles/
├── lib/
│   ├── bazi/               # ★ BaZi engine (Phase 1) — แม่น 100%
│   │   ├── time.ts         # timezone + TST conversion (⚠️ ดู gotchas)
│   │   ├── calculate.ts    # 4 pillars
│   │   ├── strength.ts structure.ts useful-god.ts gods-stars.ts
│   │   ├── luck.ts xkdg.ts elements.ts interactions.ts
│   │   ├── archetypes.ts pinyin.ts   # lookup tables
│   │   └── use-bazi-analysis.ts      # client hook (รวม 7 analyzers)
│   ├── tongshu/            # Tong Shu engine (Phase 3)
│   ├── qimen/              # Qi Men engine (Phase 4, Chai Bu 拆补)
│   ├── ai/                 # 天机 AI (Phase 5): client + bazi-context + intent-detector + dynamic-context + orchestrator (3-layer Zero Hallucination)
│   └── stores/             # zustand + persist (profile, ai-settings, chat) + use-hydrated.ts
├── components/{bazi,tongshu,qimen,tianji,ai,layout,theme,profile}/
└── types/                  # shared TS types
scripts/                    # test scripts (.mjs, run via tsx/node)
docs/                       # audit-report-1993.md, validation.md
```

**Data flow**: `calculateBaZi(profile)` → แต่ละ `analyze*()` → pure data → UI components. Engine = pure functions (testable). UI = client components (hydration-safe).

## Critical Conventions (ห้ามผิด)

1. **Timezone/TST** (`src/lib/bazi/time.ts`): เวลาเกิด → **True Solar Time (TST) default** (ดั้งเดิมแม่นกว่า). Profile มี `birthLongitude?` + `useTrueSolarTime?` (default true). ถ้าไม่ม่ longitude → offset=0 (standard). **ห้ามใช้ `Intl.DateTimeFormat("Asia/Shanghai")` หรือ `fromZonedTime`** เพื่อ format Beijing (ใช้ historical DST ของจีน 1986-1991 → ผิด). ใช้ standard offset (จาก winter) + TST.

2. **Day pillar = 60-cycle สากล** — คำนวณจาก Julian Day. อย่าเปลี่ยน algorithm โดยไม่ verify 4+ methods (ดู `docs/audit-report-1993.md`). 1993-10-12 = 丙寅 (confirm 6 sources).

3. **Luck pillars**: `ChildLimit.fromSolarTime(st, gender)` รับ **gender (1=male/0=female)** ไม่ใช่ direction. tyme4ts คำนวณ forward/backward เอง. ใช้ `cl.isForward()` สำหรับ output.

4. **Qi Men**: Chai Bu 拆补 method. **hour chart (时家奇门) แม่น; day/month/year best-effort + flag TODO** (定局 rules ต่างกัน). อย่า claim แม่นสำหรับ chart type อื่น.

5. **天机 AI (3-layer Zero Hallucination)**:
   - Layer 1: `buildBaZiContext` (13 sections ไทย) ฉีดเข้า system prompt
   - Layer 2: `detectIntent` → ถ้าถามวัน/ปีอื่น → server-side calc (engine แม่น) → inject (AI ห้ามคำนวณเอง)
   - Layer 3: `TIANJI_SYSTEM_PROMPT` ห้ามเดา + ห้ามฟันธงเรื่องสุขภาพร้ายแรง

6. **AI client**: fetch ตรง ๆ (no SDK). api_key ใน localStorage (⚠️ security — แสดง warning ใน UI). ห้าม log api_key.

7. **localStorage + hydration**: zustand persist + `useHydrated*` hooks (pattern ใน `src/lib/stores/use-hydrated.ts`). อย่าอ่าน store ใน SSR โดยตรง → hydration mismatch.

## Workflow (Loop Engineering)
ผู้ใช้ทำงานแบบ loop: **อ่าน → สรุป → วางแผน Phase/Task + DOD → ทำทีละ Task + verify DOD → สรุป**. กฎ:
- **ทีละ Task** (อย่าทำพร้อมกัน)
- ถ้าไม่แน่ใจ → **ถามผู้ใช้** ก่อนทำ
- error → ใช้เป็น feedback → แก้จนผ่าน DOD
- **verify DOD แยก (ห้าม self-approve)**: รัน test + เช็ค output จริง ไม่ใช่เชื่อรายงาน agent
- แจ้ง **security risk** เสมอ (api_key, ข้อมูลวันเกิด)
- จบ Task → สรุป + อัปเดต memory

> ⚠️ **Verification lessons**: executor agent มักรายงานเก่งแต่จริง ๆ พลาด (ไม่สร้างไฟล์จริง, scope creep, typo ในรายงาน, test circular). **verify เองทุก Task**: ไฟล์มีจริง + typecheck/lint/build ผ่าน + รัน engine output จริงเทียบ expected.

## UI Testing — Playwright MCP

เทส UI ผ่าน `mcp__playwright__browser_*` tools. เชื่อมกับ **browserless Docker container** (`pw-chrome`) ผ่าน CDP — ไม่ใช่ local chromium (จำ sudo password ไม่ได้ → ลง system deps ไม่ได้). รายละเอียดเพิ่มเติมดูใน memory `playwright-mcp-setup`.

**Container** (รันอยู่ที่ port **3000**, restart-policy `unless-stopped`, auto-restart กับ Docker Desktop):
```bash
docker run -d --name pw-chrome -p 3000:3000 --shm-size=1gb \
  -e MAX_CONCURRENT_SESSIONS=10 -e TIMEOUT=300000 ghcr.io/browserless/chromium
```
ถ้า container ตาย: `docker start pw-chrome` → ตรวจ `curl -s http://localhost:3000/json/version` (ต้องตอบ Chrome version)

**⚠️ Port conflict**: browserless ใช้ port 3000 = dev server default → **dev ต้องรัน port อื่น**:
```bash
pnpm dev --port 3001
```

**⚠️ Network bridge (WSL2 + Docker Desktop)**: container อยู่ใน Docker Desktop VM คนละ network กับ WSL2 (next dev) → `localhost`/`172.17.0.1` ใน container เข้าถึง dev server ไม่ได้. ต้องตั้ง **Windows netsh portproxy** forward → WSL2 eth0 IP:
```powershell
# ใน PowerShell (Run as Administrator) — แทน <WSL_IP> ด้วยผลของ: ip -4 addr show eth0 | grep -oP 'inet \K[0-9.]+'
# (WSL2 IP เปลี่ยนทุกครั้งที่ restart WSL → ต้อง update ใหม่)
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3001 connectaddress=<WSL_IP> connectport=3001
netsh interface portproxy show v4tov4          # ตรวจ rule
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=3001   # ลบ
```
ทางลัดจาก WSL (elevated prompt จะเด้งบน Windows ให้ approve): ใช้ `powershell.exe Start-Process powershell -Verb RunAs -ArgumentList ...`

**ใช้งาน** — navigate ไป `http://host.docker.internal:3001` (**ไม่ใช่** localhost):
- `browser_navigate` → `http://host.docker.internal:3001` (หน้าแรก), `/bazi`, `/tongshu`, `/tianji`, ...
- `browser_snapshot` → accessibility tree (YAML, อ่าน structure/UI text ได้ทันที เหมาะ verify UI)
- `browser_take_screenshot` → ภาพ (relative path = cwd ของ MCP server = project root)
- `browser_click` / `browser_type` / `browser_console_messages` — 互动 + เช็ค error

**Known cosmetic error**: WebSocket HMR (`_next/webpack-hmr`) ล้มเหลวด้วย `ERR_INVALID_HTTP_RESPONSE` — เพราะ portproxy เป็น TCP layer ไม่ forward WS handshake. **ไม่กระทบการทดสอบ UI** (hot-reload ตอน dev หยุดทำงานเท่านั้น).

**Output dir**: `.playwright-mcp/` (ใน project root) เก็บ snapshot YAML + console log อัตโนมัติ.

## File Locations (สำคัญ)
- Profile type: `src/types/profile.ts` (`birthLongitude`, `useTrueSolarTime`)
- Profile store: `src/lib/stores/profile-store.ts` (`useProfileStoreBase` + hydration hooks)
- BaZi engine entry: `src/lib/bazi/calculate.ts` `calculateBaZi(profile)`
- AI orchestrator: `src/lib/ai/orchestrator.ts` `askTianji({profile, userMessage, settings, history, currentYear})`
- แผนงาน: `PLAN.md` | audit: `docs/audit-report-1993.md` | validation: `docs/validation.md`

## ภาษา
UI ไทยเป็นหลัก + ตัวจีน + พินอญ. Engine output มีทั้งจีน (`name`) + ไทย (`nameTh`) + element maps (`ELEMENT_THAI`). ชื่อ module: ปาจื้อ/八字, ปฏิทินมงคล/通勝, ฉีเหมือน/奇門遁甲, 天机/เทียนจี.
