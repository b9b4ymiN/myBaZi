/**
 * Content Library index — barrel export สำหรับ interpretation layer
 *
 * Data sources (เติมใน C.2-C.4):
 *   TEN_GOD_MEANINGS         — 10 เทพ × domain (C.2)
 *   PALACE_MEANINGS          — 4 palace reading (C.3)
 *   ELEMENT_HEALTH           — ธาตุ → สุขภาพ (C.3)
 *   RELATIONSHIP_APPLICATION — relationship เป็น 用神 (C.4)
 *   LUCK_PHASE_MEANING       — รุ่ง/กลาง/ระวัง (C.4)
 *
 * ทุกอย่าง deterministic (curated data) — no AI generate
 */

export * from "./types";
export { TEN_GOD_MEANINGS } from "./ten-god-meanings";
export { PALACE_MEANINGS } from "./palace-meanings";
export { ELEMENT_HEALTH } from "./element-health";
export { RELATIONSHIP_APPLICATION } from "./useful-god-application";
export { LUCK_PHASE_MEANING } from "./luck-phase";
